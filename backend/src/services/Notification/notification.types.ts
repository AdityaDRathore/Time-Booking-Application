import { NotificationType } from '@prisma/client';

export type NotificationPayload = {
  user_id: string;
  notification_type: NotificationType;
  notification_message: string;
  metadata?: {
    slotId?: string;
    bookingId?: string;
    waitlistId?: string;
    position?: number | null;
    oldPosition?: number | null;
    newPosition?: number | null; // For promotions
    labName?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    confirmedFromWaitlist?: boolean; // Optional flag
  };
};
