import { createServer } from 'http';
import { io as ClientIO } from 'socket.io-client';
import { initSocket, pubClient, subClient } from '@src/socket';
import jwt from 'jsonwebtoken';
import { config } from '@src/config/environment';
import { AddressInfo } from 'net';
import { prisma } from '@src/repository/base/transaction';
import { emitAdminStatus } from '@src/socket/events/admin.events';
import { Server } from 'socket.io';

let io: Server;
let httpServer: ReturnType<typeof createServer>;
let port: number;

beforeAll(async () => {
  httpServer = createServer();
  const result = await initSocket(httpServer);
  io = result.io;

  await new Promise<void>((resolve) =>
    httpServer.listen(() => {
      port = (httpServer.address() as AddressInfo).port;
      resolve();
    })
  );

  await prisma.user.deleteMany({ where: { user_email: 'admin@test.com' } });

  await prisma.user.create({
    data: {
      id: 'admin-1',
      user_name: 'Test Admin',
      user_email: 'admin@test.com',
      user_password: 'dummy',
      user_role: 'ADMIN',
    },
  });
}, 15000);

afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: 'admin-1' } });

  await new Promise<void>((resolve, reject) =>
    httpServer.close((err) => (err ? reject(err) : resolve()))
  );

  if (pubClient) await pubClient.quit();
  if (subClient) await subClient.quit();
}, 10000);

test(
  '🛠️ Admin dashboard receives system status',
  async () => {
    const token = jwt.sign({ userId: 'admin-1', role: 'ADMIN' }, config.JWT_SECRET);

    const socket = ClientIO(`http://localhost:${port}/notifications`, {
      auth: { token },
      reconnection: false,
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connect error:', err);
    });

    const systemStatus = new Promise<void>((resolve) => {
      socket.on('admin:system:status', (data) => {
        expect(data).toHaveProperty('uptime');
        expect(data).toHaveProperty('activeUsers');
        resolve();
      });
    });

    const analyticsData = new Promise<void>((resolve, reject) => {
      socket.on('admin:analytics', (data) => {
        try {
          expect(data).toHaveProperty('totalBookings');
          expect(data).toHaveProperty('activeLabs');
          resolve();
        } catch (err) {
          reject(err);
        } finally {
          socket.disconnect();
        }
      });
    });

    await new Promise<void>((resolve, reject) => {
      socket.on('connect', () => {
        socket.emit('admin:subscribe', async () => {
          await emitAdminStatus(io); // ✅ emit only once, after subscribe confirmation
          resolve();
        });
      });
      socket.on('connect_error', reject);
    });

    await Promise.all([systemStatus, analyticsData]);
  },
  20000
);
