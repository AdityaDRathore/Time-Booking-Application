import { useQuery } from '@tanstack/react-query';
import { getUserNotifications } from '../api/notifications';
import { useAuthStore } from '../state/authStore';
import NotificationList from '../components/organisms/NotificationList';

const NotificationsPage = () => {
  const { user } = useAuthStore();

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

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Notifications</h2>

      {isLoading && <p className="text-gray-500">Loading notifications...</p>}
      {isError && (
        <p className="text-red-600">
          {(error as Error)?.message || 'Error loading notifications.'}
        </p>
      )}

      {!isLoading && !isError && (
        <NotificationList notifications={notifications} />
      )}
    </div>
  );
};

export default NotificationsPage;
