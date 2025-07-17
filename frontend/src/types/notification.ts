/**
 * Notification-related types for the Time-Booking Application
 */

export enum NotificationType {
  BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
  BOOKING_CANCELLATION = 'BOOKING_CANCELLATION',
  WAITLIST_NOTIFICATION = 'WAITLIST_NOTIFICATION',
  WAITLIST_AUTO_CONFIRMATION = 'WAITLIST_AUTO_CONFIRMATION',
  WAITLIST_ADMIN_CONFIRMATION = 'WAITLIST_ADMIN_CONFIRMATION',
  WAITLIST_AUTO_PROMOTION = 'WAITLIST_AUTO_PROMOTION',
  WAITLIST_ADMIN_PROMOTION = 'WAITLIST_ADMIN_PROMOTION',
  WAITLIST_REMOVAL_USER = 'WAITLIST_REMOVAL_USER',
  WAITLIST_REMOVAL_ADMIN = 'WAITLIST_REMOVAL_ADMIN',
  GENERAL_ANNOUNCEMENT = 'GENERAL_ANNOUNCEMENT',
  SLOT_AVAILABLE = 'SLOT_AVAILABLE',
  SYSTEM_NOTIFICATION = 'SYSTEM_NOTIFICATION',
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    bookingId?: string;
    slotId?: string;
    waitlistId?: string;
    position?: number;
    oldPosition?: number;  // ✅ newly added
    newPosition?: number;  // ✅ newly added
    labName?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  };
}

