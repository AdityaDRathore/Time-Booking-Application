// ✅ Declare mocks first
const mockFindMany = jest.fn();

const mockSlot = {
  id: 'ts1',
  lab_id: 'labA',
  date: new Date('2025-06-17'),
  start_time: new Date('2025-06-17T10:00:00Z'),
  end_time: new Date('2025-06-17T11:00:00Z'),
  status: 'AVAILABLE',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ✅ Mock before importing service
jest.mock('@src/repository/base/transaction', () => ({
  prisma: {
    timeSlot: {
      findMany: mockFindMany,
    },
  },
}));

const mockBaseRepository = {
  findAll: jest.fn().mockResolvedValue([mockSlot]),
  findById: jest.fn().mockResolvedValue(mockSlot),
  create: jest.fn().mockResolvedValue(mockSlot),
  update: jest.fn().mockResolvedValue({ ...mockSlot, lab_id: 'labB' }),
  delete: jest.fn().mockResolvedValue(mockSlot),
};

jest.mock('@/repository/base/BaseRepository', () => {
  return {
    BaseRepository: jest.fn().mockImplementation(() => mockBaseRepository),
  };
});

// ✅ Now import the service AFTER mocks
import { TimeSlotService } from '../timeslot.service';
import { TimeSlot } from '@prisma/client';

describe('TimeSlotService', () => {
  let service: TimeSlotService;

  beforeEach(() => {
    service = new TimeSlotService();
    jest.clearAllMocks();
  });

  it('should get all time slots', async () => {
    const result = await service.getAllTimeSlots();
    expect(result).toEqual([mockSlot]);
    expect(mockBaseRepository.findAll).toHaveBeenCalled();
  });

  it('should get a time slot by ID', async () => {
    const result = await service.getTimeSlotById('ts1');
    expect(result?.id).toBe('ts1');
    expect(mockBaseRepository.findById).toHaveBeenCalledWith('ts1');
  });

  it('should create a new time slot', async () => {
    const result = await service.createTimeSlot({
      lab_id: 'labA',
      start_time: new Date(),
      end_time: new Date(),
    });
    expect(result.lab_id).toBe('labA');
    expect(mockBaseRepository.create).toHaveBeenCalled();
  });

  it('should update a time slot', async () => {
    const result = await service.updateTimeSlot('ts1', { lab_id: 'labB' });
    expect(result.lab_id).toBe('labB');
    expect(mockBaseRepository.update).toHaveBeenCalledWith('ts1', { lab_id: 'labB' });
  });

  it('should delete a time slot', async () => {
    const result = await service.deleteTimeSlot('ts1');
    expect(result.id).toBe('ts1');
    expect(mockBaseRepository.delete).toHaveBeenCalledWith('ts1');
  });

  describe('isAvailable', () => {
    it('should return true when there are no conflicts', async () => {
      mockFindMany.mockResolvedValueOnce([]);
      const result = await service.isAvailable(
        'labA',
        new Date('2025-06-17T09:00:00Z'),
        new Date('2025-06-17T10:00:00Z')
      );
      expect(result).toBe(true);
      expect(mockFindMany).toHaveBeenCalled();
    });

    it('should return false when there is a conflicting time slot', async () => {
      mockFindMany.mockResolvedValueOnce([mockSlot]);
      const result = await service.isAvailable(
        'labA',
        new Date('2025-06-17T10:30:00Z'),
        new Date('2025-06-17T11:30:00Z')
      );
      expect(result).toBe(false);
      expect(mockFindMany).toHaveBeenCalled();
    });
  });
});
