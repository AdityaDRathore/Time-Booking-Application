import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendError, sendSuccess } from '../utils/response';
import { prisma } from '@/repository/base/transaction';


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
        date: new Date(),
      },
    });

    return sendSuccess(res, timeSlot, 201);
  } catch (error) {
    return sendError(res, 'Failed to create time slot', 500, getErrorMessage(error));
  }
};

export const getAllTimeSlots = async (req: Request, res: Response) => {
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
