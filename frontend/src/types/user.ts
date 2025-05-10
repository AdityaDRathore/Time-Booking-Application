/**
 * User-related types for the Time-Booking Application
 */

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface User {
  id: string;
  user_name: string;
  user_email: string;
  user_role: UserRole;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: string;
  admin_name: string;
  admin_email: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SuperAdmin {
  id: string;
  super_admin_name: string;
  super_admin_email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  org_name: string;
  org_type: string;
  org_location: string;
  createdAt: string;
  updatedAt: string;
}
