import api from '../../services/apiClient';
import { Booking } from '../../types/booking';

export const getAllBookings = async (): Promise<Booking[]> => {
  const res = await api.get('/admin/bookings');
  return res.data;
};

export const updateBookingStatus = async ({
  bookingId,
  status,
}: {
  bookingId: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}) => {
  const res = await api.patch(`/admin/bookings/${bookingId}`, { status });
  return res.data;
};
