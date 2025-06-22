import { createServer, Server } from 'http';
import { io as Client, Socket } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import { AddressInfo } from 'net';

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

describe('📡 Lab Status Delivery', () => {
  test('🚦 status change is broadcast to other clients', (done) => {
    const tokenA = generateToken('userA', 'STUDENT');
    const tokenB = generateToken('userB', 'STUDENT');

    const socketA: Socket = Client(`http://localhost:${port}/notifications`, {
      auth: { token: tokenA },
      reconnection: false,
    });

    const socketB: Socket = Client(`http://localhost:${port}/notifications`, {
      auth: { token: tokenB },
      reconnection: false,
    });

    socketB.on('lab:status:update', (data) => {
      expect(data.labId).toBe('lab-123');
      expect(data.isOccupied).toBe(true);

      socketA.disconnect();
      socketB.disconnect();
      done();
    });

    socketB.on('connect', () => {
      // Wait for B to be ready before A emits
      socketA.on('connect', () => {
        socketA.emit('lab:status', {
          labId: 'lab-123',
          isOccupied: true,
        });
      });
    });

    socketA.on('connect_error', done);
    socketB.on('connect_error', done);
  });
});
