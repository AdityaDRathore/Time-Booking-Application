import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../state/authStore';
import { useSocket } from '../../hooks/useSocket';
import NotificationBell from '../molecules/NotificationBell';

const MainLayout: React.FC = () => {
  useSocket();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">
            Time Booking App
          </Link>

          <nav className="flex gap-4 items-center">
            <Link to="/" className="hover:text-blue-200 transition-colors">
              Home
            </Link>
            <Link to="/dashboard" className="hover:text-blue-200 transition-colors">
              Dashboard
            </Link>
            <Link to="/login" className="hover:text-blue-200 transition-colors">
              Login
            </Link>
            <NotificationBell />
            <Header />
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Time Booking Application. All rights reserved.</p>
          <p className="text-sm mt-2">Efficient Lab Access Management</p>
        </div>
      </footer>
    </div>
  );
};

const Header: React.FC = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth(); // optionally call logout API here
    navigate('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
    >
      Logout
    </button>
  );
};

export default MainLayout;
