import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../state/authStore';
import { useSocket } from '../../hooks/useSocket';
import NotificationBell from '../molecules/NotificationBell';
import { Monitor, Bell, User, LogOut, Home, BarChart3, Calendar, Settings } from 'lucide-react';

const MainLayout: React.FC = () => {
  useSocket();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Government Header */}
      <header className="bg-white shadow-lg border-b-4 border-orange-500">
        {/* Top Government Bar */}
        <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white py-2">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span>🏛️ मध्य प्रदेश सरकार | Government of Madhya Pradesh</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>🇮🇳 भारत सरकार | Government of India</span>
                <span>डिजिटल इंडिया | Digital India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <Link to="/" className="flex items-center space-x-4 hover:opacity-90 transition-opacity">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">डिजिटल लैब बुकिंग</h1>
                <p className="text-sm text-gray-600">मध्य प्रदेश सरकार | Government of Madhya Pradesh</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition duration-200"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">होम | Home</span>
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition duration-200"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm font-medium">डैशबोर्ड | Dashboard</span>
              </Link>
              <Link
                to="/login"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition duration-200"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">लॉगिन | Login</span>
              </Link>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <NotificationBell />
              </div>

              {/* User Profile & Logout */}
              <Header />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Government Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">संपर्क | Contact</h3>
              <p className="text-gray-300">मध्य प्रदेश सरकार</p>
              <p className="text-gray-300">भोपाल, मध्य प्रदेश 462001</p>
              <p className="text-gray-300">📞 0755-2441000</p>
              <p className="text-gray-300">✉️ support@mpdigitallab.gov.in</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">त्वरित लिंक | Quick Links</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/about" className="hover:text-orange-400 transition duration-200">हमारे बारे में | About Us</Link></li>
                <li><Link to="/labs" className="hover:text-orange-400 transition duration-200">लैब स्थान | Lab Locations</Link></li>
                <li><Link to="/help" className="hover:text-orange-400 transition duration-200">सहायता | Help & Support</Link></li>
                <li><Link to="/privacy" className="hover:text-orange-400 transition duration-200">नीति | Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">सेवाएं | Services</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/booking" className="hover:text-orange-400 transition duration-200">लैब बुकिंग | Lab Booking</Link></li>
                <li><Link to="/training" className="hover:text-orange-400 transition duration-200">प्रशिक्षण | Training</Link></li>
                <li><Link to="/certification" className="hover:text-orange-400 transition duration-200">प्रमाणन | Certification</Link></li>
                <li><Link to="/reports" className="hover:text-orange-400 transition duration-200">रिपोर्ट | Reports</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">सामाजिक मीडिया | Social Media</h3>
              <div className="flex space-x-4 mb-4">
                <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition duration-300">
                  <span className="text-sm">📘</span>
                </a>
                <a href="#" className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition duration-300">
                  <span className="text-sm">🐦</span>
                </a>
                <a href="#" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition duration-300">
                  <span className="text-sm">📺</span>
                </a>
                <a href="#" className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition duration-300">
                  <span className="text-sm">💬</span>
                </a>
              </div>
              <p className="text-xs text-gray-400">सरकारी अपडेट्स के लिए फॉलो करें</p>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} मध्य प्रदेश सरकार | Government of Madhya Pradesh. सभी अधिकार सुरक्षित।
              </p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <span className="text-xs text-gray-400">डिजिटल इंडिया पहल का हिस्सा</span>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs text-gray-400">भारत सरकार</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Header: React.FC = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="flex items-center space-x-3">
      {/* User Info */}
      

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg shadow-md hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition duration-300"
      >
        <LogOut className="w-4 h-4" />
        <span className="text-sm">लॉगआउट | Logout</span>
      </button>
    </div>
  );
};

export default MainLayout;