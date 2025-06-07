import { Request, Response, NextFunction } from 'express';
import { ResourceType, OWNERSHIP_BYPASS_PERMISSIONS } from '../constants/ownership';
import {
  canAccessResource,
  hasAnyPermission,
  AuthUser as PermissionCheckerAuthUser,
} from '../utils/permissionChecker';
import { HttpException } from '../../exceptions/HttpException';
import { Permission } from '../constants/permissions';
import { PrismaClient, Admin } from '@prisma/client'; // Import Admin type
import { RequestUser } from './rbacMiddleware';

const prisma = new PrismaClient();

// Helper to adapt RequestUser to PermissionCheckerAuthUser
const adaptUserForPermissionChecker = (user: RequestUser): PermissionCheckerAuthUser => {
  return {
    ...user,
    user_role: user.role,
  };
};

interface ResourceAccessOptions {
  paramName?: string;
  resourceIdGetter?: (req: Request) => string;
  ownershipBypass?: Permission[];
}

export const requireResourceAccess = (
  resourceType: ResourceType,
  requiredPermission: Permission,
  options: ResourceAccessOptions = {},
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Added return type Promise<void>
    if (!req.user) {
      return next(new HttpException(401, 'Authentication required'));
    }

    const adaptedUser = adaptUserForPermissionChecker(req.user);

    let resourceId: string;
    const { paramName = 'id', resourceIdGetter } = options;

    if (resourceIdGetter) {
      resourceId = resourceIdGetter(req);
    } else {
      resourceId = req.params[paramName];
    }

    if (!resourceId) {
      return next(
        new HttpException(400, `Resource ID not found. Expected in parameter '${paramName}'`),
      );
    }

    const bypassPermissions = [
      ...(OWNERSHIP_BYPASS_PERMISSIONS[resourceType] || []),
      ...(options.ownershipBypass || []),
    ];

    if (bypassPermissions.length > 0 && hasAnyPermission(adaptedUser, bypassPermissions)) {
      return next();
    }

    try {
      const canAccess = await canAccessResource(
        adaptedUser,
        resourceType,
        resourceId,
        requiredPermission,
      );

      if (!canAccess) {
        return next(new HttpException(403, 'You do not have permission to access this resource'));
      }

      next();
    } catch (error) {
      console.error('Resource access check failed:', error);
      if (error instanceof HttpException) {
        next(error);
      } else {
        next(
          new HttpException(
            500,
            'Error checking resource access: ' +
              (error instanceof Error ? error.message : 'Unknown error'),
          ),
        );
      }
    }
  };
};

// Helper function to get organization ID for a resource
const getResourceOrganizationId = async (
  resourceType: ResourceType,
  resourceId: string,
): Promise<string | null | undefined> => {
  switch (resourceType) {
    case ResourceType.USER: {
      const resourceUser = await prisma.user.findUnique({ where: { id: resourceId } });
      return resourceUser?.organizationId;
    }
    case ResourceType.ADMIN: {
      const admin = await prisma.admin.findUnique({ where: { id: resourceId } });
      // Assuming Admin model might have an optional organizationId.
      // Adjust if Admin model definitely doesn't have it or has a different relation.
      return admin && 'organizationId' in admin
        ? (admin as Admin & { organizationId?: string | null }).organizationId
        : null; // Or undefined, depending on how you want to treat admins without orgs
    }
    case ResourceType.LAB: {
      const lab = await prisma.lab.findUnique({ where: { id: resourceId } });
      return lab?.organizationId;
    }
    case ResourceType.TIME_SLOT: {
      const timeSlot = await prisma.timeSlot.findUnique({
        where: { id: resourceId },
        include: { lab: true },
      });
      return timeSlot?.lab?.organizationId;
    }
    case ResourceType.BOOKING: {
      const booking = await prisma.booking.findUnique({
        where: { id: resourceId },
        include: { timeSlot: { include: { lab: true } } },
      });
      return booking?.timeSlot?.lab?.organizationId;
    }
    case ResourceType.WAITLIST: {
      const waitlist = await prisma.waitlist.findUnique({
        where: { id: resourceId },
        include: { timeSlot: { include: { lab: true } } },
      });
      return waitlist?.timeSlot?.lab?.organizationId;
    }
    case ResourceType.NOTIFICATION: {
      const notification = await prisma.notification.findUnique({
        where: { id: resourceId },
        include: { user: true },
      });
      return notification?.user?.organizationId;
    }
    case ResourceType.ORGANIZATION: {
      return resourceId; // The resourceId itself is the organizationId
    }
    default: {
      // This should be caught by TypeScript if all ResourceType cases are handled.
      // If new types are added without updating this, it will throw at runtime.
      const exhaustiveCheck: never = resourceType;
      throw new HttpException(
        500,
        `Organization check not implemented for resource type: ${exhaustiveCheck}`,
      );
    }
  }
};

export const requireSameOrganization = (
  resourceType: ResourceType,
  options: ResourceAccessOptions = {},
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user as RequestUser | undefined;

    if (!user) {
      return next(new HttpException(401, 'Authentication required'));
    }

    if (!user.organizationId) {
      return next(new HttpException(403, 'User not associated with any organization'));
    }
    const userOrganizationId = user.organizationId;

    let resourceId: string;
    const { paramName = 'id', resourceIdGetter } = options;

    if (resourceIdGetter) {
      resourceId = resourceIdGetter(req);
    } else {
      resourceId = req.params[paramName];
    }

    if (!resourceId) {
      return next(
        new HttpException(400, `Resource ID not found. Expected in parameter '${paramName}'`),
      );
    }

    try {
      const resourceOrganizationId = await getResourceOrganizationId(resourceType, resourceId);

      if (resourceOrganizationId === undefined || resourceOrganizationId === null) {
        // Check for both undefined and null
        return next(
          new HttpException(404, 'Resource not found or not associated with an organization'),
        );
      }

      if (resourceOrganizationId !== userOrganizationId) {
        return next(new HttpException(403, 'Resource does not belong to your organization'));
      }

      next();
    } catch (error) {
      console.error('Organization access check failed:', error); // Keep console.error for critical middleware errors
      if (error instanceof HttpException) {
        next(error);
      } else {
        next(
          new HttpException(
            500,
            'Error checking organization access: ' +
              (error instanceof Error ? error.message : 'Unknown error'),
          ),
        );
      }
    }
  };
};
