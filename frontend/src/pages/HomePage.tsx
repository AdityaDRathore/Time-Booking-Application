import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to the Time Booking Application</h1>
      <p className="text-lg mb-4">
        Efficiently manage access to coding labs in Madhya Pradesh with our platform.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Link
          to="/dashboard"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </Link>
        <Link
          to="/login"
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          Register
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
