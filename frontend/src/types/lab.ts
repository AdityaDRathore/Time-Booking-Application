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
  lab_name: string; // ✅ change to string
  location: string;
  lab_capacity: number;
  description: string;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}


