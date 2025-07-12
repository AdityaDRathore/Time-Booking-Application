// src/types/booking.ts

import { TimeSlot } from './timeSlot';
import { User } from './user';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface Booking {
  id: string;
  user_id: string;
  slot_id: string;
  booking_status: BookingStatus;
  booking_timestamp: string;
  managedBy?: string | null;
  purpose?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  timeSlot?: TimeSlot;
}
