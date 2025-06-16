/**
 * Lab-related types for the Time-Booking Application
 */

export enum LabStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
}

export interface Lab {
  id: string;
  name: string;
  capacity: number;
  description: string;
  status: 'OPEN' | 'CLOSED'; // ✅ Add this if missing
  createdAt: string;
  updatedAt: string;
}

