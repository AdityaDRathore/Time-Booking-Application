import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../state/authStore';
import { getUserBookings } from '../api/bookings';
import MyBookingsList from '../components/organisms/MyBookingsList';

const MyBookingsPage = () => {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('all');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings', user?.id, filter],
    queryFn: () => getUserBookings(user!.id, filter),
    enabled: !!user?.id,
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">My Bookings</h1>

      <div className="mb-4">
        <label className="mr-2 font-semibold">Filter:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="border px-3 py-2 rounded"
        >
          <option value="all">All</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <MyBookingsList bookings={bookings} />
      )}
    </div>
  );
};

export default MyBookingsPage;
