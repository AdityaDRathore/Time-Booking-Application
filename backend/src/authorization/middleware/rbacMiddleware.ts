import { Request, Response, NextFunction } from 'express';
import { Permission } from '../constants/permissions';
import { UserRole } from '@prisma/client';
import { hasPermission, hasAnyPermission, AuthUser } from '../utils/permissionChecker';
import { HttpException } from '../../exceptions/HttpException';

/**
 * Interface for authenticated user in request, reflecting actual usage/errors
 */
export interface RequestUser {
  id: string;
  role: UserRole;
  organizationId?: string | null;
}

// Extend Express Request interface to include user
// This is a standard way to augment Express's Request type.
// If @typescript-eslint/no-namespace is strict, you might need to disable it for this block.
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

/**
 * Options for the RBAC middleware
 */
interface RBACOptions {
  allowMultiple?: boolean;
}

// Helper to adapt RequestUser to AuthUser
const adaptUserForPermissionChecker = (user: RequestUser): AuthUser => {
  return {
    ...user,
    user_role: user.role, // Map role to user_role
  };
};

/**
 * Middleware to check if user has the required permissions
 * @param permissions Array of permissions required to access the route
 * @param options Configuration options
 * @returns Express middleware
 */
export const requirePermissions = (permissions: Permission[], options: RBACOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new HttpException(401, 'Authentication required'));
    }

    const { allowMultiple = false } = options;
    const adaptedUser = adaptUserForPermissionChecker(req.user);

    const hasRequiredPermissions = allowMultiple
      ? hasAnyPermission(adaptedUser, permissions)
      : permissions.every(permission => hasPermission(adaptedUser, permission));

    if (!hasRequiredPermissions) {
      return next(new HttpException(403, 'Insufficient permissions'));
    }

    next();
  };
};

/**
 * Middleware to check if user has the required role
 * @param roles Array of roles required to access the route
 * @param options Configuration options
 * @returns Express middleware
 */
export const requireRoles = (roles: UserRole[], options: RBACOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new HttpException(401, 'Authentication required'));
    }

    const { allowMultiple = false } = options;

    const hasRequiredRole = allowMultiple
      ? roles.includes(req.user.role) // Use req.user.role directly
      : req.user.role === roles[0]; // Use req.user.role directly

    if (!hasRequiredRole) {
      return next(new HttpException(403, 'Insufficient role permissions'));
    }

    next();
  };
};

// Type guard to check if an item is a UserRole
function isUserRole(item: Permission | UserRole): item is UserRole {
  // Check if 'item' is one of the string values of the UserRole enum
  return Object.values(UserRole).some(roleValue => roleValue === item);
}

/**
 * Combined middleware to check if user has any of the specified permissions or roles
 * @param permissionsOrRoles Array of permissions or roles
 * @returns Express middleware
 */
export const requireAny = (permissionsOrRoles: (Permission | UserRole)[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new HttpException(401, 'Authentication required'));
    }

    const separatedPermissions: Permission[] = [];
    const separatedRoles: UserRole[] = [];

    for (const item of permissionsOrRoles) {
      if (isUserRole(item)) {
        // Use the type guard
        separatedRoles.push(item); // item is now UserRole
      } else {
        // item is now Permission (or string, if Permission is string)
        separatedPermissions.push(item);
      }
    }

    const adaptedUser = adaptUserForPermissionChecker(req.user);

    const hasAnyOfPermissions =
      separatedPermissions.length > 0 ? hasAnyPermission(adaptedUser, separatedPermissions) : false;
    const hasAnyOfRoles =
      separatedRoles.length > 0 ? separatedRoles.includes(req.user.role) : false;

    if (!hasAnyOfPermissions && !hasAnyOfRoles) {
      return next(new HttpException(403, 'Insufficient permissions'));
    }

    next();
  };
};
