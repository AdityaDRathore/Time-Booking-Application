import { Waitlist, WaitlistStatus, NotificationType } from '@prisma/client';
import { WaitlistRepository } from '../../repository/waitlist/WaitlistRepository';
import { BookingService } from '../Booking/booking.service';
import { NotificationService } from '../Notification/notification.service';
import { prisma } from '@src/repository/base/transaction';

export class WaitlistService {
  private repo = new WaitlistRepository();
  private notificationService = new NotificationService();

  async getWaitlistsByUser(user_id: string): Promise<Waitlist[]> {
    return prisma.waitlist.findMany({
      where: { user_id },
      include: {
        timeSlot: {
          include: { lab: true }, // Optional: enrich time slot with lab info
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getWaitlistEntryById(id: string) {
    return this.repo.findById(id);
  }

  async getWaitlistByLabId(labId: string, status?: 'ACTIVE' | 'FULFILLED'): Promise<Waitlist[]> {
    const where: any = {
      timeSlot: {
        lab_id: labId,
      },
    };

    if (status === 'ACTIVE' || status === 'FULFILLED') {
      where.waitlist_status = status;
    }

    return prisma.waitlist.findMany({
      where,
      include: {
        user: true,
        timeSlot: true,
      },
      orderBy: {
        waitlist_position: 'asc',
      },
    });
  }

  async getWaitlistForSlot(slot_id: string): Promise<Waitlist[]> {
    return prisma.waitlist.findMany({
      where: {
        slot_id,
        waitlist_status: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async addToWaitlist(data: { user_id: string; slot_id: string }): Promise<Waitlist> {
    // Check if user already has a confirmed booking for this slot
    const existingBooking = await prisma.booking.findFirst({
      where: {
        user_id: data.user_id,
        slot_id: data.slot_id,
        booking_status: 'CONFIRMED',
      },
    });

    if (existingBooking) {
      throw {
        message: 'You already have a confirmed booking for this slot.',
        statusCode: 400,
        code: 'ALREADY_BOOKED',
      };
    }

    // Check if already in waitlist
    const existingWaitlist = await prisma.waitlist.findFirst({
      where: {
        user_id: data.user_id,
        slot_id: data.slot_id,
      },
    });

    if (existingWaitlist) {
      throw {
        message: 'You have already joined the waitlist for this time slot.',
        statusCode: 400,
        code: 'ALREADY_IN_WAITLIST',
      };
    }

    // Limit waitlist to 5 users
    const currentEntries = await this.getWaitlistForSlot(data.slot_id);
    if (currentEntries.length >= 5) {
      throw {
        message: 'Waitlist for this time slot is full.',
        statusCode: 400,
        code: 'WAITLIST_FULL',
      };
    }

    // Add to waitlist
    const newEntry = await prisma.waitlist.create({
      data: {
        user_id: data.user_id,
        slot_id: data.slot_id,
        waitlist_position: currentEntries.length + 1,
        waitlist_status: WaitlistStatus.ACTIVE,
      },
    });

    // Send waitlist notification
    const slot = await prisma.timeSlot.findUnique({
      where: { id: data.slot_id },
      include: { lab: true },
    });

    if (slot?.lab) {
      await this.notificationService.sendNotification({
        user_id: data.user_id,
        notification_type: NotificationType.WAITLIST_NOTIFICATION,
        notification_message: `You have been added to the waitlist for ${slot.lab.lab_name} on ${slot.date.toDateString()} (${slot.start_time.toLocaleTimeString()} - ${slot.end_time.toLocaleTimeString()}).`,
        metadata: {
          slotId: slot.id,
          labName: slot.lab.lab_name,
          date: slot.date.toISOString(),
          startTime: slot.start_time.toISOString(),
          endTime: slot.end_time.toISOString(),
          position: currentEntries.length + 1,
        },
      });
    }

    return newEntry;
  }

  async getPosition(user_id: string, slot_id: string): Promise<number> {
    const entries = await this.getWaitlistForSlot(slot_id);
    const userEntry = entries.find(entry => entry.user_id === user_id);
    return userEntry?.waitlist_position ?? -1;
  }

  async recalculatePositionsForSlot(slot_id: string): Promise<void> {
    const entries = await prisma.waitlist.findMany({
      where: {
        slot_id,
        waitlist_status: 'ACTIVE', // ⬅ Only active entries
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const slot = await prisma.timeSlot.findUnique({
      where: { id: slot_id },
      include: { lab: true },
    });

    if (!slot?.lab) return;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const oldPosition = entry.waitlist_position;
      const newPosition = i + 1;

      // Update DB
      await this.repo.update(entry.id, { waitlist_position: newPosition });

      // Notify user
      await this.notificationService.sendNotification({
        user_id: entry.user_id,
        notification_type: NotificationType.WAITLIST_NOTIFICATION,
        notification_message: `Your waitlist position for ${slot.lab.lab_name} on ${slot.date.toDateString()} (${slot.start_time.toLocaleTimeString()} - ${slot.end_time.toLocaleTimeString()}) has been updated. You are now at position ${newPosition} (previously ${oldPosition}).`,
        metadata: {
          slotId: slot.id,
          labName: slot.lab.lab_name,
          date: slot.date.toISOString(),
          startTime: slot.start_time.toISOString(),
          endTime: slot.end_time.toISOString(),
          oldPosition,
          position: newPosition,
        },
      });
    }
  }

  async removeFromWaitlist(id: string, removedBy: 'USER' | 'ADMIN'): Promise<Waitlist> {
    const entry = await this.repo.findById(id);
    const deleted = await this.repo.delete(id);

    if (entry) {
      const slot = await prisma.timeSlot.findUnique({
        where: { id: entry.slot_id },
        include: { lab: true },
      });

      if (slot?.lab) {
        await this.notificationService.sendNotification({
          user_id: entry.user_id,
          notification_type:
            removedBy === 'USER'
              ? NotificationType.WAITLIST_REMOVAL_USER
              : NotificationType.WAITLIST_REMOVAL_ADMIN,
          notification_message:
            removedBy === 'USER'
              ? `You left the waitlist for ${slot.lab.lab_name} on ${slot.date.toDateString()} (${slot.start_time.toLocaleTimeString()} - ${slot.end_time.toLocaleTimeString()}).`
              : `An admin has removed you from the waitlist for ${slot.lab.lab_name} on ${slot.date.toDateString()} (${slot.start_time.toLocaleTimeString()} - ${slot.end_time.toLocaleTimeString()}).`,
          metadata: {
            slotId: slot.id,
            labName: slot.lab.lab_name,
            date: slot.date.toISOString(),
            startTime: slot.start_time.toISOString(),
            endTime: slot.end_time.toISOString(),
          },
        });
      }

      await this.recalculatePositionsForSlot(entry.slot_id);
    }

    return deleted;
  }

  private async getLabIdFromSlot(slot_id: string): Promise<string> {
    const slot = await prisma.timeSlot.findUnique({
      where: { id: slot_id },
      select: { lab_id: true },
    });

    if (!slot?.lab_id) {
      throw new Error(`No lab_id found for slot_id: ${slot_id}`);
    }

    return slot.lab_id;
  }

  async promoteUserInWaitlist(slot_id: string, user_id: string, oldPosition: number): Promise<void> {
    const slot = await prisma.timeSlot.findUnique({
      where: { id: slot_id },
      include: { lab: true },
    });

    if (!slot?.lab) throw new Error('Slot or lab not found');

    const bookingService = new BookingService();
    await bookingService.createBooking({
      user_id,
      slot_id,
      purpose: 'Admin-confirmed from waitlist',
    });

    await this.repo.updateByUserAndSlot(user_id, slot_id, {
      waitlist_status: WaitlistStatus.FULFILLED,
      waitlist_position: null, // ✅ clear the position
    });


    await this.recalculatePositionsForSlot(slot_id);

    await this.notificationService.sendNotification({
      user_id,
      notification_type: NotificationType.WAITLIST_ADMIN_CONFIRMATION,
      notification_message: `A seat opened up and your booking for ${slot.lab.lab_name} on ${slot.date.toDateString()} (${slot.start_time.toLocaleTimeString()} - ${slot.end_time.toLocaleTimeString()}) has been automatically confirmed.`,
      metadata: {
        slotId: slot.id,
        labName: slot.lab.lab_name,
        date: slot.date.toISOString(),
        startTime: slot.start_time.toISOString(),
        endTime: slot.end_time.toISOString(),
        confirmedFromWaitlist: true,
      },
    });
  }

  async promoteUserPosition(slot_id: string, user_id: string, oldPosition: number, newPosition: number): Promise<void> {
    const slot = await prisma.timeSlot.findUnique({
      where: { id: slot_id },
      include: { lab: true },
    });

    if (!slot?.lab) return;

    await this.notificationService.sendNotification({
      user_id,
      notification_type: NotificationType.WAITLIST_ADMIN_PROMOTION,
      notification_message: `An admin has promoted your position in the waitlist for ${slot.lab.lab_name} on ${slot.date.toDateString()} (${slot.start_time.toLocaleTimeString()} - ${slot.end_time.toLocaleTimeString()}). Your new position is ${newPosition} (was ${oldPosition}).`,
      metadata: {
        slotId: slot.id,
        labName: slot.lab.lab_name,
        date: slot.date.toISOString(),
        startTime: slot.start_time.toISOString(),
        endTime: slot.end_time.toISOString(),
        oldPosition,
        newPosition,
      },
    });
  }

  async promoteFirstInWaitlist(slot_id: string, promotedBy: 'ADMIN' | 'SYSTEM' = 'SYSTEM'): Promise<void> {
    const entries = await this.getWaitlistForSlot(slot_id);
    const first = entries.find(e => e.waitlist_status === WaitlistStatus.ACTIVE);
    if (!first) return;

    const bookingService = new BookingService();

    try {
      const booking = await bookingService.createBooking({
        user_id: first.user_id,
        slot_id,
        purpose: promotedBy === 'ADMIN' ? 'Admin-confirmed from waitlist' : 'Auto-booked from waitlist',
      });

      const slot = await prisma.timeSlot.findUnique({
        where: { id: slot_id },
        include: { lab: true },
      });

      await this.repo.update(first.id, {
        waitlist_status: WaitlistStatus.FULFILLED,
        waitlist_position: null, // ✅ clear the position
      });
      await this.recalculatePositionsForSlot(slot_id);

      if (!slot || !slot.lab) return;

      await this.notificationService.sendNotification({
        user_id: first.user_id,
        notification_type:
          promotedBy === 'ADMIN'
            ? NotificationType.WAITLIST_ADMIN_CONFIRMATION
            : NotificationType.WAITLIST_AUTO_CONFIRMATION,
        notification_message: `A seat opened up and your booking for ${slot.lab.lab_name} on ${slot.date.toDateString()} (${slot.start_time.toLocaleTimeString()} - ${slot.end_time.toLocaleTimeString()}) has been automatically confirmed.`,
        metadata: {
          slotId: slot.id,
          labName: slot.lab.lab_name,
          date: slot.date.toISOString(),
          startTime: slot.start_time.toISOString(),
          endTime: slot.end_time.toISOString(),
          confirmedFromWaitlist: true,
        },
      });

    } catch (e) {
      console.error('Promotion from waitlist failed:', e);
    }
  }
}

// ✅ Export functions for controller use
export const service = new WaitlistService();

export const joinWaitlist = async (data: { user_id: string; slot_id: string }) => {
  return await service.addToWaitlist({
    user_id: data.user_id,
    slot_id: data.slot_id,
  });
};

export const getPosition = async (user_id: string, slot_id: string): Promise<{ position: number }> => {
  const position = await service.getPosition(user_id, slot_id);
  return { position };
};

