import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LabService } from '../lab.service';
import { Lab, LabStatus } from '@prisma/client';

// ✅ Full mock Lab object (must match the schema)
const mockLab: Lab = {
  id: '1',
  lab_name: 'Physics Lab',
  location: 'Block A',
  lab_capacity: 30,
  description: 'Physics experiments',
  organizationId: 'org-001',
  adminId: 'admin-001',
  status: LabStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ✅ Mock Prisma model
const mockLabModel = {
  findMany: vi.fn().mockResolvedValue([mockLab]),
  findUnique: vi.fn().mockResolvedValue(mockLab),
  create: vi.fn().mockResolvedValue(mockLab),
  update: vi.fn().mockResolvedValue({ ...mockLab, lab_name: 'Updated Lab' }),
  delete: vi.fn().mockResolvedValue(mockLab),
};

// ✅ Mock Prisma client import
vi.mock('@/repository/base/transaction', () => ({
  prisma: {
    lab: mockLabModel,
  },
}));

describe('LabService', () => {
  let service: LabService;

  beforeEach(() => {
    service = new LabService();
    vi.clearAllMocks();
  });

  it('should return all labs', async () => {
    const labs = await service.getAllLabs();
    expect(labs).toHaveLength(1);
    expect(mockLabModel.findMany).toHaveBeenCalled();
  });

  it('should return a lab by ID', async () => {
    const lab = await service.getLabById(1);
    expect(lab?.lab_name).toBe('Physics Lab');
    expect(mockLabModel.findUnique).toHaveBeenCalledWith({ where: { id: 'lab-001' } });
  });

  it('should create a new lab', async () => {
    const newLab = await service.createLab({
      lab_name: 'Physics Lab',
      location: 'Block A',
      lab_capacity: 30,
    });
    expect(newLab.lab_name).toBe('Physics Lab');
    expect(mockLabModel.create).toHaveBeenCalled();
  });

  it('should update a lab', async () => {
    const updated = await service.updateLab(1, { lab_name: 'Updated Lab' });
    expect(updated.lab_name).toBe('Updated Lab');
    expect(mockLabModel.update).toHaveBeenCalledWith({
      where: { id: 'lab-001' },
      data: { lab_name: 'Updated Lab' },
    });
  });

  it('should delete a lab', async () => {
    const result = await service.deleteLab('1');
    expect(result).toEqual(mockLab);
    expect(mockLabModel.delete).toHaveBeenCalledWith({ where: { id: 'lab-001' } });
  });

  it('should check lab capacity correctly', async () => {
    const isEnough = await service.checkLabCapacity(1, 20);
    expect(isEnough).toBe(true);
  });
});
