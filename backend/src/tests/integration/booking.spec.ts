import request from 'supertest';
import app from '@src/app';
import { prisma } from '@src/repository/base/transaction';
import { UserRole } from '@prisma/client';

let orgId = '';
let adminId = '';
let labId = '';
let userId = '';
let slotId = '';
let bookingId = '';

beforeAll(async () => {
  const unique = Date.now().toString();

  // Create organization
  const org = await prisma.organization.create({
    data: {
      org_name: `TestOrg_${unique}`,
      org_type: 'Educational',
      org_location: 'Indore',
    },
  });
  orgId = org.id;

  // Create admin linked to org
  const admin = await prisma.admin.create({
    data: {
      admin_email: `admin_${unique}@example.com`,
      admin_name: 'Admin',
      admin_password: 'adminpass',
      organization: { connect: { id: orgId } },
    },
  });
  adminId = admin.id;

  // Create lab linked to org and admin
  const lab = await prisma.lab.create({
    data: {
      lab_name: `Lab_${unique}`,
      lab_capacity: 10,
      organization: { connect: { id: orgId } },
      admin: { connect: { id: adminId } },
    },
  });
  labId = lab.id;

  // Create user
  const user = await prisma.user.create({
    data: {
      user_email: `user_${unique}@example.com`,
      user_name: 'Test User',
      user_password: 'userpass',
    },
  });
  userId = user.id;

  // Create time slot linked to lab
  const slot = await prisma.timeSlot.create({
    data: {
      lab_id: labId,
      date: new Date(),
      start_time: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      end_time: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    },
  });
  slotId = slot.id;
});

afterAll(async () => {
  try {
    // Cleanup test data
    await prisma.booking.deleteMany({ where: { user_id: userId } });
    await prisma.timeSlot.deleteMany({ where: { lab_id: labId } });
    await prisma.lab.deleteMany({ where: { id: labId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.admin.deleteMany({ where: { id: adminId } });
    await prisma.organization.deleteMany({ where: { id: orgId } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown cleanup error';
    console.warn('⚠️ Cleanup failed:', msg);
  } finally {
    await prisma.$disconnect();
  }
});

describe('Booking Integration Tests', () => {
  it('POST /api/v1/bookings - create a booking', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', 'Bearer mock-token')
      .set('x-test-user-id', userId)
      .set('x-test-user-role', UserRole.USER)
      .send({
        timeSlotId: slotId,
        purpose: 'Integration Test Booking',
        // userId removed here since controller uses req.user.id
      });

    console.log('🧪 POST /bookings response status:', res.statusCode);
    console.log('🧪 POST /bookings response body:', JSON.stringify(res.body, null, 2));

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('purpose', 'Integration Test Booking');

    bookingId = res.body.data.id;
  });

  it('GET /api/v1/bookings/:id - fetch booking by id', async () => {
    const res = await request(app)
      .get(`/api/v1/bookings/${bookingId}`)
      .set('Authorization', 'Bearer mock-token')
      .set('x-test-user-id', userId)
      .set('x-test-user-role', UserRole.USER);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(bookingId);
  });

  it('GET /api/v1/bookings - fetch all bookings (admin)', async () => {
    const res = await request(app)
      .get('/api/v1/bookings')
      .set('Authorization', 'Bearer mock-token')
      .set('x-test-user-id', adminId)
      .set('x-test-user-role', UserRole.ADMIN);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('DELETE /api/v1/bookings/:id - cancel booking', async () => {
    const res = await request(app)
      .delete(`/api/v1/bookings/${bookingId}`)
      .set('Authorization', 'Bearer mock-token')
      .set('x-test-user-id', userId)
      .set('x-test-user-role', UserRole.USER);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.message).toMatch(/canceled successfully/i);
  });
});
