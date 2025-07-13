import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllBookings, updateBookingStatus } from '../../api/admin/bookings';
import { Booking, BookingStatus } from '../../types/booking';
import { useState } from 'react';

const statusOptions = ['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as const;
type StatusFilter = typeof statusOptions[number];

export default function AdminBookingsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>('ALL');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'bookings'],
    queryFn: getAllBookings,
  });

  const bookings = Array.isArray(data) ? data : [];

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
      : bookings.filter((b) => b.booking_status?.toUpperCase() === filter)

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
      ) : filteredBookings.length === 0 ? (
        <p>No bookings found for selected filter.</p>
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
                <td className="border p-2">{b.timeSlot?.lab?.lab_name ?? 'N/A'}</td>
                <td className="border p-2">
                  {b.timeSlot?.date
                    ? new Date(b.timeSlot.date).toLocaleDateString()
                    : 'N/A'}
                </td>
                <td className="border p-2">
                  {b.timeSlot?.start_time
                    ? new Date(b.timeSlot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'N/A'}{' '}
                  -{' '}
                  {b.timeSlot?.end_time
                    ? new Date(b.timeSlot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'N/A'}
                </td>
                <td className="border p-2">{b.booking_status}</td>
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
  console.log('Raw bookings:', bookings);
  console.log('Current filter:', filter);
  console.log('Filtered bookings:', filteredBookings);

}
