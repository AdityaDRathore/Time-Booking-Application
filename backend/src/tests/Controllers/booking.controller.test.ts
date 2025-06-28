import request from 'supertest';
import app from '@src/app';
import { prisma } from '@src/repository/base/transaction';
import { getTokenForUser } from '@tests/helpers/authHelper';

describe('Booking Controller', () => {
  let userToken: string;
  let adminToken: string;
  let testBookingId: string;

  beforeAll(async () => {
    userToken = await getTokenForUser('user1@example.com', 'dummy1');
    adminToken = await getTokenForUser('admin@example.com', 'adminpass');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a booking', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ timeSlotId: 'slot123', purpose: 'Test Booking' });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    testBookingId = res.body.data.id;
  });

  it('should return all bookings', async () => {
    const res = await request(app)
      .get('/api/v1/bookings')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return booking by ID', async () => {
    const res = await request(app)
      .get(`/api/v1/bookings/${testBookingId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(testBookingId);
  });

  it('should return 404 for unknown booking', async () => {
    const res = await request(app)
      .get('/api/v1/bookings/nonexistent')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  it('should cancel a booking', async () => {
    const res = await request(app)
      .delete(`/api/v1/bookings/${testBookingId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.message).toMatch(/canceled/i);
  });

  it('should return 400 for validation failure', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ purpose: '' }); // Missing timeSlotId

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/validation/i);
  });

  it('should return 401 if user not authenticated', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .send({ timeSlotId: 'slot123', purpose: 'Unauthorized booking' });

    expect(res.status).toBe(401);
    expect(res.body.error.message).toMatch(/unauthorized/i);
  });

  it('should return 403 for unauthorized access to booking', async () => {
    // Assuming user2 did not make this booking
    const token2 = await getTokenForUser('user2@example.com', 'dummy2');

    const res = await request(app)
      .get(`/api/v1/bookings/${testBookingId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect([403, 404]).toContain(res.status); // Depending on booking deletion
  });

  it('should return 500 on booking creation error', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ timeSlotId: 'invalid-slot-id', purpose: 'Failure' });

    expect([400, 500]).toContain(res.status);
    expect(res.body.error.message).toMatch(/failed to create booking/i);
  });
});
