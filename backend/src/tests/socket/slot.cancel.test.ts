import { createServer } from 'http';
import { io as ClientIO, Socket } from 'socket.io-client';
import { AddressInfo } from 'net';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

import { config } from '@src/config/environment';
import { initSocket, io, pubClient, subClient } from '@src/socket';
import { setupTestDB } from '@src/tests/helpers/testSeeder';

const prisma = new PrismaClient();
let httpServer: ReturnType<typeof createServer>;
let port: number;

beforeAll(async () => {
  await setupTestDB(); // 🧪 Manual test DB setup

  httpServer = createServer();
  initSocket(httpServer);

  await new Promise<void>((resolve) => {
    httpServer.listen(() => {
      port = (httpServer.address() as AddressInfo).port;
      resolve();
    });
  });
});

afterAll(async () => {
  if (pubClient) await pubClient.quit();
  if (subClient) await subClient.quit();
  io.close();
  httpServer.close();
  await prisma.$disconnect();
});

const generateToken = (userId: string) =>
  jwt.sign({ userId, userRole: 'USER' }, config.JWT_SECRET);

test(
  '🗑️ slot:cancel emits booking:cancelled and slot:available',
  async () => {
    const senderUser = await prisma.user.findUnique({ where: { id: 'u1' } });
    const receiverUser = await prisma.user.findUnique({ where: { id: 'u2' } });

    if (!senderUser || !receiverUser) {
      throw new Error('❌ Seeded users u1 or u2 not found');
    }

    const senderToken = generateToken(senderUser.id);
    const receiverToken = generateToken(receiverUser.id);

    const senderSocket: Socket = ClientIO(`http://localhost:${port}/notifications`, {
      auth: { token: senderToken },
      reconnection: false,
    });

    const receiverSocket: Socket = ClientIO(`http://localhost:${port}/notifications`, {
      auth: { token: receiverToken },
      reconnection: false,
    });

    let receivedCancel = false;
    let receivedAvailable = false;

    const cleanup = () => {
      senderSocket.disconnect();
      receiverSocket.disconnect();
    };

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('❌ Did not receive all events in time'));
      }, 4000);

      const handleError = (err: any) => {
        clearTimeout(timeout);
        cleanup();
        reject(err);
      };

      receiverSocket.on('connect_error', handleError);
      senderSocket.on('connect_error', handleError);

      receiverSocket.on('booking:cancelled', (data) => {
        try {
          expect(data.bookingId).toBe('booking-123');
          receivedCancel = true;
        } catch (err) {
          handleError(err);
        }
      });

      receiverSocket.on('slot:available', (data) => {
        try {
          expect(data.slotId).toBe('slot-123');
          receivedAvailable = true;
        } catch (err) {
          handleError(err);
        }
      });

      let connectedCount = 0;
      const checkReady = () => {
        if (++connectedCount === 2) {
          receiverSocket.emit('join', { room: `slot:slot-123` }, () => {
            setTimeout(() => {
              senderSocket.emit('slot:cancel', {
                bookingId: 'booking-123',
                slotId: 'slot-123',
              });
            }, 100);
          });
        }
      };

      senderSocket.on('connect', checkReady);
      receiverSocket.on('connect', checkReady);

      setTimeout(() => {
        try {
          expect(receivedCancel).toBe(true);
          expect(receivedAvailable).toBe(true);
          clearTimeout(timeout);
          cleanup();
          resolve();
        } catch (err) {
          handleError(err);
        }
      }, 3500);
    });
  },
  6000
);
