/**
 * Resource ownership rules
 *
 * Defines who owns what resources and how ownership affects permissions
 */

import { Permission } from './permissions';

// Resource types in the system
export enum ResourceType {
  USER = 'user',
  BOOKING = 'booking',
  LAB = 'lab',
  TIME_SLOT = 'time_slot',
  WAITLIST = 'waitlist',
  NOTIFICATION = 'notification',
  ORGANIZATION = 'organization',
  ADMIN = 'admin',
}

// Ownership verification functions
export interface OwnershipVerifier {
  /**
   * Check if a user owns a resource
   * @param userId The ID of the user
   * @param resourceId The ID of the resource
   * @returns Promise resolving to boolean indicating ownership
   */
  verifyOwnership: (userId: string, resourceId: string) => Promise<boolean>;

  /**
   * Check if a user belongs to the same organization as a resource
   * @param userId The ID of the user
   * @param resourceId The ID of the resource
   * @returns Promise resolving to boolean indicating same organization
   */
  verifySameOrganization?: (userId: string, resourceId: string) => Promise<boolean>;
}

// Permissions that bypass ownership checks
export const OWNERSHIP_BYPASS_PERMISSIONS: Record<ResourceType, Permission[]> = {
  [ResourceType.USER]: ['users:read', 'users:update', 'users:delete', 'users:reset_password'],
  [ResourceType.BOOKING]: ['bookings:read_all', 'bookings:update_any', 'bookings:cancel_any'],
  [ResourceType.LAB]: ['labs:update', 'labs:delete'],
  [ResourceType.TIME_SLOT]: ['time_slots:update', 'time_slots:delete'],
  [ResourceType.WAITLIST]: ['waitlists:read_all', 'waitlists:manage'],
  [ResourceType.NOTIFICATION]: ['notifications:send'],
  [ResourceType.ORGANIZATION]: ['organizations:update', 'organizations:delete'],
  [ResourceType.ADMIN]: ['admins:update', 'admins:delete'],
};

/**
 * Ownership rules for different resource types
 * Describes who can own a resource and what constitutes ownership
 */
export const OWNERSHIP_RULES = {
  [ResourceType.USER]: {
    description: 'A user owns their own profile and data',
    ownerField: 'id', // The field that identifies the owner in the User model
  },

  [ResourceType.BOOKING]: {
    description: 'A user owns bookings they have created',
    ownerField: 'user_id', // The field that identifies the owner in the Booking model
  },

  [ResourceType.LAB]: {
    description: 'An admin owns labs they are assigned to manage',
    ownerField: 'adminId', // The field that identifies the owner in the Lab model
  },

  [ResourceType.TIME_SLOT]: {
    description: 'A lab admin owns time slots for their labs',
    ownerField: null, // Requires special logic - check if user is admin of the lab
  },

  [ResourceType.WAITLIST]: {
    description: 'A user owns their own waitlist entries',
    ownerField: 'user_id', // The field that identifies the owner in the Waitlist model
  },

  [ResourceType.NOTIFICATION]: {
    description: 'A user owns notifications addressed to them',
    ownerField: 'user_id', // The field that identifies the owner in the Notification model
  },

  [ResourceType.ORGANIZATION]: {
    description: 'A super admin manages organizations',
    ownerField: 'superAdminId', // The field that identifies the owner in the Organization model
  },

  [ResourceType.ADMIN]: {
    description: 'A super admin manages admin accounts',
    ownerField: null, // Requires special logic - only super admins can manage admins
  },
};
