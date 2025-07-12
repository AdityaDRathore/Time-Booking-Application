import { z } from 'zod';

export const sendNotificationSchema = z.object({
  user_id: z.string().uuid({ message: "Invalid user ID format" }),
  notification_type: z.enum([
    'BOOKING_CONFIRMATION',
    'BOOKING_CANCELLATION',
    'WAITLIST_NOTIFICATION',
    'GENERAL_ANNOUNCEMENT',
    'SLOT_AVAILABLE',
    'SYSTEM_NOTIFICATION',
  ]),
  notification_message: z.string().min(1, "Message cannot be empty"),
});

export const idParamSchema = z.object({
  id: z.string().uuid({ message: "Invalid notification ID format" }),
});
