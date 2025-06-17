import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { getErrorMessage } from '../utils/errors';

const prisma = new PrismaClient();

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { userId, labId, timeSlotId } = req.body;

    const booking = await prisma.booking.create({
      data: {
        user_id: 'some-user-id',
        slot_id: 'some-slot-id',
        purpose: 'Lab Experiment', // If you added this in DB schema
        // Optional:
        booking_status: 'CONFIRMED', // if not using default
        managedBy: 'admin-id',       // optional
      },
    });



    return sendSuccess(res, booking, 201);
  } catch (error) {
    return sendError(res, 'Failed to create booking', 500, getErrorMessage(error));
  }
};

export const getAllBookings = async (req: Request, res: Response) => {
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
            lab: true, // ✅ nested include
          },
        },
      },
    });


    if (!booking) return sendError(res, 'Booking not found', 404);
    return sendSuccess(res, booking);
  } catch (error) {
    return sendError(res, 'Failed to fetch booking', 500, getErrorMessage(error));
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.booking.delete({ where: { id } });
    return sendSuccess(res, { message: 'Booking canceled successfully' });
  } catch (error) {
    return sendError(res, 'Failed to cancel booking', 500, getErrorMessage(error));
  }
};
