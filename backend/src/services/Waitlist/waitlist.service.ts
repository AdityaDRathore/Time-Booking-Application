import { Waitlist, WaitlistStatus, NotificationType } from '@prisma/client';
import { WaitlistRepository } from '../../repository/waitlist/WaitlistRepository';
import { BookingService } from '../Booking/booking.service';
import { NotificationService } from '../Notification/notification.service';
import { prisma } from '@src/repository/base/transaction';

export class WaitlistService {
  private repo = new WaitlistRepository();
  private notificationService = new NotificationService();

  async getWaitlistForSlot(slot_id: string): Promise<Waitlist[]> {
    return await this.repo.getAllForSlot(slot_id);
  }

  async addToWaitlist(data: { user_id: string; slot_id: string }): Promise<Waitlist> {
    const entries = await this.getWaitlistForSlot(data.slot_id);
    const position = entries.length + 1;

    const payload = {
      ...data,
      waitlist_position: position,
      waitlist_status: WaitlistStatus.ACTIVE,
    };

    console.log("🔍 Payload for waitlist creation:", payload);

    const newEntry = await this.repo.create(payload); // likely throwing Prisma error

    await this.notificationService.sendNotification({
      user_id: data.user_id,
      notification_type: NotificationType.WAITLIST_NOTIFICATION,
      notification_message: `You have been added to the waitlist for slot ${data.slot_id}. Position: ${position}`,
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
      await this.repo.update(entries[i].id, { waitlist_position: i + 1 });
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
const service = new WaitlistService();

export const joinWaitlist = async (data: { user_id: string; slot_id: string }) => {
  return await service.addToWaitlist(data);
};

export const getPosition = async (user_id: string, slot_id: string): Promise<{ position: number }> => {
  const position = await service.getPosition(user_id, slot_id);
  return { position };
};
