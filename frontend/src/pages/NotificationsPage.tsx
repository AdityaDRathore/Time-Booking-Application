import { useQuery } from '@tanstack/react-query';
import { getUserNotifications } from '../api/notifications';
import { useAuthStore } from '../state/authStore';
import NotificationList from '../components/organisms/NotificationList';

const NotificationsPage = () => {
  const { user } = useAuthStore();

  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notifications', 'me'],
    queryFn: getUserNotifications,
    enabled: !!user,
  });

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Notifications</h2>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-600">Error loading notifications.</p>}

      <NotificationList notifications={notifications} />
    </div>
  );
};

export default NotificationsPage;
