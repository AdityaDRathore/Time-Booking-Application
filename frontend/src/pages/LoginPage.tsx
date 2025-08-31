import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '../lib/validators/loginSchema';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/apiClient';
import { useAuthStore } from '../state/authStore';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setErrorMsg('');
      const response = await api.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      const { accessToken, user } = response.data.data;
      useAuthStore.getState().setAuth(user, accessToken);

      switch (user.user_role) {
        case 'SUPER_ADMIN':
          navigate('/superadmin');
          break;
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'USER':
        default:
          navigate('/dashboard');
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Login failed';
      setErrorMsg(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex flex-col">
      {/* Top Gov Header */}
      <header className="bg-white shadow-lg border-b-4 border-orange-500">
        <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white py-2 text-sm px-4 flex justify-between">
          <span>🏛️ मध्य प्रदेश सरकार | Government of Madhya Pradesh</span>
          <div className="flex gap-4">
            <span>🇮🇳 भारत सरकार | Government of India</span>
            <span>डिजिटल इंडिया | Digital India</span>
          </div>
        </div>
        <div className="container mx-auto px-4 py-4 flex items-center space-x-4">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-green-600 rounded-full flex items-center justify-center shadow-lg text-white font-bold text-xl">
            🧪
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">डिजिटल लैब बुकिंग</h1>
            <p className="text-sm text-gray-600">मध्य प्रदेश सरकार | Government of Madhya Pradesh</p>
          </div>
        </div>
      </header>

      {/* Login Box */}
      <main className="flex-grow flex items-center justify-center px-4">
  <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-2xl mt-12 mb-16 border border-gray-200">
    <header className="mb-6 text-center">
      <h1 className="text-3xl font-bold text-gray-800">Sign in to your account</h1>
      <p className="text-sm text-gray-500 mt-2">
        Don’t have an account?{' '}
        <Link to="/register" className="text-orange-600 hover:underline font-medium">
          Register
        </Link>
      </p>
    </header>

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email Field */}
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          placeholder="you@example.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-2 px-1 flex items-center text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
        <div className="text-right mt-1">
          <Link to="/forgot-password" className="text-sm text-orange-600 hover:underline">
            Forgot your password?
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <p className="text-center text-sm text-red-600">{errorMsg}</p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 px-4 text-white font-semibold rounded-lg transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2
                   bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
      >
        {isSubmitting ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>

    <footer className="mt-6 text-center">
      <Link to="/" className="text-sm text-orange-600 hover:underline">
        ← Back to Home
      </Link>
    </footer>
  </div>
</main>


      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 text-center text-sm">
        &copy; 2025 मध्य प्रदेश सरकार | Government of Madhya Pradesh. सभी अधिकार सुरक्षित।
      </footer>
    </div>
  );
};

export default LoginPage;
