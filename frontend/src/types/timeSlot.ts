// frontend/src/types/timeSlot.ts

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
  lab?: {
    lab_name: string;
    lab_capacity: number; // ✅ Add this field
  };
  isBooked: boolean;
  isFullyBooked?: boolean; // ✅ Optional flag
  seatsLeft: number;        // ✅ Show seats remaining
}

