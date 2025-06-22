// ✅ Do NOT import LabStatus at the top
import { LabService } from '../lab.service';
import { Lab } from '@prisma/client';

jest.mock('@/repository/base/transaction', () => {
  const { LabStatus } = require('@prisma/client'); // ✅ Lazy require here

  const mockLab: Lab = {
    id: '1',
    lab_name: 'Physics Lab',
    location: 'Block A',
    lab_capacity: 30,
    description: 'Physics experiments',
    organizationId: 'org-001',
    adminId: 'admin-001',
    status: LabStatus.ACTIVE, // ✅ Now safe
    createdAt: new Date(),
    updatedAt: new Date(),
    isOccupied: false
  };

  const mockLabModel = {
    findMany: jest.fn().mockResolvedValue([mockLab]),
    findUnique: jest.fn().mockResolvedValue(mockLab),
    create: jest.fn().mockResolvedValue(mockLab),
    update: jest.fn().mockResolvedValue({ ...mockLab, lab_name: 'Updated Lab' }),
    delete: jest.fn().mockResolvedValue(mockLab),
  };

  return {
    prisma: {
      lab: mockLabModel,
    },
  };
});

// ✅ Import after mocking
import { prisma as mockedPrisma } from '@/repository/base/transaction';

describe('LabService', () => {
  let service: LabService;

  beforeEach(() => {
    service = new LabService();
    jest.clearAllMocks();
  });

  it('should return all labs', async () => {
    const labs = await service.getAllLabs();
    expect(labs).toHaveLength(1);
    expect((mockedPrisma.lab.findMany as jest.Mock)).toHaveBeenCalled();
  });

  it('should return a lab by ID', async () => {
    const lab = await service.getLabById('1');
    expect(lab?.lab_name).toBe('Physics Lab');
    expect((mockedPrisma.lab.findUnique as jest.Mock)).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should create a new lab', async () => {
    const newLab = await service.createLab({
      lab_name: 'Physics Lab',
      location: 'Block A',
      lab_capacity: 30,
    });
    expect(newLab.lab_name).toBe('Physics Lab');
    expect((mockedPrisma.lab.create as jest.Mock)).toHaveBeenCalled();
  });

  it('should update a lab', async () => {
    const updated = await service.updateLab('1', { lab_name: 'Updated Lab' });
    expect(updated.lab_name).toBe('Updated Lab');
    expect((mockedPrisma.lab.update as jest.Mock)).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { lab_name: 'Updated Lab' },
    });
  });

  it('should delete a lab', async () => {
    const result = await service.deleteLab('1');
    expect(result).toEqual(expect.objectContaining({ id: '1' }));
    expect((mockedPrisma.lab.delete as jest.Mock)).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should check lab capacity correctly', async () => {
    const isEnough = await service.checkLabCapacity('1', 20);
    expect(isEnough).toBe(true);
  });
});
