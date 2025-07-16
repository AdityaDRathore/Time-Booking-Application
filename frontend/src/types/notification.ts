/**
 * Notification-related types for the Time-Booking Application
 */

export enum NotificationType {
  BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
  BOOKING_CANCELLATION = 'BOOKING_CANCELLATION',
  WAITLIST_NOTIFICATION = 'WAITLIST_NOTIFICATION',
  GENERAL_ANNOUNCEMENT = 'GENERAL_ANNOUNCEMENT',
  SLOT_AVAILABLE = 'SLOT_AVAILABLE',
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  // Optional metadata based on notification type
  metadata?: {
    bookingId?: string;
    slotId?: string;
    waitlistId?: string;
    position?: number;
    labName?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  };
}
