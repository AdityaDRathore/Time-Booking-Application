import request from 'supertest';
import app from '@/app';  // <-- import your express app here
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let testUserId = '';
let authToken = '';

beforeAll(async () => {
  // Create test user
  const user = await prisma.user.create({
    data: {
      user_email: 'testuser@example.com',
      user_name: 'Test User',
      user_password: 'hashedpassword', // adapt if hashing needed
    },
  });
  testUserId = user.id;

  // Simulate auth token (mock or generate real one as per your app)
  authToken = 'test-token-or-jwt';

  // Create some notifications for user
  await prisma.notification.createMany({
    data: [
      {
        user_id: testUserId,
        notification_type: 'BOOKING_CONFIRMATION',
        notification_message: 'Welcome notification',
      },
      {
        user_id: testUserId,
        notification_type: 'SYSTEM_NOTIFICATION',
        notification_message: 'System notification',
      },
    ],
  });
});

afterAll(async () => {
  // Clean up test data
  await prisma.notification.deleteMany({ where: { user_id: testUserId } });
  await prisma.user.delete({ where: { id: testUserId } });
});

describe('Notification API', () => {
  it('POST /api/v1/notifications - success', async () => {
    const res = await request(app)
      .post('/api/v1/notifications')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        user_id: testUserId,
        notification_type: 'BOOKING_CONFIRMATION',  // updated here
        notification_message: 'Test notification message',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('notification_message', 'Test notification message');
  });

  it('POST /api/v1/notifications - validation error', async () => {
    const res = await request(app)
      .post('/api/v1/notifications')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        user_id: 'invalid-uuid',
        notification_type: 'UNKNOWN_TYPE', // invalid on purpose
        notification_message: '',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/Validation failed/i);
  });

  it('GET /api/v1/notifications - fetch user notifications', async () => {
    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('PATCH /api/v1/notifications/:id/read - mark notification as read', async () => {
    // First get a notification ID
    const notifications = await prisma.notification.findMany({ where: { user_id: testUserId } });
    const notifId = notifications[0].id;

    const res = await request(app)
      .patch(`/api/v1/notifications/${notifId}/read`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('is_read', true);
  });

  it('PATCH /api/v1/notifications/read-all - mark all as read', async () => {
    const res = await request(app)
      .patch('/api/v1/notifications/read-all')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  it('DELETE /api/v1/notifications/:id - delete notification', async () => {
    const notifications = await prisma.notification.findMany({ where: { user_id: testUserId } });
    const notifId = notifications[0].id;

    const res = await request(app)
      .delete(`/api/v1/notifications/${notifId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
  });
});
