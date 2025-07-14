import { useQuery } from '@tanstack/react-query';
import { getAllLabsAdmin } from '../../api/admin/labs';
import { Lab } from '../../types/lab';
import { Link } from 'react-router-dom';
import { Shield, BookOpen, Users, Monitor, BarChart3, Clock, MapPin, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const { data: labs = [], isLoading } = useQuery({
    queryKey: ['admin', 'labs'],
    queryFn: getAllLabsAdmin,
  });

  const sections = [
    { 
      name: 'Manage Labs', 
      path: '/admin/labs',
      icon: Monitor,
      color: 'orange',
      description: 'लैब प्रबंधन'
    },
    { 
      name: 'Manage Bookings', 
      path: '/admin/bookings',
      icon: BookOpen,
      color: 'green',
      description: 'बुकिंग प्रबंधन'
    },
    { 
      name: 'Manage Users', 
      path: '/admin/users',
      icon: Users,
      color: 'blue',
      description: 'उपयोगकर्ता प्रबंधन'
    },
    { 
      name: 'Reports', 
      path: '/admin/reports',
      icon: BarChart3,
      color: 'purple',
      description: 'रिपोर्ट'
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'orange':
        return {
          border: 'border-orange-500',
          bg: 'bg-orange-100',
          text: 'text-orange-600',
          hover: 'hover:bg-orange-50'
        };
      case 'green':
        return {
          border: 'border-green-500',
          bg: 'bg-green-100',
          text: 'text-green-600',
          hover: 'hover:bg-green-50'
        };
      case 'blue':
        return {
          border: 'border-blue-500',
          bg: 'bg-blue-100',
          text: 'text-blue-600',
          hover: 'hover:bg-blue-50'
        };
      case 'purple':
        return {
          border: 'border-purple-500',
          bg: 'bg-purple-100',
          text: 'text-purple-600',
          hover: 'hover:bg-purple-50'
        };
      default:
        return {
          border: 'border-gray-500',
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          hover: 'hover:bg-gray-50'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full mb-4">
            <Shield className="w-5 h-5 text-orange-600 mr-2" />
            <span className="text-orange-800 font-semibold">व्यवस्थापक पैनल | Admin Panel</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            <span className="text-orange-600">डैशबोर्ड</span> <span className="text-green-600">प्रबंधन</span>
          </h1>
          <p className="text-lg text-gray-600">Administrative Dashboard</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {sections.map((section) => {
            const colors = getColorClasses(section.color);
            const IconComponent = section.icon;
            
            return (
              <Link
                to={section.path}
                key={section.name}
                className={`bg-white rounded-xl shadow-lg p-6 border-t-4 ${colors.border} hover:shadow-xl transition duration-300 ${colors.hover} group`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 ${colors.bg} rounded-full flex items-center justify-center`}>
                    <IconComponent className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition duration-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{section.name}</h3>
                <p className="text-sm text-gray-600">{section.description}</p>
              </Link>
            );
          })}
        </div>

        {/* Labs Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">आपकी लैब्स | Your Labs</h2>
            <div className="flex items-center px-3 py-1 bg-gray-100 rounded-full">
              <Monitor className="w-4 h-4 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">{labs.length} Labs</span>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">लैब्स लोड हो रही हैं | Loading labs...</p>
            </div>
          ) : labs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg font-semibold">कोई लैब नहीं मिली | No labs found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {labs.map((lab: Lab) => (
                <div key={lab.id} className="border border-gray-200 rounded-xl p-6 bg-gray-50 hover:bg-white hover:shadow-md transition duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-green-600 rounded-full flex items-center justify-center mr-3">
                      <Monitor className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">{lab.lab_name}</h4>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{lab.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      to={`/admin/labs/${lab.id}/time-slots`}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition duration-200 group"
                    >
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-orange-600 mr-2" />
                        <span className="text-sm font-medium">Manage Time Slots</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition duration-200" />
                    </Link>
                    
                    <Link
                      to={`/admin/labs/${lab.id}/waitlist`}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition duration-200 group"
                    >
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium">Manage Waitlist</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition duration-200" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}