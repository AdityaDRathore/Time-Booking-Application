import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserDetails } from '../../api/admin/users';
import { User } from '../../types/user';
import { 
  ArrowLeft, 
  User as UserIcon, 
  Mail, 
  Shield, 
  Calendar, 
  Clock,
  UserCheck,
  Settings,
  Activity
} from 'lucide-react';

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => getUserDetails(id!),
  }) as {
    data: User | undefined;
    isLoading: boolean;
    isError: boolean;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">उपयोगकर्ता विवरण लोड हो रहे हैं | Loading user details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-600 text-lg font-semibold">त्रुटि | Error loading user</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/users"
            className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition duration-200" />
            <span className="text-sm font-medium text-gray-700">वापस जाएं | Back to Users</span>
          </Link>

          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-4">
              <Shield className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-800 font-semibold">व्यवस्थापक पैनल | Admin Panel</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              <span className="text-blue-600">उपयोगकर्ता</span> <span className="text-green-600">विवरण</span>
            </h1>
            <p className="text-lg text-gray-600">User Details</p>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-green-600 h-32 relative">
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                <UserCheck className="w-12 h-12 text-gray-600" />
              </div>
            </div>
          </div>
          <div className="pt-16 pb-8 px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{user.user_name}</h2>
            <p className="text-gray-600 mb-4">{user.user_email}</p>
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full">
              <Shield className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-blue-800 font-semibold">{user.user_role || 'User'}</span>
            </div>
          </div>
        </div>

        {/* User Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <UserIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">व्यक्तिगत जानकारी</h3>
                <p className="text-gray-600 text-sm">Personal Information</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <UserCheck className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">नाम | Name</p>
                  <p className="font-semibold text-gray-800">{user.user_name}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">ईमेल | Email</p>
                  <p className="font-semibold text-gray-800">{user.user_email}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Shield className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">भूमिका | Role</p>
                  <p className="font-semibold text-gray-800">{user.user_role || 'User'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <Settings className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">खाता जानकारी</h3>
                <p className="text-gray-600 text-sm">Account Information</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">शामिल हुए | Joined</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">समय | Time</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(user.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Activity className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">स्थिति | Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">कार्य</h3>
              <p className="text-gray-600 text-sm">Actions</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200">
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </button>
            
            <button className="flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200">
              <Settings className="w-4 h-4 mr-2" />
              Edit User
            </button>
            
            <button className="flex items-center justify-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200">
              <Activity className="w-4 h-4 mr-2" />
              View Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}