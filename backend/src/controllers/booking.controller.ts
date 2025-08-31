import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { getErrorMessage } from '../utils/errors';
import { BookingService } from '@src/services/Booking/booking.service';
import { prisma } from '@src/repository/base/transaction';
import { CreateBookingSchema } from '@src/services/Booking/booking.schema';
import { BookingStatus } from '@prisma/client';

const bookingService = new BookingService();

export const createBooking = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.id;
    const { slot_id, purpose } = req.body;

    if (!user_id) {
      return sendError(res, 'Unauthorized', 401, 'User not authenticated');
    }

    const validation = CreateBookingSchema.safeParse({ slot_id, purpose });

    if (!validation.success) {
      const formatted = validation.error.errors.map((e) => e.message).join(', ');
      return sendError(res, 'Validation failed', 400, formatted);
    }

    const dto = {
      user_id,
      slot_id: validation.data.slot_id,
      purpose: validation.data.purpose,
    };

    const booking = await bookingService.createBooking(dto);
    return sendSuccess(res, booking, 201);
  } catch (error: any) {
    const message = getErrorMessage(error);
    const status = message.includes('active booking') ? 400 : 500;
    return sendError(res, 'Failed to create booking', status, message);
  }
};

export const getAllBookings = async (_req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        timeSlot: {
          include: {
            lab: true,
          },
        },
      },
    });

    return sendSuccess(res, bookings);
  } catch (error) {
    return sendError(res, 'Failed to fetch bookings', 500, getErrorMessage(error));
  }
};

export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'Unauthorized', 401);
    }

    const filter = (req.query.filter as 'all' | 'upcoming' | 'past' | 'cancelled') || 'all';
    const now = new Date();

    const statusFilter =
      filter === 'cancelled'
        ? [BookingStatus.CANCELLED]
        : [BookingStatus.CONFIRMED, BookingStatus.PENDING];

    const where = {
      user_id: userId,
      booking_status: {
        in: filter === 'all' ? Object.values(BookingStatus) : statusFilter,
      },
      ...(filter === 'upcoming'
        ? { timeSlot: { start_time: { gt: now } } }
        : filter === 'past'
          ? { timeSlot: { end_time: { lt: now } } }
          : {}),
    };

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        timeSlot: {
          include: {
            lab: true,
          },
        },
      },
      orderBy: {
        timeSlot: {
          start_time: 'asc',
        },
      },
    });

    return sendSuccess(res, bookings);
  } catch (error) {
    return sendError(res, 'Failed to fetch user bookings', 500, getErrorMessage(error));
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        timeSlot: { include: { lab: true } },
      },
    });

    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    if (user.role !== 'ADMIN' && user.id !== booking.user_id) {
      return sendError(res, 'Forbidden', 403);
    }

    return sendSuccess(res, booking);
  } catch (error) {
    return sendError(res, 'Failed to fetch booking', 500, getErrorMessage(error));
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { timeSlot: true }, // So we can check owner/slot_id if needed
    });

    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    if (user.role !== 'ADMIN' && user.id !== booking.user_id) {
      return sendError(res, 'Forbidden', 403);
    }

    // ✅ Use the service so it handles:
    // - Deletion
    // - Notification sending
    // - Waitlist promotion
    await bookingService.deleteBooking(id);

    return sendSuccess(res, {
      message: 'Booking canceled successfully. Notification sent and waitlist updated if applicable.',
    });
  } catch (error) {
    return sendError(res, 'Failed to cancel booking', 500, getErrorMessage(error));
  }
};