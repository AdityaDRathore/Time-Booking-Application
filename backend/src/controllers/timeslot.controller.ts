import { Request, Response } from 'express';
import { prisma } from '@/repository/base/transaction';
import { sendError, sendSuccess } from '../utils/response';
import { startOfDay, endOfDay } from 'date-fns';

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
        date: new Date(), // optional: could also allow client to send date
      },
    });

    return sendSuccess(res, timeSlot, 201);
  } catch (error) {
    return sendError(res, 'Failed to create time slot', 500, getErrorMessage(error));
  }
};

export const getAllTimeSlots = async (_req: Request, res: Response) => {
  try {
    const timeSlots = await prisma.timeSlot.findMany();
    return sendSuccess(res, timeSlots);
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

// ✅ NEW: Get available time slots for a specific lab on a selected date
export const getAvailableTimeSlots = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date } = req.query;

  if (!id || !date || typeof date !== 'string') {
    return sendError(res, 'Missing lab ID or date', 400, 'INVALID_INPUT');
  }

  const dateObj = new Date(date);
  const from = startOfDay(dateObj); // 00:00:00
  const to = endOfDay(dateObj);     // 23:59:59

  const slots = await prisma.timeSlot.findMany({
    where: {
      lab_id: id,
      date: {
        gte: from,
        lte: to,
      },
      status: 'AVAILABLE'
    },
    orderBy: {
      start_time: 'asc',
    },
  });

  return sendSuccess(res, slots);
};