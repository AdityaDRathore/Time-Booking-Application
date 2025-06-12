import React from 'react';

const ResetPasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4">Reset Password</h1>
        <input
          type="password"
          placeholder="New Password"
          className="w-full px-4 py-2 border rounded mb-4"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full px-4 py-2 border rounded mb-4"
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Reset Password
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordPage;