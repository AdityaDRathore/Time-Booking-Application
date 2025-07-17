import React from 'react';
import { Clock, Users, Monitor, Shield, Award, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const handleDashboardRedirect = () => {
    if (user?.user_role === 'SUPER_ADMIN') {
      navigate('/superadmin');
    } else if (user?.user_role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Navbar Dashboard Button */}
      <nav className="flex justify-center py-4">
        <button
          onClick={handleDashboardRedirect}
          className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="lucide lucide-chart-column w-4 h-4" aria-hidden="true">
            <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
            <path d="M18 17V9"></path>
            <path d="M13 17V5"></path>
            <path d="M8 17v-3"></path>
          </svg>
          <span className="text-sm font-medium">डैशबोर्ड | Dashboard</span>
        </button>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full mb-6">
            <Shield className="w-5 h-5 text-orange-600 mr-2" />
            <span className="text-orange-800 font-semibold">सरकारी पहल | Government Initiative</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            <span className="text-orange-600">डिजिटल लैब</span>
            <br />
            <span className="text-green-600">बुकिंग सिस्टम</span>
          </h1>

          <p className="text-xl text-gray-700 mb-4 max-w-3xl mx-auto">
            मध्य प्रदेश सरकार की पहल - वंचित छात्रों के लिए निःशुल्क कोडिंग लैब्स
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Free Coding Labs Access for Underprivileged Students - A Digital India Initiative
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <button
              onClick={handleDashboardRedirect}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg shadow-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition duration-300 flex items-center justify-center"
            >
              <Monitor className="w-5 h-5 mr-2" />
              डैशबोर्ड | Dashboard
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white text-orange-600 border-2 border-orange-600 font-bold rounded-lg shadow-lg hover:bg-orange-50 transform hover:scale-105 transition duration-300 flex items-center justify-center"
            >
              <Users className="w-5 h-5 mr-2" />
              लॉगिन | Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition duration-300 flex items-center justify-center"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              पंजीकरण | Register
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center border-t-4 border-orange-500 hover:shadow-xl transition duration-300">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">समय बुकिंग</h3>
            <p className="text-gray-600">Easy time slot booking for coding labs across Madhya Pradesh</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center border-t-4 border-green-500 hover:shadow-xl transition duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">निःशुल्क पहुंच</h3>
            <p className="text-gray-600">Free access to modern computer labs for underprivileged students</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center border-t-4 border-blue-500 hover:shadow-xl transition duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">डिजिटल स्किल्स</h3>
            <p className="text-gray-600">Learn programming and digital skills in state-of-the-art facilities</p>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="bg-gradient-to-r from-orange-500 to-green-600 rounded-2xl p-8 text-white mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">हमारा प्रभाव | Our Impact</h2>
            <p className="text-xl opacity-90">Empowering students across Madhya Pradesh</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-sm opacity-90">लैब्स | Labs</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-sm opacity-90">छात्र | Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-sm opacity-90">सपोर्ट | Support</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-sm opacity-90">निःशुल्क | Free</div>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-12">कैसे काम करता है | How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Register</h3>
              <p className="text-gray-600">पंजीकरण करें और अपनी प्रोफाइल बनाएं</p>
            </div>

            <div className="relative">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Book Lab</h3>
              <p className="text-gray-600">अपने नज़दीकी लैब में समय स्लॉट बुक करें</p>
            </div>

            <div className="relative">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Learn & Code</h3>
              <p className="text-gray-600">निःशुल्क कोडिंग और डिजिटल स्किल्स सीखें</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
