import { createServer } from 'http';
import { io as ClientIO } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import { config } from '@src/config/environment';
import { AddressInfo } from 'net';
import { initSocket, pubClient, subClient } from '@src/socket';
import { prisma } from '@src/repository/base/transaction';

let httpServer: ReturnType<typeof createServer>;
let port: number;

beforeAll(async () => {
  httpServer = createServer();
  await initSocket(httpServer);

  await new Promise<void>((resolve) =>
    httpServer.listen(() => {
      port = (httpServer.address() as AddressInfo).port;
      resolve();
    }),
  );

  // ✅ Create test user with role USER
  await prisma.user.create({
    data: {
      id: 'student-42',
      user_name: 'Test User',
      user_email: 'user42@test.com',
      user_password: 'dummy',
      user_role: 'USER', // 👈 updated from STUDENT to USER
    },
  });
}, 15000);

afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: 'student-42' } });

  await new Promise<void>((resolve) => httpServer.close(() => resolve()));

  if (pubClient) await pubClient.quit();
  if (subClient) await subClient.quit();
}, 10000);

test('🔔 Sends a notification to user room', (done) => {
  const token = jwt.sign({ userId: 'student-42', role: 'USER' }, config.JWT_SECRET); // 👈 role in token = USER
  const socket = ClientIO(`http://localhost:${port}/notifications`, {
    auth: { token },
    reconnection: false,
  });

  socket.on('connect', () => {
    socket.emit('send:notification', {
      title: 'Exam Alert',
      message: 'CS101 test at 10 AM',
    });
  });

  socket.on('notification:new', (data) => {
    expect(data.title).toBe('Exam Alert');
    expect(data.message).toBe('CS101 test at 10 AM');
    socket.disconnect();
    done();
  });

  socket.on('connect_error', (err) => {
    done(err);
  });
});
