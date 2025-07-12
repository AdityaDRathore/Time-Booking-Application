/**
 * TimeSlot-related types for the Time-Booking Application
 */

import { Lab } from './lab';

export interface TimeSlot {
  id: string;
  lab_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lab?: Lab;
}

