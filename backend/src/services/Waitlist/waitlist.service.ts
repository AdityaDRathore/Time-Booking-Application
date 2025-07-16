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

  async getWaitlistByLabId(labId: string): Promise<Waitlist[]> {
    return prisma.waitlist.findMany({
      where: {
        timeSlot: {
          lab_id: labId,
        },
      },
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
    return await this.repo.getAllForSlot(slot_id);
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
    await this.notificationService.sendNotification({
      user_id: data.user_id,
      notification_type: NotificationType.WAITLIST_NOTIFICATION,
      notification_message: `You have been added to the waitlist for slot ${data.slot_id}.`,
      metadata: {
        slotId: data.slot_id,
        position: currentEntries.length + 1,
      },
    });

    return newEntry;
  }

  async getPosition(user_id: string, slot_id: string): Promise<number> {
    const entries = await this.getWaitlistForSlot(slot_id);
    const userEntry = entries.find(entry => entry.user_id === user_id);
    return userEntry?.waitlist_position ?? -1;
  }

  async recalculatePositionsForSlot(slot_id: string): Promise<void> {
    const entries = await this.getWaitlistForSlot(slot_id);

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      await this.repo.update(entry.id, { waitlist_position: i + 1 });

      // Send updated position notification
      await this.notificationService.sendNotification({
        user_id: entry.user_id,
        notification_type: NotificationType.WAITLIST_NOTIFICATION,
        notification_message: `Your waitlist position for slot ${slot_id} has been updated.`,
        metadata: {
          slotId: slot_id,
          position: i + 1,
        },
      });
    }
  }

  async removeFromWaitlist(id: string): Promise<Waitlist> {
    const entry = await this.repo.findById(id);
    const deleted = await this.repo.delete(id);
    if (entry) await this.recalculatePositionsForSlot(entry.slot_id);
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

  async promoteFirstInWaitlist(slot_id: string): Promise<void> {
    const entries = await this.getWaitlistForSlot(slot_id);
    const first = entries.find(e => e.waitlist_status === WaitlistStatus.ACTIVE);
    if (!first) return;

    const lab_id = await this.getLabIdFromSlot(slot_id);
    const bookingService = new BookingService();

    try {
      const booking = await bookingService.createBooking({
        user_id: first.user_id,
        slot_id,
        purpose: 'Auto-booked from waitlist',
      });

      await this.repo.update(first.id, { waitlist_status: WaitlistStatus.FULFILLED });
      await this.recalculatePositionsForSlot(slot_id);

      await this.notificationService.sendNotification({
        user_id: first.user_id,
        notification_type: NotificationType.SLOT_AVAILABLE,
        notification_message: `You've been promoted from the waitlist! Your booking for slot ${slot_id} is confirmed.`,
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

