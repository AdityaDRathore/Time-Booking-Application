import { Notification } from '../../types/notification';
import { format, formatDistanceToNow } from 'date-fns';
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
  BellRing,
  Sparkles,
  UserMinus,
  UserCheck,
} from 'lucide-react';

interface Props {
  notifications: Notification[];
  filter: 'all' | 'read' | 'unread';
}

const NotificationList = ({ notifications, filter }: Props) => {
  const queryClient = useQueryClient();

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'read') return notif.isRead;
    if (filter === 'unread') return !notif.isRead;
    return true;
  });

  const markOneMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'me'] });
    },
    onError: () => {
      toast.error('Failed to mark notification as read');
    },
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'me'] });
      toast.success('All notifications marked as read');
    },
    onError: () => {
      toast.error('Failed to mark all notifications as read');
    },
  });

  const iconMap: Record<string, JSX.Element> = {
    BOOKING_CONFIRMATION: <CheckCircle className="w-5 h-5 text-green-500" />,
    BOOKING_CANCELLATION: <AlertCircle className="w-5 h-5 text-red-500" />,
    WAITLIST_NOTIFICATION: <BellRing className="w-5 h-5 text-yellow-500" />,
    WAITLIST_AUTO_PROMOTION: <Sparkles className="w-5 h-5 text-green-500" />,
    WAITLIST_ADMIN_PROMOTION: <UserCheck className="w-5 h-5 text-emerald-600" />,
    WAITLIST_AUTO_CONFIRMATION: <CheckCircle className="w-5 h-5 text-emerald-600" />,
    WAITLIST_ADMIN_CONFIRMATION: <CheckCircle className="w-5 h-5 text-blue-600" />,
    WAITLIST_REMOVAL_USER: <UserMinus className="w-5 h-5 text-orange-600" />,
    WAITLIST_REMOVAL_ADMIN: <AlertCircle className="w-5 h-5 text-orange-700" />,
    GENERAL_ANNOUNCEMENT: <Info className="w-5 h-5 text-blue-500" />,
    SLOT_AVAILABLE: <Bell className="w-5 h-5 text-purple-500" />,
    SYSTEM_NOTIFICATION: <MessageSquare className="w-5 h-5 text-gray-500" />,
  };

  const getTypeIcon = (type: string | null | undefined, message: string) => {
    if (type === 'GENERAL_ANNOUNCEMENT' && message?.toLowerCase().includes('welcome')) {
      return <BellRing className="w-5 h-5 text-pink-500" />;
    }
    return iconMap[type?.toUpperCase() || 'GENERAL_ANNOUNCEMENT'] ?? (
      <MessageSquare className="w-5 h-5 text-gray-500" />
    );
  };

  if (!notifications.length) {
    return <p className="text-center text-gray-500">No notifications yet.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto">
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

      <ul className="space-y-4">
        {filteredNotifications.map((notif) => (
          <li
            key={notif.id}
            className={`p-5 rounded-xl border shadow-sm relative transition ${notif.isRead
              ? 'bg-white border-gray-200'
              : 'bg-yellow-50 border-yellow-300'
              }`}
          >
            {!notif.isRead && (
              <span className="absolute left-0 top-5 h-4 w-1 rounded-r bg-yellow-500" />
            )}

            <div className="flex items-start gap-3 mb-2">
              <div className="mt-1">{getTypeIcon(notif.type, notif.message)}</div>
              <div className="w-full">
                <p className="font-semibold capitalize text-gray-800">
                  {(notif.type ?? 'GENERAL_ANNOUNCEMENT').replaceAll('_', ' ')}
                </p>

                <div className="text-gray-700">
                  <p>{notif.message}</p>

                  {['WAITLIST_ADMIN_PROMOTION'].includes(notif.type || '') &&
                    notif.metadata?.oldPosition != null &&
                    notif.metadata?.newPosition != null && (
                      <div className="text-sm text-emerald-600 mt-1">
                        🚀 You’ve been promoted to position <strong>{notif.metadata.newPosition}</strong> (was {notif.metadata.oldPosition}).
                      </div>
                    )}

                  {['WAITLIST_REMOVAL_ADMIN', 'WAITLIST_REMOVAL_USER'].includes(notif.type || '') && (
                    <div className="text-sm text-orange-600 mt-1">
                      ⚠️ You have {notif.type === 'WAITLIST_REMOVAL_USER' ? 'left' : 'been removed from'} the waitlist.
                    </div>
                  )}

                  {[
                    'BOOKING_CONFIRMATION',
                    'BOOKING_CANCELLATION',
                    'WAITLIST_NOTIFICATION',
                    'WAITLIST_AUTO_PROMOTION',
                    'WAITLIST_ADMIN_PROMOTION',
                    'WAITLIST_AUTO_CONFIRMATION',
                    'WAITLIST_ADMIN_CONFIRMATION',
                    'WAITLIST_REMOVAL_ADMIN',
                    'WAITLIST_REMOVAL_USER',
                  ].includes(notif.type || '') &&
                    notif.metadata?.labName &&
                    notif.metadata?.date &&
                    notif.metadata?.startTime &&
                    notif.metadata?.endTime && (
                      <div className="text-sm mt-1 text-gray-600 flex items-center gap-1">
                        📍 <strong>{notif.metadata.labName}</strong> —{' '}
                        {format(new Date(notif.metadata.date), 'PPP')} (
                        {format(new Date(notif.metadata.startTime), 'p')} -{' '}
                        {format(new Date(notif.metadata.endTime), 'p')})
                      </div>
                    )}

                  {notif.type === 'WAITLIST_NOTIFICATION' &&
                    notif.metadata?.position !== undefined && (
                      <div className="text-sm text-yellow-600 mt-1">
                        You are waitlisted at position <strong>{notif.metadata.position}</strong>.
                      </div>
                    )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
              <p>{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</p>

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
