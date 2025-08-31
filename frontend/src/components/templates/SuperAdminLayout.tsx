import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../state/authStore';
import { 
  Shield, 
  Home, 
  Users, 
  LogOut, 
  Settings, 
  BarChart3,
  FileText,
  Bell,
  User,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const SuperAdminLayout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const navigationItems = [
    {
      path: '/superadmin',
      name: 'Dashboard',
      nameHindi: 'डैशबोर्ड',
      icon: Home,
      exact: true
    },
    
  ];

  const isActiveRoute = (path: string, exact: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-80 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 
        text-white transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Super Admin</h2>
                  <p className="text-sm text-gray-300">सुपर एडमिन पैनल</p>
                </div>
              </div>
              <button 
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path, item.exact);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                    <div className="flex flex-col">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs opacity-75">{item.nameHindi}</span>
                    </div>
                  </div>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-white" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-green-400 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium">Super Admin</p>
                <p className="text-sm text-gray-400">admin@mp.gov.in</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg shadow-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition duration-300"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-orange-600" />
              <span className="font-bold text-gray-800">Super Admin</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="w-4 h-4 text-orange-600" />
            <span>Super Admin</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-800 font-medium">
              {navigationItems.find(item => isActiveRoute(item.path, item.exact))?.name || 'Dashboard'}
            </span>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;