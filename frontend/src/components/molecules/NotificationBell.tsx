import { useQuery } from '@tanstack/react-query';
import { getUserNotifications } from '../../api/notifications';
import { useAuthStore } from '../../state/authStore';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../../types/notification';

const NotificationBell = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', 'me'],
    queryFn: getUserNotifications,
    enabled: !!user,
  }) as { data: Notification[] | undefined };
  const unreadCount = notifications.filter((n) => !n.isRead).length;


  return (
    <div className="relative cursor-pointer" onClick={() => navigate('/notifications')}>
      <svg
        className="w-6 h-6 text-gray-700"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 
             6.002 0 00-4-5.659V4a2 2 0 00-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 
             .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 
             11-6 0v-1m6 0H9"
        ></path>
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 rounded-full">
          {unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;
