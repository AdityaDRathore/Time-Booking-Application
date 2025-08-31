import { createServer } from 'http';
import { io as ClientIO, Socket } from 'socket.io-client';
import { initSocket, pubClient, subClient } from '@src/socket';
import jwt from 'jsonwebtoken';
import { config } from '@src/config/environment';
import { AddressInfo } from 'net';
import { prisma } from '@src/repository/base/transaction';

let httpServer: ReturnType<typeof createServer>;
let port: number;

const TEST_USER_ID = 'u1';
const SLOT_ID = 'slot42';

beforeAll(async () => {
  httpServer = createServer();
  await initSocket(httpServer);

  // Clear DB
  // Clean DB state — ✅ delete dependent tables first (child → parent)
  await prisma.notification.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.waitlist.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.lab.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organizationNotification?.deleteMany(); // ✅ Add this line
  await prisma.organization.deleteMany();



  // Seed data
  await prisma.organization.create({
    data: {
      id: 'org1',
      org_name: 'Test Org',
      org_type: 'College',
      org_location: 'Campus',
    },
  });

  await prisma.admin.create({
    data: {
      id: 'admin1',
      admin_name: 'Admin',
      admin_email: 'admin@example.com',
      admin_password: 'secret',
      organizationId: 'org1',
    },
  });

  await prisma.lab.create({
    data: {
      id: 'lab1',
      lab_name: 'Lab A',
      lab_capacity: 5,
      status: 'ACTIVE',
      isOccupied: false,
      location: 'Block A',
      description: 'Test lab',
      organizationId: 'org1',
      adminId: 'admin1',
    },
  });

  await prisma.timeSlot.create({
    data: {
      id: SLOT_ID,
      date: new Date(),
      start_time: new Date(),
      end_time: new Date(Date.now() + 60 * 60 * 1000),
      lab_id: 'lab1',
    },
  });

  await prisma.user.upsert({
    where: { id: TEST_USER_ID },
    update: {},
    create: {
      id: TEST_USER_ID,
      user_name: 'Test User',
      user_email: 'test@example.com',
      user_password: 'secret',
      user_role: 'USER',
    },
  });

  // Start server
  await new Promise<void>((resolve) => {
    httpServer.listen(() => {
      port = (httpServer.address() as AddressInfo).port;
      resolve();
    });
  });
});

afterAll(async () => {
  await prisma.$disconnect();
  await new Promise((resolve) => httpServer.close(resolve));
  if (pubClient?.isOpen) await pubClient.quit();
  if (subClient?.isOpen) await subClient.quit();
});

describe('📅 Booking Events', () => {
  test('✅ booking:create event returns booking:confirmed', (done) => {
    const token = jwt.sign({ userId: TEST_USER_ID, role: 'USER' }, config.JWT_SECRET);

    const socket: Socket = ClientIO(`http://localhost:${port}/notifications`, {
      auth: { token },
      reconnection: false,
    });

    socket.on('connect_error', (err) => {
      socket.disconnect();
      done(err); // Fail test if connection fails
    });

    socket.on('connect', () => {
      socket.emit('booking:create', {
        userId: TEST_USER_ID,
        slotId: SLOT_ID,
      });
    });

    socket.on('booking:confirmed', (data: { bookingId: string }) => {
      try {
        expect(data).toHaveProperty('bookingId');
        expect(typeof data.bookingId).toBe('string');
        done(); // Pass test
      } catch (err) {
        done(err); // Fail test on assertion error
      } finally {
        socket.disconnect();
      }
    });

    // Fail test if no response in time
    setTimeout(() => {
      socket.disconnect();
      done(new Error('❌ booking:confirmed not received in time'));
    }, 8000);
  }, 10000);
});
