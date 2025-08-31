import { Server } from 'http';
import { io as Client, Socket } from 'socket.io-client';
import { AddressInfo } from 'net';
import { createTestServer } from '@src/tests/helpers/createTestServer';
import { generateAccessToken } from '@src/utils/jwt';
import { getLabRoom } from '@src/socket/utils/roomNames';
import { prisma } from '@src/repository/base/transaction';

let httpServer: Server;
let port: number;
let socketA: Socket;
let socketB: Socket;
let testLabId: string;
let closeServer: () => Promise<void>;

beforeAll(async () => {
  const { server, port: p, close } = await createTestServer();
  httpServer = server;
  port = p;
  closeServer = close;

  // Find a valid lab for testing
  const lab = await prisma.lab.findFirst({ where: { status: 'ACTIVE' } });
  if (!lab) throw new Error('No lab found for test.');
  testLabId = lab.id;
});

afterEach(() => {
  if (socketA?.connected) socketA.disconnect();
  if (socketB?.connected) socketB.disconnect();
});

afterAll(async () => {
  await closeServer();
});

test('🚦 status change is broadcast to other clients', async () => {
  const tokenA = generateAccessToken({ userId: 'u1', userRole: 'USER' });
  const tokenB = generateAccessToken({ userId: 'u2', userRole: 'USER' });

  socketA = Client(`http://localhost:${port}/notifications`, {
    auth: { token: tokenA },
    reconnection: false,
  });

  socketB = Client(`http://localhost:${port}/notifications`, {
    auth: { token: tokenB },
    reconnection: false,
  });

  const room = getLabRoom(testLabId);

  await new Promise<void>((resolve, reject) => {
    let joined = 0;
    const timeout = setTimeout(() => reject(new Error('Socket join timeout')), 8000);

    const onJoin = () => {
      joined++;
      if (joined === 2) {
        clearTimeout(timeout);
        resolve();
      }
    };

    socketA.on('connect', () => {
      socketA.emit('join', { room }, onJoin);
    });

    socketB.on('connect', () => {
      socketB.emit('join', { room }, onJoin);
    });
  });

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('❌ Test timed out waiting for lab:status:update'));
    }, 8000);

    socketB.on('lab:status:update', (data) => {
      expect(data).toMatchObject({ labId: testLabId, isOccupied: true });
      clearTimeout(timeout);
      resolve();
    });

    socketA.emit('lab:status', { labId: testLabId, isOccupied: true });
  });
});
