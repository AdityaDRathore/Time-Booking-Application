/**
 * TimeSlot-related types for the Time-Booking Application
 */

import { Lab } from './lab';

export interface TimeSlot {
  id: string;
  labId: string;
  date: string;         // e.g., '2025-06-16'
  startTime: string;    // e.g., '10:00'
  endTime: string;      // e.g., '11:00'
  isBooked: boolean;    // ✅ Required for filtering
  createdAt: string;
  updatedAt: string;
}
