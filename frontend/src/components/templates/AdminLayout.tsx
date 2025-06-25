import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../state/authStore';

const AdminLayout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col space-y-4 p-4">
        <h2 className="text-lg font-bold mb-4">Admin Panel</h2>
        <Link to="/admin" className="hover:text-blue-300">Dashboard</Link>
        <Link to="/admin/labs" className="hover:text-blue-300">Labs</Link>
        <Link to="/admin/users" className="hover:text-blue-300">Users</Link>
        <Link to="/admin/reports" className="hover:text-blue-300">Reports</Link>
        <button onClick={handleLogout} className="mt-auto bg-red-600 px-3 py-1 rounded hover:bg-red-700">
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

export default AdminLayout;
