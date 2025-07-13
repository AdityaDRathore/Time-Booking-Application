import { Notification } from '../../types/notification';
import { formatDistanceToNow } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../api/notifications';
import { toast } from 'react-toastify';

interface Props {
  notifications: Notification[];
}

const NotificationList = ({ notifications }: Props) => {
  const queryClient = useQueryClient();

  const markOneMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      toast.error('Failed to mark notification as read');
    },
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: () => {
      toast.error('Failed to mark all notifications as read');
    },
  });

  if (!notifications.length) {
    return <p className="text-gray-500">No notifications yet.</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Notifications</h2>
        <button
          onClick={() => markAllMutation.mutate()}
          className="text-sm text-blue-600 hover:underline"
          disabled={markAllMutation.isPending}
        >
          {markAllMutation.isPending ? 'Marking...' : 'Mark all as read'}
        </button>
      </div>

      <ul className="space-y-4">
        {notifications.map((notif) => (
          <li
            key={notif.id}
            className={`p-4 border rounded shadow-sm transition ${notif.isRead ? 'bg-white' : 'bg-yellow-50 border-yellow-300'
              }`}
          >
            <p className="font-medium capitalize">
              {(notif.type ?? 'GENERAL_ANNOUNCEMENT').replaceAll('_', ' ')}
            </p>

            <p className="text-gray-700">{notif.message}</p>

            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
              </p>

              {!notif.isRead && (
                <button
                  onClick={() => markOneMutation.mutate(notif.id)}
                  className="text-xs text-blue-600 hover:underline"
                  disabled={markOneMutation.isPending}
                >
                  {markOneMutation.isPending ? 'Updating...' : 'Mark as read'}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationList;
