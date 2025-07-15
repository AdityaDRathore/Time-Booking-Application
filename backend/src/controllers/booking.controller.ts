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

    const filter = req.query.filter as 'all' | 'upcoming' | 'past' || 'all';
    const now = new Date();

    const where = {
      user_id: userId,
      booking_status: {
        in: [BookingStatus.CONFIRMED, BookingStatus.PENDING],
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

    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    if (user.role !== 'ADMIN' && user.id !== booking.user_id) {
      return sendError(res, 'Forbidden', 403);
    }

    await prisma.$transaction(async (tx) => {
      // 1. Cancel the booking
      await tx.booking.delete({ where: { id } });

      // 2. Find the top user in the waitlist for this slot
      const topWaitlistUser = await tx.waitlist.findFirst({
        where: { slot_id: booking.slot_id },
        orderBy: { createdAt: 'asc' },
      });

      // 3. If someone is in the waitlist, promote them
      if (topWaitlistUser) {
        await tx.booking.create({
          data: {
            user_id: topWaitlistUser.user_id,
            slot_id: topWaitlistUser.slot_id,
            purpose: 'Auto-promoted from waitlist',
            booking_status: 'CONFIRMED',
          },
        });

        await tx.waitlist.delete({ where: { id: topWaitlistUser.id } });

        // Optional: send an email to the user
        // await sendBookingPromotionEmail(topWaitlistUser.user.email);
      }
    });

    return sendSuccess(res, { message: 'Booking canceled successfully. Waitlist updated if applicable.' });
  } catch (error) {
    return sendError(res, 'Failed to cancel booking', 500, getErrorMessage(error));
  }
};