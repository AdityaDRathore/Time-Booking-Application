import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/apiClient';

const schema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

const ResetPasswordPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const token = searchParams.get('token');

  const onSubmit = async (data: FormData) => {
    if (!token) {
      setServerError('Invalid or missing token.');
      return;
    }

    try {
      setServerError('');
      await api.post('/auth/reset-password', {
        token,
        newPassword: data.password,
      });
      navigate('/login');
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex flex-col">
      <header className="bg-white shadow-lg border-b-4 border-orange-500">
        <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white py-2 text-sm px-4 flex justify-between">
          <span>🏛️ मध्य प्रदेश सरकार | Government of Madhya Pradesh</span>
          <div className="flex gap-4">
            <span>🇮🇳 भारत सरकार | Government of India</span>
            <span>डिजिटल इंडिया | Digital India</span>
          </div>
        </div>
        <div className="container mx-auto px-4 py-4 flex items-center space-x-4">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-green-600 rounded-full flex items-center justify-center shadow-lg text-white font-bold text-xl">🧪</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">डिजिटल लैब बुकिंग</h1>
            <p className="text-sm text-gray-600">मध्य प्रदेश सरकार | Government of Madhya Pradesh</p>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-2xl mt-12 mb-16 border border-gray-200">
          <header className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-800">Reset Your Password</h1>
            <p className="text-sm text-gray-500 mt-2">
              Back to{' '}
              <Link to="/login" className="text-orange-600 hover:underline font-medium">
                Login
              </Link>
            </p>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="password" className="text-sm font-medium text-gray-700 block mb-1">
                New Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 block mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {serverError && <p className="text-sm text-red-600 text-center">{serverError}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 text-white font-semibold rounded-lg transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-6 text-center text-sm">
        &copy; 2025 मध्य प्रदेश सरकार | Government of Madhya Pradesh. सभी अधिकार सुरक्षित।
      </footer>
    </div>
  );
};

export default ResetPasswordPage;
