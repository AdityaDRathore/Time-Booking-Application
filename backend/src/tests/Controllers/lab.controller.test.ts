import request from 'supertest';
import app from '@/app';
import { prisma } from '@/repository/base/transaction';

const mockLab = {
  id: 'lab1',
  lab_name: 'Physics Lab',
  location: 'Block A',
  lab_capacity: 30,
  description: 'Physics experiments',
  organizationId: 'd4ca2221-bf2e-48da-8fa2-361a787b0a59', // ✅ your UUID
  adminId: 'c91f3c6a-6a37-4ba1-9842-c999837e9930',        // ✅ your UUID
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
  isOccupied: false,
};

jest.mock('@/repository/base/transaction', () => ({
  prisma: {
    lab: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Lab Controller', () => {
  afterEach(() => jest.clearAllMocks());

  it('should return all labs', async () => {
    (prisma.lab.findMany as jest.Mock).mockResolvedValue([mockLab]);

    const res = await request(app).get('/api/v1/labs');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return a lab by ID', async () => {
    (prisma.lab.findUnique as jest.Mock).mockResolvedValue(mockLab);

    const res = await request(app).get('/api/v1/labs/lab1');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('lab1');
  });

  it('should return 404 if lab not found', async () => {
    (prisma.lab.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/v1/labs/unknown');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should create a new lab', async () => {
    (prisma.lab.create as jest.Mock).mockResolvedValue(mockLab);

    const res = await request(app).post('/api/v1/labs').send({
      lab_name: 'Physics Lab',
      location: 'Block A',
      lab_capacity: 30,
      description: 'Physics experiments',
      organizationId: 'd4ca2221-bf2e-48da-8fa2-361a787b0a59',
      adminId: 'c91f3c6a-6a37-4ba1-9842-c999837e9930',
      status: 'ACTIVE',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.lab_name).toBe('Physics Lab');
  });

  it('should update a lab', async () => {
    (prisma.lab.update as jest.Mock).mockResolvedValue({
      ...mockLab,
      lab_name: 'Updated Lab',
    });

    const res = await request(app).put('/api/v1/labs/lab1').send({
      lab_name: 'Updated Lab',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.lab_name).toBe('Updated Lab');
  });

  it('should delete a lab', async () => {
    (prisma.lab.findUnique as jest.Mock).mockResolvedValue(mockLab);
    (prisma.lab.delete as jest.Mock).mockResolvedValue(mockLab);

    const res = await request(app).delete('/api/v1/labs/lab1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('Lab deleted successfully');
  });
});
