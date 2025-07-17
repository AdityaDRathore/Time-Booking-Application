import { useQuery } from '@tanstack/react-query';
import { getUserNotifications, getNotificationCounts } from '../api/notifications';
import { useAuthStore } from '../state/authStore';
import NotificationList from '../components/organisms/NotificationList';
import { Bell, AlertCircle, CheckCircle, Info, Shield, Filter, BellRing } from 'lucide-react';
import { useState } from 'react';

const NotificationsPage = () => {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const {
    data: counts,
    isLoading: isCountsLoading,
  } = useQuery({
    queryKey: ['notificationCounts'],
    queryFn: getNotificationCounts,
    enabled: !!user,
  });

  const {
    data: notifications = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['notifications', 'me'],
    queryFn: getUserNotifications,
    enabled: !!user, // Fetch only if user exists
    retry: 1,        // Optional: Avoid spamming requests
  });

  // Mock notification counts for filter buttons
  const getNotificationCount = (filterType: string) => {
    if (!counts) return 0;
    switch (filterType) {
      case 'all':
        return counts.all;
      case 'unread':
        return counts.unread;
      case 'read':
        return counts.read;
      default:
        return 0;
    }
  };

  const getUnreadCount = () => counts?.unread ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full mb-6">
              <Shield className="w-5 h-5 text-white mr-2" />
              <span className="text-white font-semibold">सूचनाएं | Notifications</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              <span className="text-orange-100">आपकी सूचनाएं</span>
              <br />
              <span className="text-green-100">Your Notifications</span>
            </h1>

            <p className="text-xl opacity-90 mb-2">
              अपनी सभी सूचनाओं को देखें और प्रबंधित करें
            </p>
            <p className="text-lg opacity-80">
              View and manage all your notifications
            </p>

            {/* Notification Badge */}
            {getUnreadCount() > 0 && (
              <div className="inline-flex items-center px-4 py-2 bg-red-500 rounded-full mt-4">
                <BellRing className="w-5 h-5 text-white mr-2" />
                <span className="text-white font-semibold">
                  {getUnreadCount()} नई सूचनाएं | {getUnreadCount()} New Notifications
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Filter className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-800">
                फिल्टर | Filter:
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'सभी | All', icon: Bell },
                { value: 'unread', label: 'अपठित | Unread', icon: AlertCircle },
                { value: 'read', label: 'पढ़ी गई | Read', icon: CheckCircle }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition duration-300 ${filter === value
                    ? 'bg-gradient-to-r from-orange-500 to-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs ${filter === value ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                    {getNotificationCount(value)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
              <p className="text-gray-600 text-lg">लोड हो रहा है... | Loading notifications...</p>
            </div>
          )}

          {isError && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                त्रुटि | Error
              </h3>
              <p className="text-red-600 mb-6">
                {(error as Error)?.message || 'सूचनाएं लोड करने में त्रुटि | Error loading notifications'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-green-600 text-white font-bold rounded-lg shadow-lg hover:from-orange-600 hover:to-green-700 transform hover:scale-105 transition duration-300"
              >
                पुनः प्रयास करें | Retry
              </button>
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {notifications.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      सूचनाओं की सूची | Notifications List
                    </h2>
                    <div className="text-sm text-gray-500">
                      कुल {notifications.length} सूचनाएं | Total {notifications.length} notifications
                    </div>
                  </div>
                  <NotificationList notifications={notifications} filter={filter} />
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    कोई सूचना नहीं मिली | No Notifications Found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {filter === 'all'
                      ? 'आपकी कोई सूचना नहीं है | You have no notifications yet'
                      : `कोई ${filter === 'unread' ? 'अपठित' : 'पढ़ी गई'} सूचना नहीं मिली | No ${filter} notifications found`
                    }
                  </p>
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-green-600 text-white font-bold rounded-lg shadow-lg hover:from-orange-600 hover:to-green-700 transform hover:scale-105 transition duration-300"
                  >
                    डैशबोर्ड पर जाएं | Go to Dashboard
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            त्वरित कार्य | Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition duration-300">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <div className="font-medium text-blue-800">सभी को पढ़ा हुआ चिह्नित करें</div>
                <div className="text-sm text-blue-600">Mark all as read</div>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition duration-300">
              <Info className="w-6 h-6 text-green-600" />
              <div className="text-left">
                <div className="font-medium text-green-800">सेटिंग्स</div>
                <div className="text-sm text-green-600">Notification Settings</div>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg hover:from-orange-100 hover:to-orange-200 transition duration-300">
              <BellRing className="w-6 h-6 text-orange-600" />
              <div className="text-left">
                <div className="font-medium text-orange-800">नई बुकिंग</div>
                <div className="text-sm text-orange-600">New Booking</div>
              </div>
            </button>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="bg-gradient-to-r from-orange-500 to-green-600 rounded-2xl p-8 text-white mt-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">सूचना सारांश | Notification Summary</h2>
            <p className="text-lg opacity-90">Your notification activity overview</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">{notifications.length}</div>
              <div className="text-sm opacity-90">कुल सूचनाएं | Total</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">{getUnreadCount()}</div>
              <div className="text-sm opacity-90">अपठित | Unread</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">{getNotificationCount('read')}</div>
              <div className="text-sm opacity-90">पढ़ी गई | Read</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-sm opacity-90">अपडेट | Updates</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;