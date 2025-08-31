import { prisma } from '@src/repository/base/transaction';
import { BookingStatus } from '@prisma/client';
import { WaitlistService } from '../Waitlist/waitlist.service';
import { NotificationService } from '../Notification/notification.service';

export class AdminService {
  async getLabsForAdmin(adminId: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin) throw new Error('Admin not found');

    return prisma.lab.findMany({
      where: { organizationId: admin.organizationId },
    });
  }

  async getOrgBookings(adminId: string) {
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new Error('Admin not found');

    return prisma.booking.findMany({
      where: {
        timeSlot: {
          lab: {
            organizationId: admin.organizationId,
          },
        },
      },
      include: {
        user: true,
        timeSlot: {
          include: {
            lab: true,
          },
        },
      },
    });
  }

  async getUsersInOrg(adminId: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        organizationId: true,
        userId: true,
      },
    });

    if (!admin) throw new Error('Admin not found');

    const users = await prisma.user.findMany({
      where: {
        id: {
          not: admin.userId,
        },
        bookings: {
          some: {
            timeSlot: {
              lab: {
                organizationId: admin.organizationId,
              },
            },
          },
        },
      },
      distinct: ['id'],
      include: {
        bookings: {
          include: {
            timeSlot: {
              include: {
                lab: true,
              },
            },
          },
        },
      },
    });

    return users;
  }

  async getWaitlistBySlotId(slotId: string) {
    return prisma.waitlist.findMany({
      where: { slot_id: slotId },
      include: { user: true },
      orderBy: { waitlist_position: 'asc' },
    });
  }

  async createBookingForUser({
    userId,
    slotId,
    purpose,
  }: {
    userId: string;
    slotId: string;
    purpose: string;
  }) {
    const slot = await prisma.timeSlot.findUnique({
      where: { id: slotId },
      include: { lab: true },
    });
    if (!slot || !slot.lab) throw new Error('Invalid slot or lab');

    const currentCount = await prisma.booking.count({
      where: {
        slot_id: slotId,
        booking_status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.PENDING],
        },
      },
    });

    if (currentCount >= slot.lab.lab_capacity) {
      const waitlistService = new WaitlistService();
      return waitlistService.addToWaitlist({ user_id: userId, slot_id: slotId });
    }

    const booking = await prisma.booking.create({
      data: {
        user_id: userId,
        slot_id: slotId,
        purpose,
        booking_status: BookingStatus.CONFIRMED,
        booking_timestamp: new Date(),
      },
    });

    const notificationService = new NotificationService();
    await notificationService.sendNotification({
      user_id: userId,
      notification_type: 'BOOKING_CONFIRMATION',
      notification_message: `Admin booked slot ${slotId} for you.`,
    });

    return booking;
  }
}
