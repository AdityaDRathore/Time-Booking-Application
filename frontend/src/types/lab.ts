/**
 * Lab-related types for the Time-Booking Application
 */

import { ReactNode } from "react";

export enum LabStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
}

export interface Lab {
  [x: string]: ReactNode;
  id: string;
  lab_name: string; // ✅ change to string
  location: string;
  capacity: number;
  description: string;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}


