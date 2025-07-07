import React from 'react';
import { useAuthStore } from '../state/authStore';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserBookings } from '../api/bookings';
import { Booking } from '../types/booking';

const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const {
    data: bookings = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: () => getUserBookings('all'),
    enabled: !!user,
  });

  const now = new Date();

  const activeBookings = bookings.filter(
    (b: { booking_status: string; timeSlot: { end_time: string | number | Date; }; }) =>
      (b.booking_status === 'CONFIRMED' || b.booking_status === 'PENDING') &&
      new Date(b.timeSlot.end_time) >= now
  );

  const upcomingBookings = activeBookings.filter(
    (b: { timeSlot: { start_time: string | number | Date; }; }) => new Date(b.timeSlot.start_time) > now
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Welcome, {user?.user_name}</h2>
        <p className="text-gray-600">Email: {user?.user_email}</p>
        <p className="text-gray-600">Role: {user?.user_role}</p>
      </div>

      {/* My Bookings Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Bookings</h2>
          <button
            onClick={() => navigate('/labs')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Book a Lab
          </button>
        </div>

        {isLoading ? (
          <p>Loading bookings...</p>
        ) : error ? (
          <p className="text-red-600">Error loading bookings.</p>
        ) : activeBookings.length === 0 ? (
          <div className="bg-gray-100 p-4 rounded-md text-center">
            <p className="text-gray-500">You don't have any active bookings.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {activeBookings.map((b: { id: React.Key | null | undefined; timeSlot: { lab: { lab_name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }; start_time: string | number | Date; end_time: string | number | Date; }; booking_status: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; purpose: any; }) => (
              <li key={b.id} className="border p-4 rounded-md">
                <p>
                  <strong>Lab:</strong> {b.timeSlot.lab.lab_name}
                </p>
                <p>
                  <strong>Date:</strong>{' '}
                  {new Date(b.timeSlot.start_time).toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong>{' '}
                  {new Date(b.timeSlot.start_time).toLocaleTimeString()} –{' '}
                  {new Date(b.timeSlot.end_time).toLocaleTimeString()}
                </p>
                <p>
                  <strong>Status:</strong> {b.booking_status}
                </p>
                <p>
                  <strong>Purpose:</strong> {b.purpose || 'N/A'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Upcoming Labs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Labs</h2>
          {upcomingBookings.length === 0 ? (
            <div className="bg-gray-100 p-4 rounded-md text-center">
              <p className="text-gray-500">No upcoming lab sessions found.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {upcomingBookings.map((b: { id: React.Key | null | undefined; timeSlot: { lab: { lab_name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }; start_time: string | number | Date; }; }) => (
                <li key={b.id} className="border p-3 rounded-md">
                  <p>
                    <strong>{b.timeSlot.lab.lab_name}</strong> on{' '}
                    {new Date(b.timeSlot.start_time).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Waitlist Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Waitlist Status</h2>
          <div className="bg-gray-100 p-4 rounded-md text-center">
            <p className="text-gray-500">You're not on any waitlists.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
