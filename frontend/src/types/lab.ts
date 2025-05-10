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
  lab_name: string;
  lab_capacity: number;
  status: LabStatus;
  location?: string;
  description?: string;
  organizationId: string;
  adminId: string;
  createdAt: string;
  updatedAt: string;
}
