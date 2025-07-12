import { Request, Response } from 'express';
import { sendSuccess, sendError } from '@src/utils/response';
import { getErrorMessage } from '@src/utils/errors';
import { prisma } from '@/repository/base/transaction'; // 🔁 use shared prisma
import { AdminService } from '@src/services/Admin/admin.service';
import { CreateBookingSchema } from '@src/services/Booking/booking.schema';

const adminService = new AdminService();

export const updateBookingStatus = async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const { status } = req.body;

  try {
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { booking_status: status },
    });

    sendSuccess(res, updated, 200);
  } catch (err) {
    return sendError(
      res,
      'Failed to update booking status',
      500,
      'UPDATE_BOOKING_ERROR',
      err
    );
  }

};

export const getAdminLabs = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Look up the admin based on userId
    const admin = await prisma.admin.findUnique({
      where: { userId },
    });

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

    const admin = await prisma.admin.findUnique({
      where: { userId },
    });

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

    const admin = await prisma.admin.findUnique({
      where: { userId },
    });

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
    const waitlist = await adminService.getWaitlistBySlotId(slotId);
    return sendSuccess(res, waitlist);
  } catch (err) {
    return sendError(res, 'Failed to fetch waitlist', 500, getErrorMessage(err));
  }
};

export const createAdminLab = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { lab_name, location, lab_capacity } = req.body;

    const admin = await prisma.admin.findUnique({
      where: { userId },
    });

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

export const createBookingForUser = async (req: Request, res: Response) => {
  try {
    const { userId, timeSlotId, purpose } = req.body;
    const validation = CreateBookingSchema.safeParse({ timeSlotId, purpose });

    if (!validation.success) {
      const message = validation.error.errors.map((e) => e.message).join(', ');
      return sendError(res, 'Validation failed', 400, message);
    }

    const booking = await adminService.createBookingForUser({
      userId,
      slotId: validation.data.timeSlotId,
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
    // Placeholder: implement logic later
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
        bookings: true, // Optional: or lab if you need
      },
    });

    return sendSuccess(res, slots);
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

