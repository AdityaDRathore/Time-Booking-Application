/**
 * Waitlist-related types for the Time-Booking Application
 */

import { TimeSlot } from './timeSlot';
import { User } from './user';

export enum WaitlistStatus {
  ACTIVE = 'ACTIVE',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED',
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
