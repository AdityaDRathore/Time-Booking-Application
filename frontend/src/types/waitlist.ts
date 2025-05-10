/**
 * Waitlist-related types for the Time-Booking Application
 */

import { User } from './user';
import { TimeSlot } from './timeSlot';

export enum WaitlistStatus {
  ACTIVE = 'ACTIVE',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED'
}

export interface Waitlist {
  id: string;
  status: WaitlistStatus;
  position: number;
  userId: string;
  slotId: string;
  user?: User;
  timeSlot?: TimeSlot;
  createdAt: string;
  updatedAt: string;
}