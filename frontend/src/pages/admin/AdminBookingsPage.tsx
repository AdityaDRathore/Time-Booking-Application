import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllBookings, updateBookingStatus } from '../../api/admin/bookings';
import { Booking, BookingStatus } from '../../types/booking';
import { useState } from 'react';

const statusOptions = ['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as const;
type StatusFilter = typeof statusOptions[number];

export default function AdminBookingsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>('ALL');

  const {
    data: bookings = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin', 'bookings'],
    queryFn: getAllBookings,
  }) as {
    data: Booking[];
    isLoading: boolean;
    isError: boolean;
  };


  const updateStatusMutation = useMutation({
    mutationFn: updateBookingStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'bookings']);
    },
  });

  const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    if (confirm(`Change status to ${newStatus}?`)) {
      updateStatusMutation.mutate({ bookingId, status: newStatus });
    }
  };

  const filteredBookings =
    filter === 'ALL'
      ? bookings
      : bookings.filter((b) => b.status === filter);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Bookings</h2>

      <div className="mb-4">
        <label className="mr-2 font-medium">Filter by Status:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as StatusFilter)}
          className="border px-3 py-1 rounded"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p>Loading bookings...</p>
      ) : isError ? (
        <p className="text-red-600">Error loading bookings</p>
      ) : (
        <table className="min-w-full border bg-white">
          <thead>
            <tr>
              <th className="border p-2">User</th>
              <th className="border p-2">Lab</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Time</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((b) => (
              <tr key={b.id}>
                <td className="border p-2">{b.user?.user_name ?? 'N/A'}</td>
                <td className="border p-2">{b.timeSlot?.labId ?? 'N/A'}</td>
                <td className="border p-2">{b.timeSlot?.date ?? 'N/A'}</td>
                <td className="border p-2">
                  {b.timeSlot?.startTime ?? 'N/A'} - {b.timeSlot?.endTime ?? 'N/A'}
                </td>
                <td className="border p-2">{b.status}</td>
                <td className="border p-2 space-x-2">
                  {[BookingStatus.CONFIRMED, BookingStatus.CANCELLED, BookingStatus.COMPLETED].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(b.id, status)}
                      className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                    >
                      {status}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
