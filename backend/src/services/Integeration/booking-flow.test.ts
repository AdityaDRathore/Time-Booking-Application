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
    // Clean up all relevant tables
    await prisma.notification.deleteMany();
    await prisma.waitlist.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.timeSlot.deleteMany();
    await prisma.lab.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.organizationNotification.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();

    // Seed users with correct role
    await prisma.user.createMany({
      data: [
        {
          id: 'user1',
          user_name: 'Test User 1',
          user_email: 'user1@example.com',
          user_password: 'dummy1',
          user_role: 'USER', // ✅ Correct
        },
        {
          id: 'user2',
          user_name: 'Test User 2',
          user_email: 'user2@example.com',
          user_password: 'dummy2',
          user_role: 'USER', // ✅ Correct
        },
      ],
      skipDuplicates: true,
    });

    // Organization
    await prisma.organization.create({
      data: {
        id: 'org123',
        org_name: 'Test Organization',
        org_type: 'Test Type',
        org_location: 'Test Location',
      },
    });

    // Admin
    await prisma.admin.create({
      data: {
        id: 'admin123',
        admin_name: 'Test Admin',
        admin_email: 'admin@example.com',
        admin_password: 'securepassword',
        organizationId: 'org123',
      },
    });

    // Lab
    await prisma.lab.create({
      data: {
        id: 'lab1',
        lab_name: 'Physics Lab',
        lab_capacity: 1, // One booking allowed → forces waitlist
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

    // Time slot
    await prisma.timeSlot.create({
      data: {
        id: 'ts1',
        date: new Date(),
        start_time: new Date(),
        end_time: new Date(),
        lab_id: 'lab1',
      },
    });
  });

  it('should create a booking for user1', async () => {
    const result = await bookingService.createBooking({
      user_id: 'user1',
      slot_id: 'ts1',
      purpose: 'Project',
    });

    if ('waitlisted' in result) {
      fail('user1 should not be waitlisted');
    }

    bookingId = result.id;
    expect(result.user_id).toBe('user1');
    expect(result.booking_status).toBe(BookingStatus.CONFIRMED);
  });

  it('should add user2 to waitlist if slot is full', async () => {
    const result = await bookingService.createBooking(waitlistedUser);

    expect('waitlisted' in result).toBe(true);
    if ('waitlisted' in result) {
      expect(result.waitlisted).toBe(true);
      expect(result.position).toBeGreaterThan(0);
    }

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
