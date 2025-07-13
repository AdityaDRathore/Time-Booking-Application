import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';
import React from 'react';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore.persist.hasHydrated();
  console.log('ProtectedRoute token:', useAuthStore.getState().token);

  if (!hasHydrated) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
