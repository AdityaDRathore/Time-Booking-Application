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
  waitlist_status: WaitlistStatus;
  waitlist_position: number;
  user_id: string;
  slot_id: string;
  user?: User;
  timeSlot?: TimeSlot;
  createdAt: string;
  updatedAt: string;
}
