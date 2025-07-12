import { UserRole } from '@prisma/client';
import {
  USER_PERMISSIONS,
  ADMIN_PERMISSIONS,
  SUPER_ADMIN_PERMISSIONS,
  Permission,
} from './permissions';

/**
 * Role-based permission mappings
 *
 * Each role is assigned a set of permissions. Roles higher in the hierarchy
 * inherit all permissions from roles below them.
 */

// Define permissions for each role
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  USER: Object.values(USER_PERMISSIONS),

  ADMIN: [...Object.values(USER_PERMISSIONS), ...Object.values(ADMIN_PERMISSIONS)],

  SUPER_ADMIN: [
    ...Object.values(USER_PERMISSIONS),
    ...Object.values(ADMIN_PERMISSIONS),
    ...Object.values(SUPER_ADMIN_PERMISSIONS),
  ],
};

/**
 * Get all permissions for a specific role
 * @param role The user role to get permissions for
 * @returns Array of permission strings
 */
export const getPermissionsForRole = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Check if a role has a specific permission
 * @param role The user role to check
 * @param permission The permission to check for
 * @returns Boolean indicating if the role has the permission
 */
export const roleHasPermission = (role: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

/**
 * Role hierarchy definition for inheritance checks
 * Roles can access resources that roles below them can access
 */
export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  USER: [],
  ADMIN: ['USER'],
  SUPER_ADMIN: ['USER', 'ADMIN'],
};

/**
 * Check if one role is higher than another in the hierarchy
 * @param role The role to check
 * @param thanRole The role to compare against
 * @returns Boolean indicating if role is higher than thanRole
 */
export const isRoleHigherThan = (role: UserRole, thanRole: UserRole): boolean => {
  return ROLE_HIERARCHY[role]?.includes(thanRole) || false;
};

// Export role descriptions for documentation
export const ROLE_DESCRIPTIONS = {
  USER: 'Regular user who can book, reschedule, and cancel lab time slots',
  ADMIN: 'Lab administrator who manages labs, time slots, and users within their organization',
  SUPER_ADMIN:
    'System administrator with complete control over all organizations and system settings',
};
