import request from 'supertest';
import app from '@/app';
import { prisma } from '@/repository/base/transaction';

// ✅ Mock Prisma methods
jest.mock('@/repository/base/transaction', () => ({
  prisma: {
    timeSlot: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

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

describe('TimeSlot Controller', () => {
  afterEach(() => jest.clearAllMocks());

  it('should create a new time slot', async () => {
    (prisma.timeSlot.create as jest.Mock).mockResolvedValue(mockSlot);

    const res = await request(app).post('/api/v1/timeslots').send({
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

    const res = await request(app).get('/api/v1/timeslots');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe(mockSlot.id);
  });

  it('should return a time slot by ID', async () => {
    (prisma.timeSlot.findUnique as jest.Mock).mockResolvedValue(mockSlot);

    const res = await request(app).get(`/api/v1/timeslots/${mockSlot.id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(mockSlot.id);
  });

  it('should return 404 if time slot not found', async () => {
    (prisma.timeSlot.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/v1/timeslots/unknown');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('TimeSlot not found');
  });

  it('should delete a time slot', async () => {
    // Must mock findUnique since controller checks if it exists
    (prisma.timeSlot.findUnique as jest.Mock).mockResolvedValue(mockSlot);
    (prisma.timeSlot.delete as jest.Mock).mockResolvedValue(mockSlot);

    const res = await request(app).delete(`/api/v1/timeslots/${mockSlot.id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('TimeSlot deleted successfully');
  });
});
