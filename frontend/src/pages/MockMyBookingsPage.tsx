import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelBooking } from '../api/bookings';
import { toast } from 'react-toastify';

// Mock booking data
const mockBookings = [
  {
    id: 'booking1',
    slot: {
      id: 'slot1',
      startTime: '10:00',
      endTime: '11:00',
      date: '2025-06-20',
    },
  },
  {
    id: 'booking2',
    slot: {
      id: 'slot2',
      startTime: '14:00',
      endTime: '15:00',
      date: '2025-06-21',
    },
  },
];

const MockMyBookingsPage = () => {
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => cancelBooking(bookingId),
    onSuccess: () => {
      toast.success('Booking cancelled');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setSelectedBookingId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Cancellation failed');
    },
  });


  const handleCancel = (bookingId: string) => {
    setSelectedBookingId(bookingId);
  };

  const handleConfirmCancel = () => {
    if (selectedBookingId) {
      cancelMutation.mutate(selectedBookingId);
    }
  };

  const closeModal = () => {
    setSelectedBookingId(null);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Bookings</h2>

      <ul className="space-y-4">
        {mockBookings.map((booking) => (
          <li key={booking.id} className="border p-4 rounded shadow flex justify-between items-center">
            <div>
              <p className="font-semibold">{booking.slot.startTime} - {booking.slot.endTime}</p>
              <p className="text-sm text-gray-600">Date: {booking.slot.date}</p>
            </div>
            <button
              onClick={() => handleCancel(booking.id)}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Cancel
            </button>
          </li>
        ))}
      </ul>

      {/* Cancel Confirmation Modal */}
      {selectedBookingId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Cancellation</h2>
            <p>Are you sure you want to cancel this booking?</p>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={closeModal} className="px-4 py-1 border rounded hover:bg-gray-100">No</button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelMutation.isLoading}
                className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {cancelMutation.isLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockMyBookingsPage;
