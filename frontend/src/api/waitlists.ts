import apiClient, { ApiResponse, handleApiError } from './index';
import { Waitlist } from '../types/waitlist';

/**
 * Get user's active waitlists
 */
export const getUserWaitlists = async (): Promise<Waitlist[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Waitlist[]>>('/waitlists/me');
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Join a waitlist for a time slot
 */
export const joinWaitlist = async (slotId: string): Promise<Waitlist> => {
  try {
    const response = await apiClient.post<ApiResponse<Waitlist>>('/waitlists', { slotId });
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Leave a waitlist
 */
export const leaveWaitlist = async (waitlistId: string): Promise<void> => {
  try {
    await apiClient.delete(`/waitlists/${waitlistId}`);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get waitlist position for a specific slot
 */
export const getWaitlistPosition = async (slotId: string): Promise<number> => {
  try {
    const response = await apiClient.get<ApiResponse<{ position: number }>>(`/waitlists/position/${slotId}`);
    return response.data.data.position;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};