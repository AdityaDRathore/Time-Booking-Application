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

    const position = await waitlistService.getPosition(
      userId as string,
      slotId as string
    );

    sendSuccess(res, position);
  } catch (error) {
    sendError(res, 'Failed to get waitlist position', 500, 'WAITLIST_POSITION_ERROR', error);
  }
};
