import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../state/authStore';

const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || user?.user_role !== 'SUPER_ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default SuperAdminRoute;
