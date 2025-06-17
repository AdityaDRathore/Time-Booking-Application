// ✅ Mock WaitlistService before any imports
jest.mock('@/services/Waitlist/waitlist.service', () => ({
  WaitlistService: jest.fn().mockImplementation(() => ({
    promoteFirstInWaitlist: jest.fn().mockResolvedValue(undefined),
  })),
}));

// ✅ Mock Prisma and models
jest.mock('@/repository/base/transaction', () => {
  const { BookingStatus } = require('@prisma/client');

  const mockBooking = {
    id: 'b1',
    user_id: 'u1',
    slot_id: 'ts1',
    booking_status: BookingStatus.PENDING,
    booking_timestamp: new Date(),
    purpose: 'Project Work',
    managedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSlot = {
    id: 'ts1',
    startTime: new Date(),
    endTime: new Date(),
    lab_id: 'lab1',
    lab: {
      id: 'lab1',
      name: 'Physics Lab',
      location: 'Block A',
      capacity: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const mockBookingModel = {
    create: jest.fn().mockResolvedValue(mockBooking),
    update: jest.fn().mockResolvedValue({ ...mockBooking, purpose: 'Updated' }),
    findUnique: jest.fn().mockResolvedValue(mockBooking),
    findFirst: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([mockBooking]),
    delete: jest.fn().mockResolvedValue(mockBooking),
    count: jest.fn().mockResolvedValue(0),
  };

  const mockTimeSlotModel = {
    findUnique: jest.fn().mockResolvedValue(mockSlot),
  };

  return {
    prisma: {
      booking: mockBookingModel,
      timeSlot: mockTimeSlotModel,
    },
  };
});

// ✅ Import after mocks
import { prisma as mockedPrisma } from '@/repository/base/transaction';
import { BookingService } from '../booking.service';
import { BookingStatus } from '@prisma/client';

describe('BookingService', () => {
  let service: BookingService;

  beforeEach(() => {
    service = new BookingService();
    jest.clearAllMocks();
  });

  it('should create a booking', async () => {
    const created = await service.createBooking({
      user_id: 'u1',
      slot_id: 'ts1',
      purpose: 'Project Work',
    });

    expect(created.purpose).toBe('Project Work');
    expect(mockedPrisma.booking.create).toHaveBeenCalled();
    expect(mockedPrisma.timeSlot.findUnique).toHaveBeenCalledWith({
      where: { id: 'ts1' },
      include: { lab: true },
    });
  });

  it('should throw if user already has an active booking', async () => {
    (mockedPrisma.booking.findFirst as jest.Mock).mockResolvedValueOnce({ id: 'existing' });

    await expect(
      service.createBooking({
        user_id: 'u1',
        slot_id: 'ts1',
        purpose: 'Conflict Test',
      })
    ).rejects.toThrow('User already has an active booking');
  });

  it('should waitlist user if slot is full', async () => {
    (mockedPrisma.booking.findFirst as jest.Mock).mockResolvedValue(null);
    (mockedPrisma.booking.count as jest.Mock).mockResolvedValueOnce(1); // Simulate full capacity

    const result = await service.createBooking({
      user_id: 'u2',
      slot_id: 'ts1',
      purpose: 'Overflow Test',
    });

    expect(result.booking_status).toBe(BookingStatus.PENDING);
  });

  it('should update a booking', async () => {
    const updated = await service.updateBooking('b1', { purpose: 'Updated' });
    expect(updated.purpose).toBe('Updated');
    expect(mockedPrisma.booking.update).toHaveBeenCalled();
  });

  it('should get a booking by ID', async () => {
    const booking = await service.getBookingById('b1');
    expect(booking?.id).toBe('b1');
    expect(mockedPrisma.booking.findUnique).toHaveBeenCalledWith({ where: { id: 'b1' } });
  });

  it('should get all bookings', async () => {
    const bookings = await service.getAllBookings();
    expect(bookings.length).toBe(1);
    expect(mockedPrisma.booking.findMany).toHaveBeenCalled();
  });

  it('should delete a booking and promote waitlist', async () => {
    const deleted = await service.deleteBooking('b1');
    expect(deleted.id).toBe('b1');
    expect(mockedPrisma.booking.delete).toHaveBeenCalledWith({ where: { id: 'b1' } });
  });
});
