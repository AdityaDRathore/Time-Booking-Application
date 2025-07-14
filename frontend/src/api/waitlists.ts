import { Waitlist } from '../types/waitlist';
import apiClient, { ApiResponse, handleApiError } from './index';

/**
 * Get the authenticated user's active waitlists
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
 * Join a waitlist for a specific time slot
 * Ensures user cannot join twice and waitlist max is 5
 */
export const joinWaitlist = async (slotId: string, userId: string): Promise<Waitlist> => {
  try {
    const response = await apiClient.post<ApiResponse<Waitlist>>('/waitlist/join', {
      slot_id: slotId,  // ✅ snake_case to match backend schema
      user_id: userId,
    });
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
/**
 * Leave a waitlist entry (optional support)
 */
export const leaveWaitlist = async (waitlistId: string): Promise<void> => {
  try {
    await apiClient.delete(`/waitlist/${waitlistId}`);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get the current user's position in the waitlist for a specific slot
 */
export const getWaitlistPosition = async (slotId: string, userId: string): Promise<number> => {
  try {
    const response = await apiClient.get<ApiResponse<{ position: number }>>('/waitlist/position', {
      params: { slotId, userId }, // ✅ camelCase
    });
    return response.data.data.position;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
