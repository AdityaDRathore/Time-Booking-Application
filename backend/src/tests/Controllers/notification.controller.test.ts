import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '@src/app';
import { PrismaClient } from '@prisma/client';
import { config } from '@src/config/environment'; // adjust if needed

const prisma = new PrismaClient();

let testUserId = '';
let authToken = '';

beforeAll(async () => {
  // Create test user
  const user = await prisma.user.create({
    data: {
      user_email: 'notiftest@example.com',
      user_name: 'Notif User',
      user_password: '123456',
    },
  });

  testUserId = user.id;

  // ✅ Generate a valid JWT for Authorization header
  const token = jwt.sign(
    { userId: testUserId, userRole: 'USER' },
    config.JWT_SECRET,
    { expiresIn: '1h' }
  );

  authToken = `Bearer ${token}`;

  // Seed test notifications
  await prisma.notification.createMany({
    data: [
      {
        user_id: testUserId,
        notification_type: 'BOOKING_CONFIRMATION',
        notification_message: 'Booking confirmed',
      },
      {
        user_id: testUserId,
        notification_type: 'SYSTEM_NOTIFICATION',
        notification_message: 'System alert',
      },
    ],
  });
});

afterAll(async () => {
  await prisma.notification.deleteMany({ where: { user_id: testUserId } });
  await prisma.user.delete({ where: { id: testUserId } });
  await prisma.$disconnect();
});

describe('Notification API', () => {
  it('POST /api/v1/notifications - send notification', async () => {
    const res = await request(app)
      .post('/api/v1/notifications')
      .set('Authorization', authToken)
      .send({
        user_id: testUserId,
        notification_type: 'BOOKING_CONFIRMATION',
        notification_message: 'Test message',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.user_id).toBe(testUserId);
  });

  it('GET /api/v1/notifications - fetch user notifications', async () => {
    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', authToken);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('PATCH /api/v1/notifications/:id/read - mark as read', async () => {
    const notif = await prisma.notification.findFirst({ where: { user_id: testUserId } });

    const res = await request(app)
      .patch(`/api/v1/notifications/${notif!.id}/read`)
      .set('Authorization', authToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.read).toBe(true);
  });

  it('PATCH /api/v1/notifications/read-all - mark all as read', async () => {
    await prisma.notification.updateMany({
      where: { user_id: testUserId },
      data: { read: false },
    });

    const res = await request(app)
      .patch('/api/v1/notifications/read-all')
      .set('Authorization', authToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.updatedCount).toBeGreaterThanOrEqual(0);
  });

  it('DELETE /api/v1/notifications/:id - delete notification', async () => {
    const notif = await prisma.notification.findFirst({ where: { user_id: testUserId } });

    const res = await request(app)
      .delete(`/api/v1/notifications/${notif!.id}`)
      .set('Authorization', authToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(notif!.id);
  });
});
