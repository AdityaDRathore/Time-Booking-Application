import { WaitlistService } from '../waitlist.service';
import { WaitlistStatus, Waitlist } from '@prisma/client';

// Mock waitlist entries
const mockWaitlistEntries: Waitlist[] = [
  {
    id: '1',
    user_id: 'user1',
    slot_id: 'slot1',
    waitlist_position: 1,
    waitlist_status: WaitlistStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock repository functions
const mockRepo = {
  getAllForSlot: jest.fn().mockResolvedValue(mockWaitlistEntries),
  create: jest.fn().mockImplementation((data) => ({
    ...data,
    id: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
  update: jest.fn().mockImplementation((id, data) => ({
    ...mockWaitlistEntries[0],
    ...data,
    id,
  })),
  delete: jest.fn().mockResolvedValue(mockWaitlistEntries[0]),
  findById: jest.fn().mockResolvedValue(mockWaitlistEntries[0]),
};

// Mock NotificationService
const mockSendNotification = jest.fn();

jest.mock('../../Notification/notification.service.ts', () => {
  return {
    NotificationService: jest.fn().mockImplementation(() => ({
      sendNotification: mockSendNotification,
    })),
  };
});

// Mock BookingService
const mockCreateBooking = jest.fn().mockResolvedValue({
  id: 'booking1',
  user_id: 'user1',
  slot_id: 'slot1',
  purpose: 'Auto-booked from waitlist',
});

jest.mock('../../Booking/booking.service.ts', () => {
  return {
    BookingService: jest.fn().mockImplementation(() => ({
      createBooking: mockCreateBooking,
    })),
  };
});

// Mock Prisma transaction (for lab ID fetch)
jest.mock('@/repository/base/transaction', () => ({
  prisma: {
    timeSlot: {
      findUnique: jest.fn().mockResolvedValue({ lab_id: 'lab1' }),
    },
  },
}));

describe('Unit: WaitlistService', () => {
  let service: WaitlistService;

  beforeEach(() => {
    service = new WaitlistService();
    jest.clearAllMocks();
  });

  it('should get waitlist for slot', async () => {
    const result = await service.getWaitlistForSlot('slot1');
    expect(result).toEqual(mockWaitlistEntries);
    expect(mockRepo.getAllForSlot).toHaveBeenCalledWith('slot1');
  });

  it('should add user to waitlist with next position', async () => {
    // Simulate 1 existing entry so next is 2
    mockRepo.getAllForSlot.mockResolvedValueOnce(mockWaitlistEntries);

    const result = await service.addToWaitlist({
      user_id: 'user1',
      slot_id: 'slot1',
    });

    expect(result.waitlist_position).toBe(2);
    expect(result.waitlist_status).toBe(WaitlistStatus.ACTIVE);
    expect(mockRepo.create).toHaveBeenCalledWith({
      user_id: 'user1',
      slot_id: 'slot1',
      waitlist_position: 2,
      waitlist_status: WaitlistStatus.ACTIVE,
    });
    expect(mockSendNotification).toHaveBeenCalled();
  });

  it('should return correct waitlist position for a user', async () => {
    const position = await service.getPosition('user1', 'slot1');
    expect(position).toBe(1);
  });

  it('should return -1 if user is not found in waitlist', async () => {
    mockRepo.getAllForSlot.mockResolvedValueOnce([]);
    const position = await service.getPosition('unknown', 'slot1');
    expect(position).toBe(-1);
  });

  it('should recalculate waitlist positions for a slot', async () => {
    await service.recalculatePositionsForSlot('slot1');
    expect(mockRepo.update).toHaveBeenCalledWith('1', { waitlist_position: 1 });
  });

  it('should remove user from waitlist and recalculate', async () => {
    const result = await service.removeFromWaitlist('1');
    expect(result).toEqual(mockWaitlistEntries[0]);
    expect(mockRepo.delete).toHaveBeenCalledWith('1');
    expect(mockRepo.update).toHaveBeenCalledWith('1', { waitlist_position: 1 });
  });

  it('should promote first user in waitlist to booking and mark as fulfilled', async () => {
    await service.promoteFirstInWaitlist('slot1');

    expect(mockCreateBooking).toHaveBeenCalledWith({
      user_id: 'user1',
      slot_id: 'slot1',
      purpose: 'Auto-booked from waitlist',
    });

    expect(mockRepo.update).toHaveBeenCalledWith('1', {
      waitlist_status: WaitlistStatus.FULFILLED,
    });

    expect(mockSendNotification).toHaveBeenCalled();
  });
});
