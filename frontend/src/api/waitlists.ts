import { Waitlist } from '../types/waitlist';
import apiClient, { ApiResponse, handleApiError } from './index';

/**
 * Get user's active waitlists
 */
export const getUserWaitlists = async (): Promise<Waitlist[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Waitlist[]>>('/waitlist/me');
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Join a waitlist for a time slot
 */
export const joinWaitlist = async (slotId: string, userId: string): Promise<Waitlist> => {
  try {
    const response = await apiClient.post<ApiResponse<Waitlist>>('/waitlist/join', {
      slotId,
      userId,
    });
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Leave a waitlist (if supported by your backend)
 */
export const leaveWaitlist = async (waitlistId: string): Promise<void> => {
  try {
    await apiClient.delete(`/waitlist/${waitlistId}`);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get waitlist position for a specific slot
 */
export const getWaitlistPosition = async (slotId: string, userId?: string): Promise<number> => {
  try {
    const response = await apiClient.get<ApiResponse<{ position: number }>>('/waitlist/position', {
      params: { slotId, ...(userId && { userId }) },
    });
    return response.data.data.position;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// ❌ Removed getAllWaitlistPositions — route does not exist
