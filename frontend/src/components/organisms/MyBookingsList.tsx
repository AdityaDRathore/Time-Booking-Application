import React, { useState } from 'react';
import { Booking } from '../../types/booking';
import { cancelBooking } from '../../api/bookings';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Monitor, XCircle } from 'lucide-react';

interface Props {
  bookings: Booking[];
}

const MyBookingsList: React.FC<Props> = ({ bookings }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      setLoadingId(bookingId);
      await cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      queryClient.invalidateQueries(['bookings']);
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel');
    } finally {
      setLoadingId(null);
    }
  };

  const sorted = [...bookings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (bookings.length === 0) {
    return <p className="text-center text-gray-600">No bookings found.</p>;
  }

  return (
    <div className="space-y-6">
      {sorted.map((booking) => (
        <div
          key={booking.id}
          className="bg-gradient-to-br from-orange-50 to-green-50 border border-orange-100 rounded-xl shadow hover:shadow-md transition duration-300 p-6"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xl font-semibold text-orange-800 mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {booking.date}
              </h3>

              <p className="text-sm text-gray-700 flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Time:</span> {booking.startTime}
              </p>

              <p className="text-sm text-gray-700 flex items-center gap-2 mb-1">
                <Monitor className="w-4 h-4" />
                <span className="font-medium">Lab:</span>{' '}
                {booking.timeSlot?.lab?.lab_name || 'N/A'}
              </p>

              <p className="text-sm text-gray-700">
                <span className="font-medium">Status:</span>{' '}
                <span className={`font-semibold ${booking.booking_status === 'CANCELLED' ? 'text-red-600' : 'text-green-700'}`}>
                  {booking.booking_status}
                </span>
              </p>
            </div>

            {booking.booking_status === 'CONFIRMED' && (
              <div className="flex items-start md:items-center justify-end">
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full flex items-center gap-2 disabled:opacity-50"
                  onClick={() => handleCancel(booking.id)}
                  disabled={loadingId === booking.id}
                >
                  <XCircle className="w-4 h-4" />
                  {loadingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyBookingsList;
