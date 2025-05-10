/**
 * TimeSlot-related types for the Time-Booking Application
 */

import { Lab } from './lab';

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  date: string;
  totalCapacity: number;
  availableCapacity: number;
  labId: string;
  lab?: Lab;
  createdAt: string;
  updatedAt: string;
}
