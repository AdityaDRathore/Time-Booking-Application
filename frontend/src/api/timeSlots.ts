import { TimeSlot } from '../types/timeSlot';

import apiClient, { ApiResponse, handleApiError } from './index';

/**
 * Get all time slots for a lab
 */
export const getTimeSlotsByLabId = async (labId: string): Promise<TimeSlot[]> => {
  try {
    const response = await apiClient.get<ApiResponse<TimeSlot[]>>(`/labs/${labId}/time-slots`);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get available time slots for a lab
 */
export const getAvailableTimeSlots = async (labId: string, date?: string): Promise<TimeSlot[]> => {
  try {
    const queryParams = date ? `?date=${date}` : '';
    const response = await apiClient.get<ApiResponse<TimeSlot[]>>(
      `/labs/${labId}/time-slots/available${queryParams}`
    );
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get time slot by ID
 */
export const getTimeSlotById = async (slotId: string): Promise<TimeSlot> => {
  try {
    const response = await apiClient.get<ApiResponse<TimeSlot>>(`/time-slots/${slotId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Admin functions

/**
 * Create new time slot (Admin only)
 */
export const createTimeSlot = async (
  timeSlotData: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>
): Promise<TimeSlot> => {
  try {
    const response = await apiClient.post<ApiResponse<TimeSlot>>('/admin/time-slots', timeSlotData);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update time slot (Admin only)
 */
export const updateTimeSlot = async (
  slotId: string,
  timeSlotData: Partial<TimeSlot>
): Promise<TimeSlot> => {
  try {
    const response = await apiClient.put<ApiResponse<TimeSlot>>(
      `/admin/time-slots/${slotId}`,
      timeSlotData
    );
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Delete time slot (Admin only)
 */
export const deleteTimeSlot = async (slotId: string): Promise<void> => {
  try {
    await apiClient.delete(`/admin/time-slots/${slotId}`);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
