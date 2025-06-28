// Load .env.test first
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import { initSocket } from '@src/socket';
import { config } from '@src/config/environment';
import { AddressInfo } from 'net';
import { pubClient, subClient } from '@src/socket';
import { prisma } from '@src/repository/base/transaction';

let httpServer: ReturnType<typeof createServer>;
let port: number;

// Setup test user before running socket server
beforeAll(async () => {
  // Seed test user
  await prisma.user.upsert({
    where: { id: 'test-user-id' },
    update: {},
    create: {
      id: 'test-user-id',
      user_name: 'Socket Test User',
      user_email: 'socket@example.com',
      user_password: 'irrelevant',
      user_role: 'USER',
    },
  });

  httpServer = createServer();
  initSocket(httpServer);
  await new Promise<void>((resolve) => {
    httpServer.listen(() => {
      port = (httpServer.address() as AddressInfo).port;
      resolve();
    });
  });
});

// Cleanup
afterAll(async () => {
  await prisma.user.delete({ where: { id: 'test-user-id' } }).catch(() => { });

  await new Promise<void>((resolve, reject) => {
    httpServer.close((err?: Error) => {
      if (err) return reject(err);
      resolve();
    });
  });

  if (pubClient?.isOpen) await pubClient.disconnect();
  if (subClient?.isOpen) await subClient.disconnect();
});

test('✅ valid token connects successfully', (done) => {
  const token = jwt.sign(
    { userId: 'test-user-id', role: 'USER' },
    config.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const client = Client(`http://localhost:${port}/notifications`, {
    auth: { token },
    reconnection: false,
  });

  client.on('connect', () => {
    expect(client.connected).toBe(true);
    client.close();
    done();
  });

  client.on('connect_error', (err) => {
    done(err); // Fail if error triggered
  });
});

test('❌ invalid token rejected', (done) => {
  const client = Client(`http://localhost:${port}/notifications`, {
    auth: { token: 'BAD_TOKEN' },
    reconnection: false,
  });

  client.on('connect', () => {
    done(new Error('Should not connect with invalid token!'));
  });

  client.on('connect_error', (err: any) => {
    expect(err.message).toMatch(/Unauthorized|Invalid/i);
    client.close();
    done();
  });
});
