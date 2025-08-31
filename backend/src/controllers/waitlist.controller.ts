import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { WaitlistService } from '../services/Waitlist/waitlist.service';
import { prisma } from '@/repository/base/transaction';
import { getErrorMessage } from '../utils/errors'; // ✅ Required for error handling

const waitlistService = new WaitlistService();

export const joinWaitlist = async (req: Request, res: Response) => {
  try {
    const { user_id, slot_id } = req.body;

    const entry = await waitlistService.addToWaitlist({ user_id, slot_id });

    sendSuccess(res, entry, 201);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const code = error.code || 'WAITLIST_JOIN_ERROR';
    const message = error.message || 'Failed to join waitlist';

    sendError(res, message, statusCode, code, error);
  }
};

export const getWaitlistPosition = async (req: Request, res: Response) => {
  try {
    const { userId, slotId } = req.query;

    if (!userId || !slotId || typeof userId !== 'string' || typeof slotId !== 'string') {
      return sendError(res, 'Missing or invalid query parameters', 400, 'VALIDATION_ERROR');
    }

    const position = await waitlistService.getPosition(userId, slotId);
    sendSuccess(res, { position }); // ✅ wrap in object for frontend compatibility
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

export const getLabWaitlist = async (req: Request, res: Response) => {
  try {
    const { labId } = req.params;
    const { status } = req.query;

    if (!labId || typeof labId !== 'string') {
      return sendError(res, 'Invalid labId', 400, 'VALIDATION_ERROR');
    }

    const waitlists = await waitlistService.getWaitlistByLabId(labId, status as 'ACTIVE' | 'FULFILLED');
    sendSuccess(res, waitlists);
  } catch (error) {
    sendError(res, 'Failed to fetch waitlist', 500, 'WAITLIST_FETCH_ERROR', error);
  }
}

export const getExpiredWaitlistEntries = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) return sendError(res, 'Unauthorized', 401);

    const now = new Date();

    const expiredEntries = await prisma.waitlist.findMany({
      where: {
        user_id,
        waitlist_status: 'ACTIVE',
        timeSlot: {
          end_time: { lt: now },
        },
      },
      include: {
        timeSlot: {
          include: { lab: true },
        },
      },
    });

    return sendSuccess(res, expiredEntries);
  } catch (error) {
    return sendError(res, 'Failed to fetch expired waitlist entries', 500, getErrorMessage(error));
  }
};

export const leaveWaitlist = async (req: Request, res: Response) => {
  try {
    const waitlistId = req.params.id;
    const userId = req.user?.id;

    const entry = await waitlistService.getWaitlistEntryById(waitlistId);

    if (!entry) {
      return sendError(res, 'Waitlist entry not found', 404);
    }

    if (entry.user_id !== userId) {
      return sendError(res, 'Not authorized to remove this waitlist entry', 403);
    }

    await waitlistService.removeFromWaitlist(waitlistId, 'USER'); // ✅ key update

    return sendSuccess(res, { message: 'Successfully removed from waitlist' });
  } catch (error) {
    return sendError(res, 'Failed to remove from waitlist', 500, 'WAITLIST_DELETE_ERROR', error);
  }
};



