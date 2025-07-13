import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../state/authStore';

const SuperAdminLayout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col space-y-4 p-4">
        <h2 className="text-lg font-bold mb-4">Super Admin Panel</h2>
        <Link to="/superadmin" className="hover:text-blue-400">Dashboard</Link>
        <Link to="/superadmin/admin-requests" className="hover:text-blue-400">Admin Requests</Link>
        {/* Add more links if needed */}
        <button
          onClick={handleLogout}
          className="mt-auto bg-red-600 px-3 py-1 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </aside>

      {/* Content */}
      <main className="flex-grow p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default SuperAdminLayout;
