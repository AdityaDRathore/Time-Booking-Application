import { NotificationType } from '@prisma/client';

export type NotificationPayload = {
  user_id: string;
  notification_type: NotificationType;
  notification_message: string;
};
