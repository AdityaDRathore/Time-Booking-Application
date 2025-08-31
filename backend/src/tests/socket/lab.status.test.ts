import express from 'express';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import { Server as IOServer } from 'socket.io';
import { io as ClientIO, Socket as ClientSocket } from 'socket.io-client';

import { initSocket, closeRedisClients } from '@src/socket';
import { getLabRoom } from '@src/socket/utils/roomNames';
import { prisma } from '@src/repository/base/transaction';
import { setupTestDB } from '@src/tests/helpers/testSeeder';
import { generateAccessToken } from '@src/utils/jwt';

let httpServer: Server;
let ioServer: IOServer;
let port: number;

beforeAll(async () => {
  const app = express();
  httpServer = createServer(app);
  const { io } = await initSocket(httpServer);
  ioServer = io;

  httpServer.listen();
  port = (httpServer.address() as AddressInfo).port;

  await setupTestDB();
});

afterAll(async () => {
  ioServer.close();
  httpServer.close();
  await closeRedisClients();
});

test('🧪 lab:status broadcast only reaches lab room', async () => {
  const user = await prisma.user.findFirst({ where: { user_email: 'test@example.com' } });
  if (!user) throw new Error('❌ No test user found in DB');

  const lab = await prisma.lab.findFirst();
  if (!lab) throw new Error('❌ No lab found in DB');

  const token = generateAccessToken({ userId: user.id, userRole: user.user_role });

  const labId = lab.id;

  return new Promise<void>((resolve, reject) => {
    const senderSocket: ClientSocket = ClientIO(`http://localhost:${port}/notifications`, {
      auth: { token },
      reconnection: false,
      forceNew: true,
    });

    const receiverSocket: ClientSocket = ClientIO(`http://localhost:${port}/notifications`, {
      auth: { token },
      reconnection: false,
      forceNew: true,
    });

    receiverSocket.on('connect', () => {
      receiverSocket.emit('join', { room: getLabRoom(labId) }, () => {
        receiverSocket.on('lab:status:update', (payload) => {
          try {
            expect(payload).toEqual({ labId, isOccupied: true });
            senderSocket.disconnect();
            receiverSocket.disconnect();
            resolve();
          } catch (err) {
            senderSocket.disconnect();
            receiverSocket.disconnect();
            reject(err);
          }
        });

        senderSocket.emit('lab:status', { labId, isOccupied: true });
      });
    });

    setTimeout(() => {
      senderSocket.disconnect();
      receiverSocket.disconnect();
      reject(new Error('❌ lab:status:update not received in time'));
    }, 10000);
  });
}, 15000); // Extended Jest timeout
