import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">
            Time Booking App
          </Link>

          <nav className="flex gap-4">
            <Link to="/" className="hover:text-blue-200 transition-colors">
              Home
            </Link>
            <Link to="/dashboard" className="hover:text-blue-200 transition-colors">
              Dashboard
            </Link>
            <Link to="/login" className="hover:text-blue-200 transition-colors">
              Login
            </Link>
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

export default MainLayout;
