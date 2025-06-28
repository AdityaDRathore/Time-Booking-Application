import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { getErrorMessage, formatZodError } from '../utils/errors';
import { BookingService } from '@src/services/Booking/booking.service';
import { prisma } from '@src/repository/base/transaction';
import { CreateBookingSchema } from '@src/services/Booking/booking.schema';

const bookingService = new BookingService();

export const createBooking = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { timeSlotId, purpose } = req.body;

    if (!userId) {
      return sendError(res, 'Unauthorized', 401, 'User not authenticated');
    }

    const validation = CreateBookingSchema.safeParse({ timeSlotId, purpose });

    if (!validation.success) {
      const formatted = formatZodError(validation.error);
      return sendError(res, 'Validation failed', 400, formatted);
    }

    const dto = {
      user_id: userId,
      slot_id: validation.data.timeSlotId,
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

    await prisma.booking.delete({ where: { id } });

    return sendSuccess(res, { message: 'Booking canceled successfully' });
  } catch (error) {
    return sendError(res, 'Failed to cancel booking', 500, getErrorMessage(error));
  }
};
