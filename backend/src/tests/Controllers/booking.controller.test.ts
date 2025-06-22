jest.mock('@src/middleware/validate.middleware', () => () => (_req: any, _res: any, next: any) => next());

import request from 'supertest';
import app from '@src/app';
import { prisma } from '@src/repository/base/transaction';
import { UserRole } from '@prisma/client';

jest.mock('@src/repository/base/transaction', () => ({
  prisma: {
    booking: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('@src/middleware/auth.middleware', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { id: 'user123', role: UserRole.ADMIN };
    next();
  },
  checkRole: () => (_req: any, _res: any, next: any) => next(),
  loginRateLimiter: (_req: any, _res: any, next: any) => next(),
}));

describe('Booking Controller', () => {
  const mockBooking = {
    id: 'mock-booking-id',
    userId: 'user123',
    timeSlotId: 'slot123',
    purpose: 'Test Booking',
    booking_status: 'CONFIRMED',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'user123',
      name: 'Mock User',
      email: 'user@example.com',
    },
    timeSlot: {
      id: 'slot123',
      start_time: new Date(),
      end_time: new Date(),
      date: new Date(),
      lab: {
        id: 'lab123',
        name: 'Lab A',
      },
    },
  };

  afterEach(() => jest.clearAllMocks());

  it('should create a booking', async () => {
    const reqBody = {
      userId: 'user123',
      timeSlotId: 'slot123',
      purpose: 'Test Booking',
    };

    (prisma.booking.create as jest.Mock).mockResolvedValue(mockBooking);

    const res = await request(app).post('/api/v1/bookings').send(reqBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('mock-booking-id');
    expect(res.body.data.user.id).toBe('user123');
    expect(res.body.data.timeSlot.id).toBe('slot123');
  });

  it('should return all bookings', async () => {
    (prisma.booking.findMany as jest.Mock).mockResolvedValue([mockBooking]);

    const res = await request(app).get('/api/v1/bookings');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe(mockBooking.id);
  });

  it('should return booking by ID', async () => {
    (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);

    const res = await request(app).get('/api/v1/bookings/mock-booking-id');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(mockBooking.id);
  });

  it('should return 404 for unknown booking', async () => {
    (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/v1/bookings/unknown-id');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message.toLowerCase()).toMatch(/not found/);
  });

  it('should cancel a booking', async () => {
    (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
    (prisma.booking.delete as jest.Mock).mockResolvedValue(mockBooking);

    const res = await request(app).delete('/api/v1/bookings/mock-booking-id');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('Booking canceled successfully');
  });
});
