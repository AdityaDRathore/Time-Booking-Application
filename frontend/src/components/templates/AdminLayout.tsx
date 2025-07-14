import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../state/authStore';
import { 
  Shield, 
  LayoutDashboard, 
  Monitor, 
  Users, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  Settings,
  Bell,
  User
} from 'lucide-react';
import { useState } from 'react';

const AdminLayout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const navigationItems = [
    {
      name: 'डैशबोर्ड',
      nameEn: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
      color: 'text-orange-500'
    },
    {
      name: 'लैब्स',
      nameEn: 'Labs',
      path: '/admin/labs',
      icon: Monitor,
      color: 'text-blue-500'
    },
    {
      name: 'उपयोगकर्ता',
      nameEn: 'Users',
      path: '/admin/users',
      icon: Users,
      color: 'text-green-500'
    },
    {
      name: 'रिपोर्ट',
      nameEn: 'Reports',
      path: '/admin/reports',
      icon: BarChart3,
      color: 'text-purple-500'
    }
  ];

  const isActiveLink = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-green-600 rounded-full flex items-center justify-center mr-3">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">व्यवस्थापक</h2>
                  <p className="text-sm text-gray-600">Admin Panel</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition duration-200"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              नेविगेशन | Navigation
            </p>
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = isActiveLink(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center px-4 py-3 rounded-lg transition duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-orange-500 to-green-600 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <IconComponent className={`
                    w-5 h-5 mr-3 transition duration-200
                    ${isActive ? 'text-white' : item.color}
                  `} />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{item.name}</span>
                    <span className="text-xs opacity-75">{item.nameEn}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center p-3 rounded-lg bg-gray-50 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Admin User</p>
                <p className="text-xs text-gray-600">व्यवस्थापक | Administrator</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button className="flex items-center justify-center p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200">
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
              <button className="flex items-center justify-center p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200">
                <Bell className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 group"
            >
              <LogOut className="w-4 h-4 mr-2 group-hover:translate-x-1 transition duration-200" />
              <span className="font-medium">लॉगआउट | Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition duration-200 mr-4"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  प्रशासन पैनल | Administration Panel
                </h1>
                <p className="text-sm text-gray-600">
                  सिस्टम प्रबंधन और नियंत्रण | System Management & Control
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center px-3 py-1 bg-green-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-green-800">ऑनलाइन | Online</span>
              </div>
              
              <button className="p-2 rounded-lg hover:bg-gray-100 transition duration-200 relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;