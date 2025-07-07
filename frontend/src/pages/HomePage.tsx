import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 px-4">
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-lg shadow-xl rounded-3xl p-10 text-center animate-fade-in">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
          Welcome to Time Booking
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Efficiently manage access to coding labs in Madhya Pradesh with our modern platform.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition duration-200"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 bg-white text-blue-600 border border-blue-600 font-semibold rounded-lg shadow hover:bg-blue-50 transition duration-200"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-lg shadow hover:bg-gray-200 transition duration-200"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
