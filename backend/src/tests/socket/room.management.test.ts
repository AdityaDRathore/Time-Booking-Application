import { createServer } from 'http';
import { io as ClientIO, Socket } from 'socket.io-client';
import { initSocket } from '@src/socket';
import jwt from 'jsonwebtoken';
import { config } from '@src/config/environment';
import { AddressInfo } from 'net';

let httpServer: ReturnType<typeof createServer>;
let port: number;

beforeAll((done) => {
  httpServer = createServer();
  initSocket(httpServer); // Socket server setup
  httpServer.listen(() => {
    port = (httpServer.address() as AddressInfo).port;
    done();
  });
});

afterAll((done) => {
  httpServer.close(done);
});

// Helper to create JWT tokens
const generateToken = (userId: string, role: string) =>
  jwt.sign({ userId, role }, config.JWT_SECRET);

describe('🧪 Room Management', () => {
  test('🎯 Only students receive student notifications', (done) => {
    const studentToken = generateToken('student-1', 'STUDENT');
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

    // Fail fast on errors
    studentSocket.on('connect_error', done);
    adminSocket.on('connect_error', done);

    // Emit notification after both are connected
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
      }, 300); // Give time for events to propagate
    }, 200);
  });
});
