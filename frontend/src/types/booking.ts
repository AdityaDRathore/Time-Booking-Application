/**
 * Booking-related types for the Time-Booking Application
 */

import { User } from './user';
import { TimeSlot } from './timeSlot';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export interface Booking {
  id: string;
  status: BookingStatus;
  userId: string;
  slotId: string;
  user?: User;
  timeSlot?: TimeSlot;
  createdAt: string;
  updatedAt: string;
}