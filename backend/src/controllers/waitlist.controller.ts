import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { WaitlistService } from '../services/Waitlist/waitlist.service';

const waitlistService = new WaitlistService();

export const joinWaitlist = async (req: Request, res: Response) => {
  try {
    const { userId, slotId } = req.body;

    const entry = await waitlistService.addToWaitlist({
      user_id: userId,
      slot_id: slotId,
    });

    sendSuccess(res, entry, 201);
  } catch (error) {
    sendError(res, 'Failed to join waitlist', 500, 'WAITLIST_JOIN_ERROR', error);
  }
};

export const getWaitlistPosition = async (req: Request, res: Response) => {
  try {
    const { userId, slotId } = req.query;

    if (!userId || !slotId || typeof userId !== 'string' || typeof slotId !== 'string') {
      return sendError(res, 'Missing or invalid query parameters', 400, 'VALIDATION_ERROR');
    }

    const position = await waitlistService.getPosition(userId, slotId);
    sendSuccess(res, position);
  } catch (error) {
    sendError(res, 'Failed to get waitlist position', 500, 'WAITLIST_POSITION_ERROR', error);
  }
};
export const getUserWaitlists = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || req.query.userId; // adjust as per your auth setup

    if (!userId || typeof userId !== 'string') {
      return sendError(res, 'User ID not found', 400, 'USER_ID_MISSING');
    }

    const waitlists = await waitlistService.getWaitlistsByUser(userId);
    return sendSuccess(res, waitlists);
  } catch (error) {
    return sendError(res, 'Failed to fetch waitlists', 500, 'WAITLIST_FETCH_ERROR', error);
  }
};
