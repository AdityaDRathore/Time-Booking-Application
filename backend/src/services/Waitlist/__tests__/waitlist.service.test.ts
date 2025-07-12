const mockSendNotification = jest.fn();
const mockCreateBooking = jest.fn();

// 🟦 Step 1: Mock NotificationService
jest.mock('../../Notification/notification.service.ts', () => {
  return {
    NotificationService: jest.fn().mockImplementation(() => ({
      sendNotification: mockSendNotification,
    })),
  };
});

// 🟦 Step 2: Mock BookingService
jest.mock('../../Booking/booking.service.ts', () => {
  return {
    BookingService: jest.fn().mockImplementation(() => ({
      createBooking: mockCreateBooking,
    })),
  };
});

// 🟦 Step 3: Mock prisma transaction (for timeSlot.lab_id)
jest.mock('@/repository/base/transaction', () => ({
  prisma: {
    timeSlot: {
      findUnique: jest.fn().mockResolvedValue({ lab_id: 'lab1' }),
    },
  },
}));

// 🟦 Step 4: Mock WaitlistRepository (before importing service)
const mockWaitlistEntries = [
  {
    id: '1',
    user_id: 'user1',
    slot_id: 'slot1',
    waitlist_position: 1,
    waitlist_status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockGetAllForSlot = jest.fn().mockResolvedValue(mockWaitlistEntries);
const mockCreate = jest.fn().mockImplementation((data) => ({
  ...data,
  id: '1',
  createdAt: new Date(),
  updatedAt: new Date(),
}));
const mockUpdate = jest.fn().mockImplementation((id, data) => ({
  ...mockWaitlistEntries[0],
  ...data,
  id,
}));
const mockDelete = jest.fn().mockResolvedValue(mockWaitlistEntries[0]);
const mockFindById = jest.fn().mockResolvedValue(mockWaitlistEntries[0]);

jest.mock('@/repository/waitlist/WaitlistRepository', () => {
  return {
    WaitlistRepository: jest.fn().mockImplementation(() => ({
      getAllForSlot: mockGetAllForSlot,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
      findById: mockFindById,
    })),
  };
});

// 🟦 Step 5: Import after all mocks
import { WaitlistService } from '../waitlist.service';
import { WaitlistStatus } from '@prisma/client';

describe('Unit: WaitlistService', () => {
  let service: WaitlistService;

  beforeEach(() => {
    service = new WaitlistService();
    jest.clearAllMocks();
  });

  it('should get waitlist for slot', async () => {
    const result = await service.getWaitlistForSlot('slot1');
    expect(result).toEqual(mockWaitlistEntries);
    expect(mockGetAllForSlot).toHaveBeenCalledWith('slot1');
  });

  it('should add user to waitlist with next position', async () => {
    mockGetAllForSlot.mockResolvedValueOnce(mockWaitlistEntries);

    const result = await service.addToWaitlist({
      user_id: 'user1',
      slot_id: 'slot1',
    });

    expect(result.waitlist_position).toBe(2);
    expect(result.waitlist_status).toBe(WaitlistStatus.ACTIVE);
    expect(mockCreate).toHaveBeenCalled();
    expect(mockSendNotification).toHaveBeenCalled();
  });

  it('should return correct waitlist position for a user', async () => {
    const position = await service.getPosition('user1', 'slot1');
    expect(position).toBe(1);
  });

  it('should return -1 if user is not found in waitlist', async () => {
    mockGetAllForSlot.mockResolvedValueOnce([]);
    const position = await service.getPosition('unknown', 'slot1');
    expect(position).toBe(-1);
  });

  it('should recalculate waitlist positions for a slot', async () => {
    await service.recalculatePositionsForSlot('slot1');
    expect(mockUpdate).toHaveBeenCalledWith('1', { waitlist_position: 1 });
  });

  it('should remove user from waitlist and recalculate', async () => {
    const result = await service.removeFromWaitlist('1');
    expect(result).toEqual(mockWaitlistEntries[0]);
    expect(mockDelete).toHaveBeenCalledWith('1');
    expect(mockUpdate).toHaveBeenCalledWith('1', { waitlist_position: 1 });
  });

  it('should promote first user in waitlist to booking and mark as fulfilled', async () => {
    await service.promoteFirstInWaitlist('slot1');

    expect(mockCreateBooking).toHaveBeenCalledWith({
      user_id: 'user1',
      slot_id: 'slot1',
      purpose: 'Auto-booked from waitlist',
    });

    expect(mockUpdate).toHaveBeenCalledWith('1', {
      waitlist_status: WaitlistStatus.FULFILLED,
    });

    expect(mockSendNotification).toHaveBeenCalled();
  });
});
