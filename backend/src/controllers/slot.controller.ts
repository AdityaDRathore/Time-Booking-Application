// src/controllers/slot.controller.ts
import { Request, Response } from 'express';
import { sendError, sendSuccess } from '../utils/response';
import { TimeSlotService } from '../services/TimeSlot/timeslot.service';

const timeSlotService = new TimeSlotService();

export const createSlot = async (req: Request, res: Response) => {
  try {
    const slot = await timeSlotService.createTimeSlot(req.body);
    sendSuccess(res, slot, 201);
  } catch (error) {
    sendError(res, 'Failed to create time slot', 500, 'SLOT_CREATE_ERROR', error);
  }
};

export const getAllSlots = async (_req: Request, res: Response) => {
  try {
    const slots = await timeSlotService.getAllTimeSlots();
    sendSuccess(res, slots);
  } catch (error) {
    sendError(res, 'Failed to get time slots', 500, 'SLOT_FETCH_ERROR', error);
  }
};

export const getSlotById = async (req: Request, res: Response) => {
  try {
    const slot = await timeSlotService.getTimeSlotById(req.params.id);
    if (!slot) return sendError(res, 'Slot not found', 404);
    sendSuccess(res, slot);
  } catch (error) {
    sendError(res, 'Failed to get slot', 500, 'SLOT_FETCH_ERROR', error);
  }
};

export const updateSlot = async (req: Request, res: Response) => {
  try {
    const slot = await timeSlotService.updateTimeSlot(req.params.id, req.body);
    sendSuccess(res, slot);
  } catch (error) {
    sendError(res, 'Failed to update slot', 500, 'SLOT_UPDATE_ERROR', error);
  }
};

export const deleteSlot = async (req: Request, res: Response) => {
  try {
    const slot = await timeSlotService.deleteTimeSlot(req.params.id);
    sendSuccess(res, slot);
  } catch (error) {
    sendError(res, 'Failed to delete slot', 500, 'SLOT_DELETE_ERROR', error);
  }
};
