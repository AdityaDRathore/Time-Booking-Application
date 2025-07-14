import { Notification } from '../../types/notification';
import { formatDistanceToNow } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../api/notifications';
import { toast } from 'react-toastify';
import {
  Bell,
  AlertCircle,
  Info,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';

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

  const getTypeIcon = (type: string | null | undefined) => {
    const key = (type ?? 'GENERAL_ANNOUNCEMENT').toUpperCase();

    switch (key) {
      case 'ALERT':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'INFO':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'CONFIRMATION':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-yellow-500" />;
    }
  };

  if (!notifications.length) {
    return <p className="text-center text-gray-500">No notifications yet.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-orange-700 flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Notifications
        </h2>

        <button
          onClick={() => markAllMutation.mutate()}
          className="text-sm px-3 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
          disabled={markAllMutation.isPending}
        >
          {markAllMutation.isPending ? 'Marking...' : 'Mark all as read'}
        </button>
      </div>

      {/* Notification List */}
      <ul className="space-y-4">
        {notifications.map((notif) => (
          <li
            key={notif.id}
            className={`p-5 rounded-xl border shadow-sm transition relative ${
              notif.isRead
                ? 'bg-white border-gray-200'
                : 'bg-yellow-50 border-yellow-300'
            }`}
          >
            <div className="flex items-start gap-3 mb-2">
              <div className="mt-1">{getTypeIcon(notif.type)}</div>
              <div>
                <p className="font-semibold capitalize text-gray-800">
                  {(notif.type ?? 'GENERAL_ANNOUNCEMENT').replaceAll('_', ' ')}
                </p>
                <p className="text-gray-700">{notif.message}</p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
              <p>
                {formatDistanceToNow(new Date(notif.createdAt), {
                  addSuffix: true,
                })}
              </p>

              {!notif.isRead && (
                <button
                  onClick={() => markOneMutation.mutate(notif.id)}
                  className="text-blue-600 hover:underline disabled:opacity-50"
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
