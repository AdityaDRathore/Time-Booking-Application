import { Request, Response } from 'express';
import { prisma } from '@src/repository/base/transaction';
import { sendSuccess, sendError } from '../utils/response';
import { getErrorMessage } from '../utils/errors';

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { userId, timeSlotId, purpose } = req.body;

    if (!userId || !timeSlotId) {
      return sendError(res, 'Missing required fields: userId or timeSlotId', 400);
    }

    const booking = await prisma.booking.create({
      data: {
        user: { connect: { id: userId } },
        timeSlot: { connect: { id: timeSlotId } },
        purpose: purpose || 'Lab Booking',
        booking_status: 'CONFIRMED',
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

    return sendSuccess(res, booking, 201);
  } catch (error) {
    return sendError(res, 'Failed to create booking', 500, getErrorMessage(error));
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
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        timeSlot: {
          include: {
            lab: true,
          },
        },
      },
    });

    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    return sendSuccess(res, booking);
  } catch (error) {
    return sendError(res, 'Failed to fetch booking', 500, getErrorMessage(error));
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    await prisma.booking.delete({ where: { id } });

    return sendSuccess(res, { message: 'Booking canceled successfully' });
  } catch (error) {
    return sendError(res, 'Failed to cancel booking', 500, getErrorMessage(error));
  }
};
