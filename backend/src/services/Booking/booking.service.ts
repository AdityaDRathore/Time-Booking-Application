import { prisma } from '@src/repository/base/transaction';
import { Booking, BookingStatus, NotificationType } from '@prisma/client';
import { CreateBookingDTO } from './booking.types';
import { WaitlistService } from '../Waitlist/waitlist.service';
import { NotificationService } from '../Notification/notification.service';
import { format } from 'date-fns'; // at the top

const notificationService = new NotificationService();

export class BookingService {
  async createBooking(
    data: CreateBookingDTO
  ): Promise<Booking | { waitlisted: true; position: number | null; message: string }> {
    return await prisma.$transaction(async (tx) => {
      // Fetch the slot and its associated lab
      const slot = await tx.timeSlot.findUnique({
        where: { id: data.slot_id },
        include: { lab: true },
      });

      if (!slot || !slot.lab) {
        throw new Error('Slot or its associated lab not found');
      }

      // Check for overlapping bookings on same date
      const overlapping = await tx.booking.findFirst({
        where: {
          user_id: data.user_id,
          booking_status: {
            in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
          },
          timeSlot: {
            date: slot.date,
            start_time: {
              lt: slot.end_time,
            },
            end_time: {
              gt: slot.start_time,
            },
          },
        },
        include: { timeSlot: true },
      });

      if (overlapping) {
        throw new Error('User already has a booking that overlaps with this time slot');
      }

      // Count confirmed + pending bookings for the slot
      const slotBookingsCount = await tx.booking.count({
        where: {
          slot_id: data.slot_id,
          booking_status: {
            in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
          },
        },
      });

      // If capacity reached, add to waitlist
      if (slotBookingsCount >= slot.lab.lab_capacity) {
        const waitlistService = new WaitlistService();
        const waitlistEntry = await waitlistService.addToWaitlist({
          user_id: data.user_id,
          slot_id: data.slot_id,
        });

        await notificationService.sendNotification({
          user_id: data.user_id,
          notification_type: NotificationType.WAITLIST_NOTIFICATION,
          notification_message: `Slot is full. You have been added to the waitlist at position ${waitlistEntry.waitlist_position}.`,
          metadata: {
            slotId: slot.id,
            position: waitlistEntry.waitlist_position,
            labName: slot.lab.lab_name,
            date: slot.date.toISOString(),
            startTime: slot.start_time.toISOString(),
            endTime: slot.end_time.toISOString(),
          },
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

      // Send notification (non-blocking)
      setImmediate(async () => {
        try {
          await notificationService.sendNotification({
            user_id: booking.user_id,
            notification_type: NotificationType.BOOKING_CONFIRMATION,
            notification_message: `Your booking for ${slot.lab.lab_name} on ${format(slot.date, 'PPP')} from ${format(slot.start_time, 'p')} to ${format(slot.end_time, 'p')} has been confirmed.`,
            metadata: {
              bookingId: booking.id,
              slotId: slot.id,
              labName: slot.lab.lab_name,
              date: slot.date.toISOString(),
              startTime: slot.start_time.toISOString(),
              endTime: slot.end_time.toISOString(),
            },
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
    const deleted = await prisma.booking.delete({
      where: { id },
      include: {
        timeSlot: {
          include: { lab: true },
        },
      },
    });

    const { lab, date, start_time, end_time } = deleted.timeSlot;

    await notificationService.sendNotification({
      user_id: deleted.user_id,
      notification_type: NotificationType.BOOKING_CANCELLATION,
      notification_message: `Your booking for ${lab.lab_name} on ${format(date, 'PPP')} from ${format(start_time, 'p')} to ${format(end_time, 'p')} has been cancelled.`,
      metadata: {
        bookingId: deleted.id,
        slotId: deleted.slot_id,
        labName: lab.lab_name,
        date: date.toISOString(),
        startTime: start_time.toISOString(),
        endTime: end_time.toISOString(),
      },
    });

    const waitlistService = new WaitlistService();
    await waitlistService.promoteFirstInWaitlist(deleted.slot_id);

    return deleted;
  }

  async getBookingsForUser(userId: string): Promise<Booking[]> {
    return await prisma.booking.findMany({
      where: {
        user_id: userId,
        booking_status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.PENDING],
        },
      },
      include: {
        timeSlot: {
          include: {
            lab: true, // 🧠 Needed to show lab name on frontend
          },
        },
      },
      orderBy: {
        timeSlot: {
          start_time: 'asc',
        },
      },
    });
  }

}


export type { CreateBookingDTO };
