import React, { useState } from 'react';
import { Booking } from '../../types/booking';
import { cancelBooking } from '../../api/bookings';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  bookings: Booking[];
}

const MyBookingsList: React.FC<Props> = ({ bookings }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      setLoadingId(bookingId);
      await cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      window.location.reload(); // Optional: refetch using queryClient instead
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel');
    } finally {
      setLoadingId(null);
    }
  };
  const sorted = [...bookings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


  return (
    <div className="space-y-4">
      {bookings.length === 0 && <p>No bookings found.</p>}
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="p-4 border rounded shadow bg-white flex flex-col md:flex-row md:justify-between md:items-center"
        >
          <div>
            <p><strong>Date:</strong> {booking.date}</p>
            <p><strong>Time:</strong> {booking.startTime}</p>
            <p><strong>Status:</strong> {booking.status}</p>
            <p><strong>Lab:</strong> {booking.timeSlot?.labId || 'N/A'}</p>
          </div>
          {booking.status === 'CONFIRMED' && (
            <button
              className="mt-3 md:mt-0 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 disabled:opacity-50"
              onClick={() => handleCancel(booking.id)}
              disabled={loadingId === booking.id}
            >
              {loadingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default MyBookingsList;
