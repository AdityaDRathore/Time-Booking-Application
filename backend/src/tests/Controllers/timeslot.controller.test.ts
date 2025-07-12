import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '@/app';
import { config } from '@/config/environment';
import { prisma as realPrisma } from '@/repository/base/transaction';

// ✅ Partial mock of Prisma – only override timeSlot model
jest.mock('@/repository/base/transaction', () => {
  const actual = jest.requireActual('@/repository/base/transaction');
  return {
    ...actual,
    prisma: {
      ...actual.prisma,
      timeSlot: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
    },
  };
});

import { prisma } from '@/repository/base/transaction'; // now includes mocked timeSlot
import { UserRole } from '@prisma/client';

const mockSlot = {
  id: 'ts1',
  lab_id: 'lab1',
  start_time: new Date('2025-06-17T10:00:00Z'),
  end_time: new Date('2025-06-17T11:00:00Z'),
  date: new Date('2025-06-17'),
  status: 'AVAILABLE',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUser = {
  id: 'admin-id',
  user_name: 'Admin User',
  user_email: 'admin@example.com',
  user_password: 'hashed-password',
  user_role: 'ADMIN',
};

const generateToken = (userId: string) =>
  jwt.sign({ userId, userRole: 'ADMIN' }, config.JWT_SECRET);

describe('TimeSlot Controller', () => {
  const token = generateToken(mockUser.id);

  beforeAll(async () => {
    // Seed real user for JWT auth middleware
    await realPrisma.user.create({
      data: {
        id: 'admin-id',
        user_name: 'Admin User',
        user_email: 'admin@example.com',
        user_password: 'hashed-password',
        user_role: UserRole.ADMIN, // ✅ enum instead of string
      },
    });
  });

  afterAll(async () => {
    await realPrisma.user.delete({ where: { id: mockUser.id } });
    await realPrisma.$disconnect();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new time slot', async () => {
    (prisma.timeSlot.create as jest.Mock).mockResolvedValue(mockSlot);

    const res = await request(app)
      .post('/api/v1/timeslots')
      .set('Authorization', `Bearer ${token}`)
      .send({
        startTime: mockSlot.start_time,
        endTime: mockSlot.end_time,
        labId: mockSlot.lab_id,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.lab_id).toBe('lab1');
  });

  it('should return all time slots', async () => {
    (prisma.timeSlot.findMany as jest.Mock).mockResolvedValue([mockSlot]);

    const res = await request(app)
      .get('/api/v1/timeslots')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe(mockSlot.id);
  });

  it('should return a time slot by ID', async () => {
    (prisma.timeSlot.findUnique as jest.Mock).mockResolvedValue(mockSlot);

    const res = await request(app)
      .get(`/api/v1/timeslots/${mockSlot.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(mockSlot.id);
  });

  it('should return 404 if time slot not found', async () => {
    (prisma.timeSlot.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .get('/api/v1/timeslots/unknown')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('TimeSlot not found');
  });

  it('should delete a time slot', async () => {
    (prisma.timeSlot.findUnique as jest.Mock).mockResolvedValue(mockSlot);
    (prisma.timeSlot.delete as jest.Mock).mockResolvedValue(mockSlot);

    const res = await request(app)
      .delete(`/api/v1/timeslots/${mockSlot.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('TimeSlot deleted successfully');
  });
});
