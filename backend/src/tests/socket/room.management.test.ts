import { createServer } from 'http';
import { io as ClientIO, Socket } from 'socket.io-client';
import { initSocket, pubClient, subClient } from '@src/socket';
import jwt from 'jsonwebtoken';
import { config } from '@src/config/environment';
import { AddressInfo } from 'net';
import { prisma } from '@src/repository/base/transaction';

let httpServer: ReturnType<typeof createServer>;
let port: number;

beforeAll(async () => {
  httpServer = createServer();
  await initSocket(httpServer);

  // 🧹 Clean up existing users with those emails
  await prisma.user.deleteMany({
    where: {
      user_email: { in: ['student@test.com', 'admin@test.com'] },
    },
  });

  // ✅ Insert test users
  await prisma.user.createMany({
    data: [
      {
        id: 'student-1',
        user_name: 'Student Test',
        user_email: 'student@test.com',
        user_password: 'dummy',
        user_role: 'USER',
      },
      {
        id: 'admin-1',
        user_name: 'Admin Test',
        user_email: 'admin@test.com',
        user_password: 'dummy',
        user_role: 'ADMIN',
      },
    ],
  });

  await new Promise<void>((resolve) => {
    httpServer.listen(() => {
      port = (httpServer.address() as AddressInfo).port;
      resolve();
    });
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      user_email: { in: ['student@test.com', 'admin@test.com'] },
    },
  });

  if (httpServer) httpServer.close();
  if (pubClient) await pubClient.quit();
  if (subClient) await subClient.quit();
});

// Helper to create JWT tokens
const generateToken = (userId: string, role: string) =>
  jwt.sign({ userId, role }, config.JWT_SECRET);

describe('🧪 Room Management', () => {
  test('🎯 Only students receive student notifications', (done) => {
    const studentToken = generateToken('student-1', 'USER');
    const adminToken = generateToken('admin-1', 'ADMIN');

    const studentSocket: Socket = ClientIO(`http://localhost:${port}/notifications`, {
      auth: { token: studentToken },
      reconnection: false,
    });

    const adminSocket: Socket = ClientIO(`http://localhost:${port}/notifications`, {
      auth: { token: adminToken },
      reconnection: false,
    });

    let studentReceived = false;
    let adminReceived = false;

    studentSocket.on('notification:new', (msg) => {
      studentReceived = true;
      expect(msg).toEqual({
        title: 'Test',
        message: 'Student only',
      });
    });

    adminSocket.on('notification:new', () => {
      adminReceived = true;
    });

    studentSocket.on('connect_error', done);
    adminSocket.on('connect_error', done);

    setTimeout(() => {
      studentSocket.emit('send:notification', {
        title: 'Test',
        message: 'Student only',
      });

      setTimeout(() => {
        expect(studentReceived).toBe(true);
        expect(adminReceived).toBe(false);

        studentSocket.disconnect();
        adminSocket.disconnect();
        done();
      }, 300);
    }, 200);
  });
});
