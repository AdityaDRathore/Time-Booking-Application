import React from 'react';
import { useAuthStore } from '../state/authStore';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Welcome, {user?.user_name}</h2>
        <p className="text-gray-600">Email: {user?.user_email}</p>
        <p className="text-gray-600">Role: {user?.user_role}</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
        <div className="bg-gray-100 p-4 rounded-md text-center">
          <p className="text-gray-500">You don't have any active bookings.</p>
          <button
            onClick={() => navigate('/labs')}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Book a Lab
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Labs</h2>
          <div className="bg-gray-100 p-4 rounded-md text-center">
            <p className="text-gray-500">No upcoming lab sessions found.</p>
          </div>
        </div>

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
