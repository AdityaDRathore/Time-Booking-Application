import React, { useState } from 'react';
import { useAuthStore } from '../state/authStore';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserBookings } from '../api/bookings';
import { getUserWaitlists } from '../api/waitlists';
import { Booking } from '../types/booking';
import { Waitlist } from '../types/waitlist';
import MyWaitlistsPage from './MyWaitlistsPage'; // Adjust path as needed

type Tab = 'upcoming' | 'waitlist' | 'history';

const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');

  const {
    data: bookings = [],
    isLoading: isBookingsLoading,
    error: bookingsError,
  } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: () => getUserBookings('all'),
    enabled: !!user,
  });

  const {
    data: waitlists = [],
    isLoading: isWaitlistsLoading,
    error: waitlistsError,
  } = useQuery({
    queryKey: ['waitlists', 'me'],
    queryFn: getUserWaitlists,
    enabled: !!user,
  });

  const now = new Date();

  const confirmedOrPending = bookings.filter(
    (b: Booking) =>
      (b.booking_status === 'CONFIRMED' || b.booking_status === 'PENDING') &&
      b.timeSlot !== undefined
  );

  const upcomingBookings = confirmedOrPending.filter(
    (b: { timeSlot: any; }) => new Date(b.timeSlot!.start_time) > now
  );

  const pastBookings = confirmedOrPending.filter(
    (b: { timeSlot: any; }) => new Date(b.timeSlot!.end_time) <= now
  );

  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <aside className="w-64 bg-gray-100 p-6 border-r">
        <h2 className="text-xl font-semibold mb-6">Dashboard</h2>
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`w-full text-left px-4 py-2 rounded ${activeTab === 'upcoming' ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'
              }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('waitlist')}
            className={`w-full text-left px-4 py-2 rounded ${activeTab === 'waitlist' ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'
              }`}
          >
            Waitlist
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`w-full text-left px-4 py-2 rounded ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'
              }`}
          >
            Booking History
          </button>
          <button
            onClick={() => navigate('/labs')}
            className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
          >
            Book a Lab
          </button>
        </div>
      </aside>

      {/* Right Content */}
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">Welcome, {user?.user_name}</h2>
          <p className="text-gray-600">Email: {user?.user_email}</p>
          <p className="text-gray-600">Role: {user?.user_role}</p>
        </div>

        {activeTab === 'upcoming' && (
          <section>
            <h3 className="text-xl font-semibold mb-4">Upcoming Labs</h3>
            {isBookingsLoading ? (
              <p>Loading bookings...</p>
            ) : bookingsError ? (
              <p className="text-red-600">Error loading bookings.</p>
            ) : upcomingBookings.length === 0 ? (
              <p className="text-gray-500">No upcoming lab sessions found.</p>
            ) : (
              <ul className="space-y-3">
                {upcomingBookings.map((b: {
                  id: React.Key | null | undefined; timeSlot: {
                    start_time: string | number | Date;
                    end_time: string | number | Date; lab: { lab_name: any; };
                  }; booking_status: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; purpose: any;
                }) => (
                  <li key={b.id} className="border p-4 rounded-md">
                    <p><strong>Lab:</strong> {b.timeSlot?.lab?.lab_name ?? 'N/A'}</p>
                    <p><strong>Date:</strong> {new Date(b.timeSlot!.start_time).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {new Date(b.timeSlot!.start_time).toLocaleTimeString()} – {new Date(b.timeSlot!.end_time).toLocaleTimeString()}</p>
                    <p><strong>Status:</strong> {b.booking_status}</p>
                    <p><strong>Purpose:</strong> {b.purpose || 'N/A'}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {activeTab === 'waitlist' && (
          <section>
            <h3 className="text-xl font-semibold mb-4">Waitlist Status</h3>
            {isWaitlistsLoading ? (
              <p>Loading waitlists...</p>
            ) : waitlistsError ? (
              <p className="text-red-600">Error loading waitlists.</p>
            ) : waitlists.length === 0 ? (
              <p className="text-gray-500">You're not on any waitlists.</p>
            ) : (
              <ul className="space-y-3">
                {waitlists.map((w: { id: React.Key | null | undefined; timeSlot: { lab: { lab_name: any; }; date: any; start_time: string | number | Date; end_time: string | number | Date; }; waitlist_position: any; }) => (
                  <li key={w.id} className="border p-4 rounded-md">
                    <p><strong>Lab:</strong> {w.timeSlot?.lab?.lab_name ?? 'N/A'}</p>
                    <p><strong>Date:</strong> {w.timeSlot?.date ?? 'N/A'}</p>
                    <p><strong>Time:</strong> {w.timeSlot?.start_time && w.timeSlot?.end_time
                      ? `${new Date(w.timeSlot.start_time).toLocaleTimeString()} – ${new Date(w.timeSlot.end_time).toLocaleTimeString()}`
                      : 'N/A'}</p>
                    <p><strong>Position:</strong> {w.waitlist_position ?? 'N/A'}</p> {/* ✅ FIXED */}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {activeTab === 'history' && (
          <section>
            <h3 className="text-xl font-semibold mb-4">Booking History</h3>
            {pastBookings.length === 0 ? (
              <p className="text-gray-500">No past bookings found.</p>
            ) : (
              <ul className="space-y-3">
                {pastBookings.map((b: {
                  id: React.Key | null | undefined; timeSlot: {
                    start_time: string | number | Date;
                    end_time: string | number | Date; lab: { lab_name: any; };
                  }; booking_status: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
                }) => (
                  <li key={b.id} className="border p-4 rounded-md">
                    <p><strong>Lab:</strong> {b.timeSlot?.lab?.lab_name ?? 'N/A'}</p>
                    <p><strong>Date:</strong> {new Date(b.timeSlot!.start_time).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {new Date(b.timeSlot!.start_time).toLocaleTimeString()} – {new Date(b.timeSlot!.end_time).toLocaleTimeString()}</p>
                    <p><strong>Status:</strong> {b.booking_status}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
