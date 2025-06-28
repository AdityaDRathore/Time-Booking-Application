// Load test environment config
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as ClientIO, Socket } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import { config } from '@src/config/environment';
import { initSocket, closeRedisClients } from '@src/socket';
import { prisma } from '@src/repository/base/transaction';
import { AddressInfo } from 'net';

let httpServer: ReturnType<typeof createServer>;
let port: number;

beforeAll(async () => {
  httpServer = createServer();
  await initSocket(httpServer);

  await new Promise<void>((resolve) => {
    httpServer.listen(() => {
      port = (httpServer.address() as AddressInfo).port;
      resolve();
    });
  });

  // 🧹 Clean DB in FK-safe order
  await prisma.notification.deleteMany();
  await prisma.waitlist.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.organizationNotification.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.lab.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.superAdmin.deleteMany();

  // 🌱 Seed data
  await prisma.organization.create({
    data: {
      id: 'org123',
      org_name: 'Concurrent Org',
      org_type: 'University',
      org_location: 'Test City',
    },
  });

  await prisma.admin.create({
    data: {
      id: 'admin123',
      admin_name: 'Admin',
      admin_email: 'admin@org.com',
      admin_password: 'test123',
      organizationId: 'org123',
    },
  });

  await prisma.lab.create({
    data: {
      id: 'lab1',
      lab_name: 'Concurrent Lab',
      lab_capacity: 2,
      status: 'ACTIVE',
      isOccupied: false,
      location: 'Concurrent Block',
      description: 'Testing concurrency',
      organizationId: 'org123',
      adminId: 'admin123',
    },
  });

  await prisma.timeSlot.create({
    data: {
      id: 'slot1',
      date: new Date(),
      start_time: new Date(),
      end_time: new Date(Date.now() + 60 * 60 * 1000),
      lab_id: 'lab1',
    },
  });

  await prisma.user.createMany({
    data: [
      {
        id: 'u1',
        user_name: 'User 1',
        user_email: 'u1@test.com',
        user_password: 'pass1',
        user_role: 'USER',
      },
      {
        id: 'u2',
        user_name: 'User 2',
        user_email: 'u2@test.com',
        user_password: 'pass2',
        user_role: 'USER',
      },
      {
        id: 'u3',
        user_name: 'User 3',
        user_email: 'u3@test.com',
        user_password: 'pass3',
        user_role: 'USER',
      },
    ],
  });
});

afterAll(async () => {
  await new Promise((resolve) => httpServer.close(resolve));
  await closeRedisClients();
  await prisma.$disconnect();
});

test('👥 Multiple users book simultaneously and receive confirmation or waitlist', (done) => {
  const userIds = ['u1', 'u2', 'u3'];
  const tokens = userIds.map((id) =>
    jwt.sign({ userId: id, role: 'USER' }, config.JWT_SECRET, {
      expiresIn: '1h',
    })
  );

  let responded = 0;
  const sockets: Socket[] = [];

  userIds.forEach((uid, index) => {
    const socket = ClientIO(`http://localhost:${port}/notifications`, {
      auth: { token: tokens[index] },
      reconnection: false,
    });

    sockets.push(socket);

    socket.on('connect', () => {
      socket.emit('booking:create', {
        userId: uid,
        slotId: 'slot1',
        purpose: 'Concurrency test',
      });
    });

    socket.on('booking:confirmed', (data: { bookingId: string }) => {
      expect(data.bookingId).toBeDefined();
      cleanup(socket);
    });

    socket.on('booking:waitlisted', (data: { position: number }) => {
      expect(data.position).toBeGreaterThan(0);
      cleanup(socket);
    });

    socket.on('connect_error', (err) => {
      done(err);
    });
  });

  function cleanup(socket: Socket) {
    socket.disconnect();
    responded++;
    if (responded === userIds.length) {
      done();
    }
  }

  setTimeout(() => {
    sockets.forEach((s) => s.disconnect());
    done(new Error('❌ Not all users received a response in time'));
  }, 8000);

});
