// ✅ Mock WaitlistService
jest.mock('@src/services/Waitlist/waitlist.service', () => ({
  WaitlistService: jest.fn().mockImplementation(() => ({
    addToWaitlist: jest.fn().mockResolvedValue({ waitlist_position: 1 }),
    promoteFirstInWaitlist: jest.fn().mockResolvedValue(undefined),
  })),
}));

// ✅ Mock NotificationService
jest.mock('@src/services/Notification/notification.service', () => ({
  NotificationService: jest.fn().mockImplementation(() => ({
    sendNotification: jest.fn().mockResolvedValue(undefined),
  })),
}));

// ✅ Mock Prisma
jest.mock('@/repository/base/transaction', () => {
  const { BookingStatus, NotificationType } = require('@prisma/client');

  const mockBooking = {
    id: 'b1',
    user_id: 'u1',
    slot_id: 'ts1',
    booking_status: BookingStatus.CONFIRMED,
    booking_timestamp: new Date(),
    purpose: 'Project Work',
    managedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {},
    timeSlot: { lab: { lab_capacity: 1 } },
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
      lab_capacity: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const tx = {
    booking: {
      create: jest.fn().mockResolvedValue(mockBooking),
      update: jest.fn().mockResolvedValue({ ...mockBooking, purpose: 'Updated' }),
      findUnique: jest.fn().mockResolvedValue(mockBooking),
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([mockBooking]),
      delete: jest.fn().mockResolvedValue(mockBooking),
      count: jest.fn().mockResolvedValue(0),
    },
    timeSlot: {
      findUnique: jest.fn().mockResolvedValue(mockSlot),
    },
  };

  return {
    prisma: {
      $transaction: jest.fn().mockImplementation(cb => cb(tx)),
      ...tx,
    },
  };
});

// ✅ Imports after mocks
import { BookingService } from '../booking.service';
import { BookingStatus } from '@prisma/client';

describe('BookingService', () => {
  let service: BookingService;

  beforeEach(() => {
    service = new BookingService();
    jest.clearAllMocks();
  });

  it('should create a booking', async () => {
    const result = await service.createBooking({
      user_id: 'u1',
      slot_id: 'ts1',
      purpose: 'Project Work',
    });

    // Type guard: result is Booking
    if ('purpose' in result) {
      expect(result.purpose).toBe('Project Work');
    } else {
      throw new Error('Expected booking result, got waitlist');
    }
  });

  it('should throw if user already has an active booking', async () => {
    const { prisma } = require('@/repository/base/transaction');
    prisma.$transaction.mockImplementationOnce(async (cb: (arg0: any) => any) => {
      const tx = {
        ...prisma,
        booking: {
          ...prisma.booking,
          findFirst: jest.fn().mockResolvedValue({ id: 'existing' }),
        },
      };
      return cb(tx);
    });

    await expect(
      service.createBooking({
        user_id: 'u1',
        slot_id: 'ts1',
        purpose: 'Conflict Test',
      })
    ).rejects.toThrow('User already has an active booking');
  });

  it('should waitlist user if slot is full', async () => {
    const { prisma } = require('@/repository/base/transaction');
    prisma.$transaction.mockImplementationOnce(async (cb: (arg0: any) => any) => {
      const tx = {
        ...prisma,
        booking: {
          ...prisma.booking,
          count: jest.fn().mockResolvedValue(1), // capacity full
        },
        timeSlot: {
          findUnique: jest.fn().mockResolvedValue({
            lab: { lab_capacity: 1 },
          }),
        },
      };
      return cb(tx);
    });

    const result = await service.createBooking({
      user_id: 'u2',
      slot_id: 'ts1',
      purpose: 'Overflow Test',
    });

    // Type guard: result is waitlist response
    if ('waitlisted' in result) {
      expect(result.waitlisted).toBe(true);
      expect(result.position).toBe(1);
    } else {
      throw new Error('Expected waitlisted response');
    }
  });

  it('should update a booking', async () => {
    const updated = await service.updateBooking('b1', { purpose: 'Updated' });
    expect(updated.purpose).toBe('Updated');
  });

  it('should get a booking by ID', async () => {
    const booking = await service.getBookingById('b1');
    expect(booking?.id).toBe('b1');
  });

  it('should get all bookings', async () => {
    const bookings = await service.getAllBookings();
    expect(bookings.length).toBeGreaterThan(0);
  });

  it('should delete a booking and promote waitlist', async () => {
    const deleted = await service.deleteBooking('b1');
    expect(deleted.id).toBe('b1');
  });

  it('should throw if timeSlot not found', async () => {
    const { prisma } = require('@/repository/base/transaction');
    prisma.$transaction.mockImplementationOnce(async (cb: (arg0: any) => any) => {
      const tx = {
        ...prisma,
        timeSlot: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };
      return cb(tx);
    });

    await expect(
      service.createBooking({
        user_id: 'u1',
        slot_id: 'invalid-id',
        purpose: 'Invalid slot test',
      })
    ).rejects.toThrow('Slot or its associated lab not found');
  });

  it('should throw when updating non-existent booking', async () => {
    const { prisma } = require('@/repository/base/transaction');
    prisma.booking.update.mockRejectedValueOnce(new Error('Booking not found'));

    await expect(
      service.updateBooking('invalid-id', { purpose: 'Should fail' })
    ).rejects.toThrow('Booking not found');
  });

  it('should throw when deleting non-existent booking', async () => {
    const { prisma } = require('@/repository/base/transaction');
    prisma.booking.delete.mockRejectedValueOnce(new Error('Delete failed'));

    await expect(service.deleteBooking('unknown-id')).rejects.toThrow('Delete failed');
  });
});
