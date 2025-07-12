import { TimeSlot } from '../types/timeSlot';
import apiClient, { ApiResponse, handleApiError } from './index';

const mapSlot = (slot: any): TimeSlot => ({
  id: slot.id,
  labId: slot.lab_id,
  date: slot.date,
  startTime: slot.start_time,
  endTime: slot.end_time,
  status: slot.status,
  isBooked: slot.isBooked ?? slot.status === 'BOOKED', // fallback if needed
  createdAt: slot.createdAt,
  updatedAt: slot.updatedAt,
});


/**
 * Get all time slots for a lab
 */
export const getTimeSlotsByLabId = async (labId: string): Promise<TimeSlot[]> => {
  try {
    const response = await apiClient.get<ApiResponse<any[]>>(`/labs/${labId}/time-slots`);
    return response.data.data.map(mapSlot);
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
    const response = await apiClient.get<ApiResponse<any[]>>(
      `/labs/${labId}/time-slots/available${queryParams}`
    );
    return response.data.data.map(mapSlot);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get time slot by ID
 */
export const getTimeSlotById = async (slotId: string): Promise<TimeSlot> => {
  try {
    const response = await apiClient.get<ApiResponse<any>>(`/time-slots/${slotId}`);
    return mapSlot(response.data.data);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Admin functions

export const createTimeSlot = async (
  timeSlotData: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>
): Promise<TimeSlot> => {
  try {
    const response = await apiClient.post<ApiResponse<any>>('/admin/time-slots', timeSlotData);
    return mapSlot(response.data.data);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const updateTimeSlot = async (
  slotId: string,
  timeSlotData: Partial<TimeSlot>
): Promise<TimeSlot> => {
  try {
    const response = await apiClient.put<ApiResponse<any>>(
      `/admin/time-slots/${slotId}`,
      timeSlotData
    );
    return mapSlot(response.data.data);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const deleteTimeSlot = async (slotId: string): Promise<void> => {
  try {
    await apiClient.delete(`/admin/time-slots/${slotId}`);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
