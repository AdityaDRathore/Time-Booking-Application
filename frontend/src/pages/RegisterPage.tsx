import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../state/authStore';
import api from '../services/apiClient';
import { useNavigate, Link } from 'react-router-dom';

// Zod validation schema
const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']),
  org_name: z.string().optional(),
  org_type: z.string().optional(),
  org_location: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'ADMIN') {
    if (!data.org_name) ctx.addIssue({ path: ['org_name'], code: z.ZodIssueCode.custom, message: 'Organization name is required' });
    if (!data.org_type) ctx.addIssue({ path: ['org_type'], code: z.ZodIssueCode.custom, message: 'Organization type is required' });
    if (!data.org_location) ctx.addIssue({ path: ['org_location'], code: z.ZodIssueCode.custom, message: 'Organization location is required' });
  }
});

type RegisterInput = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'USER' },
  });

  const watchRole = watch('role');

  const onSubmit = async (data: RegisterInput) => {
    try {
      const res = await api.post('/auth/register', data);
      const { accessToken, user, message } = res.data.data;

      if (data.role === 'ADMIN') {
        alert(message || 'Admin registration request sent.');
        navigate('/login');
      } else {
        setAuth(user, accessToken);
        navigate(user.user_role === 'SUPER_ADMIN' ? '/superadmin' :
                 user.user_role === 'ADMIN' ? '/admin' : '/dashboard');
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex flex-col">
      {/* Government Header */}
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

      <main className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-xl bg-white p-8 md:p-10 rounded-2xl shadow-2xl mt-12 mb-16 border border-gray-200">
          {/* Form Heading */}
          <header className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-800">Create your account</h1>
            <p className="text-sm text-gray-500 mt-2">
              Already have one?{' '}
              <Link to="/login" className="text-orange-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </header>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="text-sm text-gray-700">First Name</label>
                <input
                  {...register('firstName')}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {errors.firstName && <p className="text-sm text-red-600">{errors.firstName.message}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="text-sm text-gray-700">Last Name</label>
                <input
                  {...register('lastName')}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-sm text-gray-700">Email</label>
              <input
                type="email"
                {...register('email')}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="text-sm text-gray-700">Password</label>
              <input
                type="password"
                {...register('password')}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="role" className="text-sm text-gray-700">Role</label>
              <select
                {...register('role')}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
              {errors.role && <p className="text-sm text-red-600">{errors.role.message}</p>}
            </div>

            {watchRole === 'ADMIN' && (
              <>
                <div>
                  <label htmlFor="org_name" className="text-sm text-gray-700">Organization Name</label>
                  <input
                    {...register('org_name')}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {errors.org_name && <p className="text-sm text-red-600">{errors.org_name.message}</p>}
                </div>

                <div>
                  <label htmlFor="org_type" className="text-sm text-gray-700">Organization Type</label>
                  <input
                    {...register('org_type')}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {errors.org_type && <p className="text-sm text-red-600">{errors.org_type.message}</p>}
                </div>

                <div>
                  <label htmlFor="org_location" className="text-sm text-gray-700">Organization Location</label>
                  <input
                    {...register('org_location')}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {errors.org_location && <p className="text-sm text-red-600">{errors.org_location.message}</p>}
                </div>
              </>
            )}

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
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Registering...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer Link */}
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

export default RegisterPage;
