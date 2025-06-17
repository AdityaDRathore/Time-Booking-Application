// src/__integration__/booking-flow.test.ts

import { BookingService } from '@/services/Booking/booking.service';
import { WaitlistService } from '@/services/Waitlist/waitlist.service';
import { NotificationService } from '@/services/Notification/notification.service';
import { BookingStatus, WaitlistStatus } from '@prisma/client';
import { prisma } from '@/repository/base/transaction';

describe('Integration: Booking Workflow', () => {
  const bookingService = new BookingService();
  const waitlistService = new WaitlistService();
  const notificationService = new NotificationService();

  let bookingId: string;
  let waitlistedUser = {
    user_id: 'user2',
    slot_id: 'ts1',
    purpose: 'Backup slot request', // or any string
  };

  beforeAll(async () => {
    // Clean slate
    await prisma.booking.deleteMany();
    await prisma.waitlist.deleteMany();
    await prisma.notification.deleteMany();
  });

  it('should create a booking for user1', async () => {
    const booking = await bookingService.createBooking({
      user_id: 'user1',
      slot_id: 'ts1',
      purpose: 'Project',
    });

    bookingId = booking.id;

    expect(booking.user_id).toBe('user1');
    expect(booking.booking_status).toBe(BookingStatus.PENDING);
  });

  it('should add user2 to waitlist if slot is full', async () => {
    const result = await bookingService.createBooking(waitlistedUser);

    expect(result.booking_status).toBe(BookingStatus.PENDING); // or custom logic for waitlist flag
    const waitlistEntry = await waitlistService.getWaitlistForSlot('ts1');

    expect(waitlistEntry.length).toBe(1);
    expect(waitlistEntry[0].user_id).toBe('user2');
    expect(waitlistEntry[0].waitlist_status).toBe(WaitlistStatus.ACTIVE);
  });

  it('should cancel booking and promote waitlist user', async () => {
    const deleted = await bookingService.deleteBooking(bookingId);

    expect(deleted.id).toBe(bookingId);

    const waitlist = await waitlistService.getWaitlistForSlot('ts1');
    expect(waitlist[0].waitlist_status).toBe(WaitlistStatus.FULFILLED);
  });

  it('should send notifications to both users', async () => {
    const notifsUser1 = await notificationService.getUserNotifications('user1');
    const notifsUser2 = await notificationService.getUserNotifications('user2');

    expect(notifsUser1.length).toBeGreaterThan(0);
    expect(notifsUser2.length).toBeGreaterThan(0);

    const msg1 = notifsUser1[0].notification_message;
    const msg2 = notifsUser2[0].notification_message;

    expect(msg1).toContain('cancelled');
    expect(msg2).toContain('promoted');
  });
});
