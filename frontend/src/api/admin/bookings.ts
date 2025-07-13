// src/api/admin/bookings.ts
import api from '../../services/apiClient';
import { Booking, BookingStatus } from '../../types/booking';

export const getAllBookings = async (): Promise<Booking[]> => {
  const res = await api.get('/admin/bookings');
  return res.data.data; // ✅ fix this line
};


export const updateBookingStatus = async ({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus; // use typed enum if available
}) => {
  const res = await api.patch(`/admin/bookings/${bookingId}/status`, { status });
  return res.data;
};
