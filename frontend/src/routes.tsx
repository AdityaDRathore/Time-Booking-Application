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
import MyBookingsPage from './pages/MyBookingsPage'; // fixed filename typo
import MyWaitlistsPage from './pages/MyWaitlistsPage';
import AdminRoute from './components/routeGuards/AdminRoute';
import AdminLayout from './components/templates/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminLabsPage from './pages/admin/AdminLabsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminLabTimeSlotsPage from './pages/admin/AdminLabTimeSlotsPage'; // fixed import path
import UserDetailsPage from './pages/admin/UserDetailsPage'; // fixed import path



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
      { path: 'reports', element: <AdminReportsPage /> },
      {
        path: '/admin/users/:id',
        element: <UserDetailsPage />,
      },
      {
        path: 'labs/:labId/slots',
        element: (
          <AdminRoute>
            <AdminLabTimeSlotsPage />
          </AdminRoute>
        ),
      },

    ],
  },
];

export default routes;
