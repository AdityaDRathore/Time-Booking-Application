// src/controllers/timeslot.controller.ts

import { Request, Response } from 'express';
import { prisma } from '@/repository/base/transaction';
import { sendError, sendSuccess } from '../utils/response';
import { startOfDay, addDays } from 'date-fns';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Unknown error';
}

export const createTimeSlot = async (req: Request, res: Response) => {
  try {
    const { startTime, endTime, labId } = req.body;

    const timeSlot = await prisma.timeSlot.create({
      data: {
        start_time: startTime,
        end_time: endTime,
        lab_id: labId,
        date: new Date(startTime),
        status: 'AVAILABLE',
      },
    });

    return sendSuccess(res, timeSlot, 201);
  } catch (error) {
    return sendError(res, 'Failed to create time slot', 500, getErrorMessage(error));
  }
};

export const getAllTimeSlots = async (_req: Request, res: Response) => {
  try {
    const timeSlots = await prisma.timeSlot.findMany({
      include: {
        bookings: true,
        lab: {
          select: {
            lab_name: true,
            lab_capacity: true,
          },
        },
      },
    });

    const enriched = timeSlots.map((slot) => {
      const confirmed = slot.bookings.filter(
        (b) => b.booking_status === 'CONFIRMED' || b.booking_status === 'PENDING'
      );
      const seatsLeft = slot.lab.lab_capacity - confirmed.length;

      return {
        ...slot,
        isFullyBooked: seatsLeft <= 0,
        seatsLeft,
      };
    });

    return sendSuccess(res, enriched);
  } catch (error) {
    return sendError(res, 'Failed to fetch time slots', 500, getErrorMessage(error));
  }
};

export const getTimeSlotById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const timeSlot = await prisma.timeSlot.findUnique({ where: { id } });
    if (!timeSlot) return sendError(res, 'TimeSlot not found', 404);

    return sendSuccess(res, timeSlot);
  } catch (error) {
    return sendError(res, 'Failed to fetch time slot', 500, getErrorMessage(error));
  }
};

export const deleteTimeSlot = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.timeSlot.delete({ where: { id } });
    return sendSuccess(res, { message: 'TimeSlot deleted successfully' });
  } catch (error) {
    return sendError(res, 'Failed to delete time slot', 500, getErrorMessage(error));
  }
};

// ✅ Corrected: Get available time slots using start_time range
export const getAvailableTimeSlots = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date } = req.query;

  if (!id || !date || typeof date !== 'string') {
    return sendError(res, 'Missing lab ID or date', 400, 'INVALID_INPUT');
  }

  const dayStart = startOfDay(new Date(date));
  const dayEnd = addDays(dayStart, 1);

  try {
    const slots = await prisma.timeSlot.findMany({
      where: {
        lab_id: id,
        start_time: {
          gte: dayStart,
          lt: dayEnd,
        },
        status: 'AVAILABLE',
      },
      include: {
        bookings: true,
        lab: true, // ✅ This is required for accessing lab.lab_capacity
      },
      orderBy: {
        start_time: 'asc',
      },
    });

    // Add `isBooked` property based on bookings.length
    const enrichedSlots = slots.map((slot) => {
      const confirmedBookings = slot.bookings.filter(
        (b) => b.booking_status === 'CONFIRMED' || b.booking_status === 'PENDING'
      );
      const seatsLeft = slot.lab.lab_capacity - confirmedBookings.length;
      return {
        ...slot,
        isFullyBooked: seatsLeft <= 0,
        seatsLeft,
      };
    });


    return sendSuccess(res, enrichedSlots);
  } catch (error) {
    return sendError(res, 'Failed to fetch available time slots', 500, getErrorMessage(error));
  }
};
