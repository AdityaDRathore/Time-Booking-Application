import { prisma } from '@src/repository/base/transaction';
import { Booking, BookingStatus, NotificationType } from '@prisma/client';
import { CreateBookingDTO } from './booking.types';
import { WaitlistService } from '../Waitlist/waitlist.service';
import { NotificationService } from '../Notification/notification.service';

const notificationService = new NotificationService();

export class BookingService {
  async createBooking(
    data: CreateBookingDTO
  ): Promise<Booking | { waitlisted: true; position: number; message: string }> {
    return await prisma.$transaction(async (tx) => {
      // Prevent duplicate active booking
      const existing = await tx.booking.findFirst({
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

      // Count current confirmed/pending bookings for slot
      const slotBookingsCount = await tx.booking.count({
        where: {
          slot_id: data.slot_id,
          booking_status: {
            in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
          },
        },
      });

      // Fetch the slot and its associated lab
      const slot = await tx.timeSlot.findUnique({
        where: { id: data.slot_id },
        include: { lab: true },
      });

      if (!slot || !slot.lab) {
        throw new Error('Slot or its associated lab not found');
      }

      // Handle auto waitlisting if capacity exceeded
      if (slotBookingsCount >= slot.lab.lab_capacity) {
        const waitlistService = new WaitlistService();
        const waitlistEntry = await waitlistService.addToWaitlist({
          user_id: data.user_id,
          slot_id: data.slot_id,
        });

        return {
          waitlisted: true,
          position: waitlistEntry.waitlist_position,
          message: `Slot is full. You've been added to the waitlist at position ${waitlistEntry.waitlist_position}.`,
        };
      }

      // Create booking
      const booking = await tx.booking.create({
        data: {
          user_id: data.user_id,
          slot_id: data.slot_id,
          purpose: data.purpose,
          booking_status: BookingStatus.CONFIRMED,
          booking_timestamp: new Date(),
        },
        include: {
          user: true,
          timeSlot: {
            include: { lab: true },
          },
        },
      });

      // 🔔 Defer notification (outside transaction)
      setImmediate(async () => {
        try {
          await notificationService.sendNotification({
            user_id: booking.user_id,
            notification_type: NotificationType.BOOKING_CONFIRMATION,
            notification_message: `Your booking for slot ${booking.slot_id} has been confirmed.`,
          });
        } catch (err) {
          console.warn('⚠️ Failed to send confirmation notification:', err);
        }
      });

      return booking;
    });
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
    const deleted = await prisma.booking.delete({ where: { id } });

    await notificationService.sendNotification({
      user_id: deleted.user_id,
      notification_type: NotificationType.BOOKING_CANCELLATION,
      notification_message: `Your booking with ID ${deleted.id} has been cancelled.`,
    });

    const waitlistService = new WaitlistService();
    await waitlistService.promoteFirstInWaitlist(deleted.slot_id);

    return deleted;
  }
}

export type { CreateBookingDTO };
