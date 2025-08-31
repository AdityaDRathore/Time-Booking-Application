import { RouteObject } from 'react-router-dom';
import MainLayout from './components/templates/MainLayout';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import LabListPage from './pages/LabListPage';
import LabDetailsPage from './pages/LabDetailsPage';
import MyBookingsPage from './pages/MyBookingsPage';
import MyWaitlistsPage from './pages/MyWaitlistsPage';
import NotificationsPage from './pages/NotificationsPage';

import AdminRoute from './components/routeGuards/AdminRoute';
import AdminLayout from './components/templates/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminLabsPage from './pages/admin/AdminLabsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminLabTimeSlotsPage from './pages/admin/AdminLabTimeSlotsPage';
import AdminLabWaitlistPage from './pages/admin/AdminLabWaitlistPage';
import UserDetailsPage from './pages/admin/UserDetailsPage';

import SuperAdminRoute from './components/routeGuards/SuperAdminRoute';
import SuperAdminLayout from './components/templates/SuperAdminLayout';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-bookings',
        element: (
          <ProtectedRoute>
            <MyBookingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-waitlists',
        element: (
          <ProtectedRoute>
            <MyWaitlistsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'notifications',
        element: (
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/labs',
    element: <MainLayout />,
    children: [
      { index: true, element: <LabListPage /> },
      {
        path: ':id',
        element: <LabDetailsPage />,
      },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'labs', element: <AdminLabsPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'users/:id', element: <UserDetailsPage /> },
      { path: 'reports', element: <AdminReportsPage /> },
      { path: 'bookings', element: <AdminBookingsPage /> },
      {
        path: 'labs/:labId/time-slots',
        element: (
          <AdminRoute>
            <AdminLabTimeSlotsPage />
          </AdminRoute>
        ),
      },
      {
        path: 'labs/:labId/waitlist',
        element: (
          <AdminRoute>
            <AdminLabWaitlistPage />
          </AdminRoute>
        ),
      },
    ],
  },
  {
    path: '/superadmin',
    element: (
      <SuperAdminRoute>
        <SuperAdminLayout />
      </SuperAdminRoute>
    ),
    children: [
      { index: true, element: <SuperAdminDashboard /> },
    ],
  },
];

export default routes;
