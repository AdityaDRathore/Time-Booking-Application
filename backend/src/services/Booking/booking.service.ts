import { prisma } from '@src/repository/base/transaction';
import { Booking, BookingStatus, NotificationType } from '@prisma/client';
import { CreateBookingDTO } from './booking.types';
import { WaitlistService } from '../Waitlist/waitlist.service';
import { NotificationService } from '../Notification/notification.service';

const notificationService = new NotificationService();

export class BookingService {
  async createBooking(data: CreateBookingDTO): Promise<Booking> {
    // Step 1: Prevent user from having multiple active bookings
    const existing = await prisma.booking.findFirst({
      where: {
        user_id: data.user_id,
        booking_status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
      },
    });

    if (existing) {
      throw new Error('User already has an active booking');
    }

    // Step 2: Get booking count for the given slot
    const slotBookings = await prisma.booking.count({
      where: {
        slot_id: data.slot_id,
        booking_status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
      },
    });

    // Step 3: Fetch slot and related lab to get lab_capacity
    const slot = await prisma.timeSlot.findUnique({
      where: { id: data.slot_id },
      include: { lab: true }, // To access lab.lab_capacity
    });

    if (!slot || !slot.lab) {
      throw new Error('Slot or its associated lab not found');
    }

    // Step 4: Enforce lab capacity
    if (slotBookings >= slot.lab.lab_capacity) {
      throw new Error('Slot is fully booked');
    }

    // Step 5: Create booking
    const booking = await prisma.booking.create({
      data: {
        ...data,
        booking_status: BookingStatus.CONFIRMED,
        booking_timestamp: new Date(),
      },
    });

    // Step 6: Send booking confirmation notification
    await notificationService.sendNotification({
      user_id: booking.user_id,
      notification_type: NotificationType.BOOKING_CONFIRMATION,
      notification_message: `Your booking for slot ${booking.slot_id} has been confirmed.`,
    });

    return booking;
  }

  async updateBooking(id: string, data: Partial<Booking>): Promise<Booking> {
    return await prisma.booking.update({
      where: { id },
      data,
    });
  }

  async getBookingById(id: string): Promise<Booking | null> {
    return await prisma.booking.findUnique({ where: { id } });
  }

  async getAllBookings(): Promise<Booking[]> {
    return await prisma.booking.findMany();
  }

  async deleteBooking(id: string): Promise<Booking> {
    const deleted = await prisma.booking.delete({
      where: { id },
    });

    // Step 1: Notify user of booking cancellation
    await notificationService.sendNotification({
      user_id: deleted.user_id,
      notification_type: NotificationType.BOOKING_CANCELLATION,
      notification_message: `Your booking with ID ${deleted.id} has been cancelled.`,
    });

    // Step 2: Promote from waitlist (if any)
    const waitlistService = new WaitlistService();
    await waitlistService.promoteFirstInWaitlist(deleted.slot_id);

    return deleted;
  }
}

export type { CreateBookingDTO };
