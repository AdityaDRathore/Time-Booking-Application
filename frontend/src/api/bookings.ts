import apiClient, { ApiResponse, handleApiError } from './index';
import { Booking, BookingStatus } from '../types/booking';

/**
 * Get all bookings for current user
 */
export const getUserBookings = async (): Promise<Booking[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Booking[]>>('/bookings/me');
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Create a new booking
 */
export const createBooking = async (slotId: string): Promise<Booking> => {
  try {
    const response = await apiClient.post<ApiResponse<Booking>>('/bookings', { slotId });
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (bookingId: string): Promise<Booking> => {
  try {
    const response = await apiClient.put<ApiResponse<Booking>>(`/bookings/${bookingId}/cancel`);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get booking by ID
 */
export const getBookingById = async (bookingId: string): Promise<Booking> => {
  try {
    const response = await apiClient.get<ApiResponse<Booking>>(`/bookings/${bookingId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Admin functions

/**
 * Get all bookings for a lab (Admin only)
 */
export const getLabBookings = async (labId: string): Promise<Booking[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Booking[]>>(`/admin/labs/${labId}/bookings`);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update booking status (Admin only)
 */
export const updateBookingStatus = async (bookingId: string, status: BookingStatus): Promise<Booking> => {
  try {
    const response = await apiClient.put<ApiResponse<Booking>>(`/admin/bookings/${bookingId}/status`, { status });
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};