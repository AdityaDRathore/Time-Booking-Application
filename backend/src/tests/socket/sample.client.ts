import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import { io as ClientIO, Socket } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import { config } from '@src/config/environment';
import { initSocket } from '@src/socket';

let httpServer: Server;
let port: number;

beforeAll((done) => {
  httpServer = createServer();
  initSocket(httpServer);
  httpServer.listen(() => {
    port = (httpServer.address() as AddressInfo).port;
    done();
  });
});

afterAll((done) => {
  httpServer.close(done);
});

const generateToken = (userId: string, role: string) =>
  jwt.sign({ userId, role }, config.JWT_SECRET);

describe('🔌 Sample Client WebSocket Test', () => {
  let clientSocket: Socket;

  afterEach(() => {
    if (clientSocket?.connected) {
      clientSocket.disconnect();
    }
  });

  test('✅ Connects and receives notification', (done) => {
    const token = generateToken('u-client', 'STUDENT');

    clientSocket = ClientIO(`http://localhost:${port}/notifications`, {
      auth: { token },
      reconnection: false,
    });

    clientSocket.on('connect', () => {
      clientSocket.emit('send:notification', {
        title: 'Hello',
        message: 'This is a test',
      });
    });

    clientSocket.on('notification:new', (data) => {
      expect(data.title).toBe('Hello');
      expect(data.message).toBe('This is a test');
      done();
    });

    clientSocket.on('connect_error', done);
  });

  test('📡 Receives lab status update', (done) => {
    const token = generateToken('u-lab', 'STUDENT');

    clientSocket = ClientIO(`http://localhost:${port}/notifications`, {
      auth: { token },
      reconnection: false,
    });

    const expectedLabId = 'lab-123';

    clientSocket.on('connect', () => {
      // Simulate server emitting lab status after short delay
      setTimeout(() => {
        clientSocket.emit('lab:status', {
          labId: expectedLabId,
          isOccupied: true,
        });
      }, 100);
    });

    clientSocket.on('lab:status', (data) => {
      expect(data.labId).toBe(expectedLabId);
      expect(data.isOccupied).toBe(true);
      done();
    });

    clientSocket.on('connect_error', done);
  });
});
