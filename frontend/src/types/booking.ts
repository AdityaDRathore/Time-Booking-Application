/**
 * Booking-related types for the Time-Booking Application
 */

import { TimeSlot } from './timeSlot';
import { User } from './user';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface Booking {
  booking_status: string;
  date: string
  id: string;
  status: BookingStatus;
  userId: string;
  slotId: string;
  user?: User;
  timeSlot?: TimeSlot;
  createdAt: string;
  updatedAt: string;
  startTime: string;
}
