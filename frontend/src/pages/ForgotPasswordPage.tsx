import React from 'react';

const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4">Forgot Password</h1>
        <p className="text-sm text-gray-500 mb-4">
          Enter your email to receive a password reset link.
        </p>
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded mb-4"
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Send Reset Link
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
