import request from 'supertest';
import app from '@src/app';
import { prisma } from '@src/repository/base/transaction';
import { UserRole } from '@prisma/client';
import { generateAccessToken as signJwt } from '@src/utils/jwt';
import { setupTestDB, disconnectDB } from '@src/tests/helpers/testSeeder';

describe('🔐 Booking Authorization Tests', () => {
  let userA: any, userB: any, admin: any;
  let tokenA: string, tokenB: string, adminToken: string;
  let bookingId: string;
  let slotId: string;

  beforeAll(async () => {
    await setupTestDB();

    const org = await prisma.organization.create({
      data: {
        org_name: 'AuthOrg',
        org_type: 'Educational',
        org_location: 'Test City',
      },
    });

    admin = await prisma.user.create({
      data: {
        user_email: 'admin@test.com',
        user_name: 'Admin',
        user_password: 'pass',
        user_role: UserRole.ADMIN,
      },
    });

    await prisma.admin.create({
      data: {
        id: admin.id,
        admin_name: admin.user_name,
        admin_email: admin.user_email,
        admin_password: admin.user_password,
        organizationId: org.id,
      },
    });

    const lab = await prisma.lab.create({
      data: {
        lab_name: 'Auth Lab',
        lab_capacity: 5,
        admin: { connect: { id: admin.id } },
        organization: { connect: { id: org.id } },
      },
    });

    const slot = await prisma.timeSlot.create({
      data: {
        lab_id: lab.id,
        date: new Date(),
        start_time: new Date(Date.now() + 60 * 60 * 1000),
        end_time: new Date(Date.now() + 2 * 60 * 60 * 1000),
      },
    });

    slotId = slot.id;

    userA = await prisma.user.create({
      data: {
        user_email: 'userA@test.com',
        user_name: 'User A',
        user_password: 'pass',
        user_role: UserRole.USER,
      },
    });

    userB = await prisma.user.create({
      data: {
        user_email: 'userB@test.com',
        user_name: 'User B',
        user_password: 'pass',
        user_role: UserRole.USER,
      },
    });

    tokenA = signJwt({ userId: userA.id, userRole: userA.user_role });
    tokenB = signJwt({ userId: userB.id, userRole: userB.user_role });
    adminToken = signJwt({ userId: admin.id, userRole: admin.user_role });

    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-test-user-id', userA.id)
      .set('x-test-user-role', userA.user_role)
      .send({
        timeSlotId: slotId,
        purpose: 'Booking by A',
      });

    console.log('🔍 Booking response:', res.statusCode, res.body);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();

    bookingId = res.body.data.id;
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('❌ User B cannot delete User A’s booking', async () => {
    const res = await request(app)
      .delete(`/api/v1/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .set('x-test-user-id', userB.id)
      .set('x-test-user-role', userB.user_role);

    expect([403, 404]).toContain(res.statusCode);
  });

  it('❌ User B cannot fetch User A’s booking by ID', async () => {
    const res = await request(app)
      .get(`/api/v1/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .set('x-test-user-id', userB.id)
      .set('x-test-user-role', userB.user_role);

    expect([403, 404]).toContain(res.statusCode);
  });

  it('✅ Admin can fetch all bookings', async () => {
    const res = await request(app)
      .get('/api/v1/bookings')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-test-user-id', admin.id)
      .set('x-test-user-role', admin.user_role);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('❌ Request without token is rejected with 401', async () => {
    const res = await request(app).get(`/api/v1/bookings/${bookingId}`);
    expect(res.statusCode).toBe(401);
  });
});
