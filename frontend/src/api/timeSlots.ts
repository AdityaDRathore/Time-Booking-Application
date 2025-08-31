import { TimeSlot } from '../types/timeSlot';
import apiClient, { ApiResponse, handleApiError } from './index';

const mapSlot = (slot: any): TimeSlot => ({
  id: slot.id,
  lab_id: slot.lab_id,
  date: slot.date,
  start_time: slot.start_time,
  end_time: slot.end_time,
  status: slot.status,
  createdAt: slot.createdAt,
  updatedAt: slot.updatedAt,
  lab: slot.lab,
  isBooked: slot.isBooked ?? false,
  isFullyBooked: slot.isFullyBooked ?? false, // ✅
  seatsLeft: slot.seatsLeft ?? 0,             // ✅
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
export const getAvailableTimeSlots = async (
  labId: string,
  date?: string
): Promise<TimeSlot[]> => {
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

/**
 * Admin - Create single time slot
 */
export const createTimeSlot = async (
  labId: string,
  timeSlotData: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt' | 'lab'>
): Promise<TimeSlot> => {
  try {
    const response = await apiClient.post<ApiResponse<any>>(
      `/admin/labs/${labId}/time-slots`,
      timeSlotData
    );
    return mapSlot(response.data.data);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Admin - Update a time slot
 */
export const updateTimeSlot = async (
  slotId: string,
  timeSlotData: Partial<Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt' | 'lab'>>
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

/**
 * Admin - Delete a time slot
 */
export const deleteTimeSlot = async (slotId: string): Promise<void> => {
  try {
    await apiClient.delete(`/admin/time-slots/${slotId}`);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
