import { Permission } from '../constants/permissions';
import { getPermissionsForRole } from '../constants/roles';
import { ResourceType, OWNERSHIP_BYPASS_PERMISSIONS } from '../constants/ownership';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * User with role information
 */
export interface AuthUser {
  id: string;
  user_role: UserRole;
  organizationId?: string | null;
}

/**
 * Check if a user has a specific permission
 * @param user The authenticated user
 * @param permission The permission to check
 * @returns Boolean indicating if the user has the permission
 */
export const hasPermission = (user: AuthUser, permission: Permission): boolean => {
  const userPermissions = getPermissionsForRole(user.user_role);
  return userPermissions.includes(permission);
};

/**
 * Check if a user has any of the specified permissions
 * @param user The authenticated user
 * @param permissions Array of permissions to check
 * @returns Boolean indicating if the user has any of the permissions
 */
export const hasAnyPermission = (user: AuthUser, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if a user has all of the specified permissions
 * @param user The authenticated user
 * @param permissions Array of permissions to check
 * @returns Boolean indicating if the user has all of the permissions
 */
export const hasAllPermissions = (user: AuthUser, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Get all permissions for a given user's role
 * @param user The authenticated user
 * @returns Array of permissions
 */
export const getUserPermissions = (user: AuthUser): Permission[] => {
  return getPermissionsForRole(user.user_role);
};

/**
 * Check if a user can access a specific resource based on ownership and permissions
 * @param user The authenticated user
 * @param resourceType The type of resource being accessed
 * @param resourceId The ID of the resource
 * @param permission The permission required for the operation
 * @returns Promise resolving to boolean indicating if access is allowed
 */
export const canAccessResource = async (
  user: AuthUser,
  resourceType: ResourceType,
  resourceId: string,
  permission: Permission,
): Promise<boolean> => {
  // First check if user has the permission
  if (!hasPermission(user, permission)) {
    return false;
  }

  // Check if the permission bypasses ownership checks
  const bypassPermissions = OWNERSHIP_BYPASS_PERMISSIONS[resourceType] || [];
  if (hasAnyPermission(user, bypassPermissions)) {
    return true;
  }

  // Check ownership based on resource type
  switch (resourceType) {
    case ResourceType.USER: {
      // Users can access their own profiles
      return user.id === resourceId;
    }

    case ResourceType.BOOKING: {
      // Check if user owns the booking
      const booking = await prisma.booking.findUnique({
        where: { id: resourceId },
      });
      return booking?.user_id === user.id;
    }

    case ResourceType.LAB: {
      // For admins, check if they manage the lab
      if (user.user_role === 'ADMIN') {
        const lab = await prisma.lab.findUnique({
          where: { id: resourceId },
        });
        return lab?.adminId === user.id;
      }
      // Users can view all labs
      return permission === 'labs:read';
    }

    case ResourceType.TIME_SLOT: {
      // For admins, check if they manage the lab that contains the time slot
      if (user.user_role === 'ADMIN') {
        const timeSlot = await prisma.timeSlot.findUnique({
          where: { id: resourceId },
          include: { lab: true },
        });
        return timeSlot?.lab.adminId === user.id;
      }
      // Users can view all time slots
      return permission === 'time_slots:read';
    }

    case ResourceType.WAITLIST: {
      // Check if user owns the waitlist entry
      const waitlist = await prisma.waitlist.findUnique({
        where: { id: resourceId },
      });
      return waitlist?.user_id === user.id;
    }

    case ResourceType.NOTIFICATION: {
      // Check if notification is for the user
      const notification = await prisma.notification.findUnique({
        where: { id: resourceId },
      });
      return notification?.user_id === user.id;
    }

    case ResourceType.ORGANIZATION: {
      // Regular users can only view their own organization
      if (user.user_role === 'USER') {
        return permission === 'organizations:read' && user.organizationId === resourceId;
      }
      // Admins can view their own organization details
      if (user.user_role === 'ADMIN') {
        return (
          ['organizations:read', 'organizations:read_details'].includes(permission) &&
          user.organizationId === resourceId
        );
      }
      // Super admins can access all organizations
      return true;
    }

    case ResourceType.ADMIN: {
      // Only super admins can manage admins
      return user.user_role === 'SUPER_ADMIN';
    }

    default: {
      return false;
    }
  }
};
