import { Request, Response } from 'express';
import { sendSuccess, sendError } from '@src/utils/response';
import { getErrorMessage } from '@src/utils/errors';
import { prisma } from '@/repository/base/transaction';
import { AdminService } from '@src/services/Admin/admin.service';
import { CreateBookingSchema } from '@src/services/Booking/booking.schema';
import { service as waitlistService } from '@src/services/Waitlist/waitlist.service';
import { NotificationType } from '@prisma/client';
import { NotificationService } from '@/services/Notification/notification.service';

const adminService = new AdminService();

export const updateBookingStatus = async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const { status } = req.body;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    const slot = await prisma.timeSlot.findUnique({
      where: { id: booking.slot_id },
      include: { lab: true },
    });

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { booking_status: status },
    });

    if (status === 'CANCELLED' && slot?.lab) {
      await new NotificationService().sendNotification({
        user_id: booking.user_id,
        notification_type: NotificationType.BOOKING_CANCELLATION,
        notification_message: `An admin has cancelled your booking for ${slot.lab.lab_name} on ${slot.date.toDateString()} (${slot.start_time.toLocaleTimeString()} - ${slot.end_time.toLocaleTimeString()}).`,
        metadata: {
          slotId: slot.id,
          labName: slot.lab.lab_name,
          date: slot.date.toISOString(),
          startTime: slot.start_time.toISOString(),
          endTime: slot.end_time.toISOString(),
        },
      });

      await waitlistService.promoteFirstInWaitlist(booking.slot_id, 'ADMIN'); // 🟢 Updated line
    }

    return sendSuccess(res, updated, 200);
  } catch (err) {
    return sendError(res, 'Failed to update booking status', 500, 'UPDATE_BOOKING_ERROR', err);
  }
};

export const updateTimeSlot = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { start_time, end_time } = req.body;

    if (!start_time || !end_time) {
      return sendError(res, 'Missing start_time or end_time', 400);
    }

    const updated = await prisma.timeSlot.update({
      where: { id },
      data: {
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        date: new Date(start_time),
      },
    });

    return sendSuccess(res, updated);
  } catch (err) {
    console.error('Time slot update error:', err); // ✅ Add this
    return sendError(res, 'Failed to update time slot', 500, err instanceof Error ? err.message : 'Unknown error');
  }
};

export const getAdminLabs = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const admin = await prisma.admin.findUnique({ where: { userId } });

    if (!admin) {
      return sendError(res, 'Admin not found', 404, 'ADMIN_NOT_FOUND');
    }

    const labs = await adminService.getLabsForAdmin(admin.id);
    return sendSuccess(res, labs);
  } catch (err) {
    return sendError(res, 'Failed to fetch labs', 500, getErrorMessage(err));
  }
};

export const getAdminBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const admin = await prisma.admin.findUnique({ where: { userId } });

    if (!admin) {
      return sendError(res, 'Admin not found', 404, 'ADMIN_NOT_FOUND');
    }

    const bookings = await adminService.getOrgBookings(admin.id);
    return sendSuccess(res, bookings);
  } catch (err) {
    return sendError(res, 'Failed to fetch bookings', 500, getErrorMessage(err));
  }
};

export const getAdminUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const admin = await prisma.admin.findUnique({ where: { userId } });

    if (!admin) {
      return sendError(res, 'Admin not found', 404, 'ADMIN_NOT_FOUND');
    }

    const users = await adminService.getUsersInOrg(admin.id);
    return sendSuccess(res, users);
  } catch (err) {
    return sendError(res, 'Failed to fetch users', 500, getErrorMessage(err));
  }
};

export const getWaitlistForSlot = async (req: Request, res: Response) => {
  try {
    const slotId = req.params.slotId;
    const waitlist = await waitlistService.getWaitlistForSlot(slotId);
    return sendSuccess(res, waitlist);
  } catch (err) {
    return sendError(res, 'Failed to fetch waitlist', 500, getErrorMessage(err));
  }
};

export const getAdminLabWaitlist = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const labId = req.params.labId;

    const admin = await prisma.admin.findUnique({ where: { userId } });

    if (!admin) {
      return sendError(res, 'Admin not found', 404, 'ADMIN_NOT_FOUND');
    }

    const lab = await prisma.lab.findFirst({
      where: {
        id: labId,
        adminId: admin.id,
      },
    });

    if (!lab) {
      return sendError(res, 'Lab not found or access denied', 403, 'LAB_NOT_FOUND');
    }

    const { status } = req.query;

    const waitlist = await waitlistService.getWaitlistByLabId(
      labId,
      status === 'FULFILLED' ? 'FULFILLED' : 'ACTIVE'
    );
    return sendSuccess(res, waitlist);
  } catch (err) {
    return sendError(res, 'Failed to fetch waitlist', 500, getErrorMessage(err));
  }
};

export const removeWaitlistEntry = async (req: Request, res: Response) => {
  try {
    const { waitlistId } = req.params;

    // Fetch the entry before deletion (to get user_id and slot_id)
    const entry = await prisma.waitlist.findUnique({
      where: { id: waitlistId },
    });

    if (!entry) {
      return sendError(res, 'Waitlist entry not found', 404);
    }

    // Delete the entry
    const removed = await waitlistService.removeFromWaitlist(waitlistId, 'ADMIN');

    return sendSuccess(res, removed);
  } catch (err) {
    return sendError(res, 'Failed to remove from waitlist', 500, getErrorMessage(err));
  }
};

export const promoteWaitlistEntry = async (req: Request, res: Response) => {
  try {
    const { slotId } = req.params;

    // Promote the top waitlisted user (notification is handled inside the service)
    await waitlistService.promoteFirstInWaitlist(slotId);

    return sendSuccess(res, { message: 'An admin has promoted the first user in the waitlist.' });
  } catch (err) {
    return sendError(res, 'Failed to promote from waitlist', 500, getErrorMessage(err));
  }
};

export const createAdminLab = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { lab_name, location, lab_capacity } = req.body;

    const admin = await prisma.admin.findUnique({ where: { userId } });

    if (!admin) {
      return sendError(res, 'Admin not found', 404, 'ADMIN_NOT_FOUND');
    }

    const lab = await prisma.lab.create({
      data: {
        lab_name,
        location,
        lab_capacity,
        adminId: admin.id,
        organizationId: admin.organizationId,
      },
    });

    return sendSuccess(res, lab, 201);
  } catch (err) {
    return sendError(res, 'Failed to create lab', 500, getErrorMessage(err));
  }
};

export const createTimeSlotForLab = async (req: Request, res: Response, next: Function) => {
  try {
    const { labId } = req.params;
    const { start_time, end_time, date } = req.body;

    if (!date || !start_time || !end_time) {
      return sendError(res, 'Missing required fields: date, start_time, or end_time', 400);
    }

    const parsedDate = new Date(date);
    const parsedStart = new Date(start_time);
    const parsedEnd = new Date(end_time);

    if (
      isNaN(parsedDate.getTime()) ||
      isNaN(parsedStart.getTime()) ||
      isNaN(parsedEnd.getTime())
    ) {
      return sendError(res, 'Invalid date/time format', 400);
    }

    const timeSlot = await prisma.timeSlot.create({
      data: {
        lab_id: labId,
        date: parsedDate,
        start_time: parsedStart,
        end_time: parsedEnd,
        status: 'AVAILABLE',
      },
    });

    return sendSuccess(res, timeSlot);
  } catch (err) {
    next(err);
  }
};

export const createBulkTimeSlots = async (req: Request, res: Response) => {
  try {
    const { labId } = req.params;
    const { start_date, end_date, start_time, end_time, days } = req.body;

    if (!start_date || !end_date || !start_time || !end_time || !Array.isArray(days)) {
      return sendError(res, 'Missing required fields', 400);
    }

    const slotsToCreate = [];

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

      if (days.includes(dayOfWeek)) {
        const dateOnly = new Date(date);
        const startDateTime = new Date(`${dateOnly.toISOString().split('T')[0]}T${start_time}`);
        const endDateTime = new Date(`${dateOnly.toISOString().split('T')[0]}T${end_time}`);

        slotsToCreate.push({
          lab_id: labId,
          date: dateOnly,
          start_time: startDateTime,
          end_time: endDateTime,
          status: 'AVAILABLE',
        });
      }
    }

    const createdSlots = await prisma.timeSlot.createMany({ data: slotsToCreate });

    return sendSuccess(res, { createdCount: createdSlots.count });
  } catch (err) {
    return sendError(res, 'Failed to create bulk time slots', 500, getErrorMessage(err));
  }
};

export const deleteTimeSlot = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.timeSlot.delete({
      where: { id },
    });

    return sendSuccess(res, null, 200, undefined);
  } catch (error) {
    return sendError(
      res,
      'Failed to delete time slot',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

export const createBookingForUser = async (req: Request, res: Response) => {
  try {
    const { userId, slot_id, purpose } = req.body;
    const validation = CreateBookingSchema.safeParse({ slot_id, purpose });

    if (!validation.success) {
      const message = validation.error.errors.map((e) => e.message).join(', ');
      return sendError(res, 'Validation failed', 400, message);
    }

    const booking = await adminService.createBookingForUser({
      userId,
      slotId: validation.data.slot_id,
      purpose: validation.data.purpose,
    });

    return sendSuccess(res, booking, 201);
  } catch (err) {
    return sendError(res, 'Failed to create booking', 500, getErrorMessage(err));
  }
};

export const getAdminUserDetails = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      return sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
    }

    return sendSuccess(res, user);
  } catch (err) {
    return sendError(res, 'Failed to fetch user details', 500, getErrorMessage(err));
  }
};

export const getAdminReports = async (_req: Request, res: Response) => {
  try {
    return sendSuccess(res, {
      totalLabs: 5,
      totalBookings: 120,
      peakHours: ['10:00–12:00', '14:00–16:00'],
    });
  } catch (err) {
    return sendError(res, 'Failed to fetch reports', 500, getErrorMessage(err));
  }
};

export const getTimeSlotsForLab = async (req: Request, res: Response) => {
  try {
    const { labId } = req.params;

    const slots = await prisma.timeSlot.findMany({
      where: { lab_id: labId },
      orderBy: { start_time: 'asc' },
      include: {
        bookings: true,
        lab: {
          select: {
            lab_capacity: true,
            lab_name: true,
          },
        },
      },
    });

    const enrichedSlots = slots.map((slot) => {
      const confirmedBookings = slot.bookings.filter(
        (b) => b.booking_status === 'CONFIRMED' || b.booking_status === 'PENDING'
      );
      const seatsLeft = slot.lab.lab_capacity - confirmedBookings.length;

      return {
        ...slot,
        seatsLeft,
        isFullyBooked: seatsLeft <= 0,
      };
    });

    return sendSuccess(res, enrichedSlots);
  } catch (err) {
    return sendError(res, 'Failed to fetch time slots', 500, 'FETCH_TIMESLOTS_ERROR', err);
  }
};

export const deleteAdminLab = async (req: Request, res: Response) => {
  try {
    const { labId } = req.params;

    const lab = await prisma.lab.findUnique({ where: { id: labId } });

    if (!lab) {
      return sendError(res, 'Lab not found', 404, 'LAB_NOT_FOUND');
    }

    await prisma.lab.delete({ where: { id: labId } });

    return sendSuccess(res, { message: 'Lab deleted successfully' });
  } catch (err) {
    return sendError(res, 'Failed to delete lab', 500, getErrorMessage(err));
  }
};
