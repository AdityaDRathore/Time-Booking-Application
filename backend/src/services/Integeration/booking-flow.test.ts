// src/services/Integeration/booking-flow.test.ts

import { BookingService } from '@src/services/Booking/booking.service';
import { WaitlistService } from '@src/services/Waitlist/waitlist.service';
import { NotificationService } from '@src/services/Notification/notification.service';
import { BookingStatus, WaitlistStatus } from '@prisma/client';
import { prisma } from '@src/repository/base/transaction';

describe('Integration: Booking Workflow', () => {
  const bookingService = new BookingService();
  const waitlistService = new WaitlistService();
  const notificationService = new NotificationService();

  let bookingId: string;
  const waitlistedUser = {
    user_id: 'user2',
    slot_id: 'ts1',
    purpose: 'Backup slot request',
  };

  beforeAll(async () => {
    // Delete dependent tables first to avoid FK constraint errors
    await prisma.notification.deleteMany();
    await prisma.waitlist.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.timeSlot.deleteMany();
    await prisma.lab.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.organizationNotification.deleteMany(); // delete related org notifications first
    await prisma.organization.deleteMany();

    // Seed minimal organization record
    await prisma.organization.upsert({
      where: { id: 'org123' },
      update: {},
      create: {
        id: 'org123',
        org_name: 'Test Organization',
        org_type: 'Test Type',
        org_location: 'Test Location',
      },
    });

    // Seed minimal admin record
    await prisma.admin.upsert({
      where: { id: 'admin123' },
      update: {},
      create: {
        id: 'admin123',
        admin_name: 'Test Admin',
        admin_email: 'admin@example.com',
        admin_password: 'securepassword',
        organizationId: 'org123',
      },
    });

    // Seed minimal lab record
    await prisma.lab.upsert({
      where: { id: 'lab1' },
      update: {},
      create: {
        id: 'lab1',
        lab_name: 'Physics Lab',
        lab_capacity: 30,
        status: 'ACTIVE',
        isOccupied: false,
        location: 'Block A',
        description: 'For physics experiments',
        organizationId: 'org123',
        adminId: 'admin123',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Seed minimal timeslot record
    await prisma.timeSlot.upsert({
      where: { id: 'ts1' },
      update: {},
      create: {
        id: 'ts1',
        date: new Date(),
        start_time: new Date(),
        end_time: new Date(),
        lab_id: 'lab1',
      },
    });
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

    expect(result.booking_status).toBe(BookingStatus.PENDING);

    const waitlistEntry = await waitlistService.getWaitlistForSlot('ts1');
    expect(waitlistEntry.length).toBe(1);
    expect(waitlistEntry[0].user_id).toBe('user2');
    expect(waitlistEntry[0].waitlist_status).toBe(WaitlistStatus.ACTIVE);
  });

  it('should cancel booking and promote waitlist user', async () => {
    expect(bookingId).toBeDefined();

    const deleted = await bookingService.deleteBooking(bookingId!);
    expect(deleted.id).toBe(bookingId);

    const waitlist = await waitlistService.getWaitlistForSlot('ts1');
    expect(waitlist[0].waitlist_status).toBe(WaitlistStatus.FULFILLED);
  });

  it('should send notifications to both users', async () => {
    const notifsUser1 = await notificationService.getUserNotifications('user1');
    const notifsUser2 = await notificationService.getUserNotifications('user2');

    expect(notifsUser1.length).toBeGreaterThan(0);
    expect(notifsUser2.length).toBeGreaterThan(0);

    const msg1 = notifsUser1[0].notification_message.toLowerCase();
    const msg2 = notifsUser2[0].notification_message.toLowerCase();

    expect(msg1).toContain('cancelled');
    expect(msg2).toContain('promoted');
  });
});
