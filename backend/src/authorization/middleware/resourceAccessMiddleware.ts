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

export const requireSameOrganization = (
  resourceType: ResourceType,
  options: ResourceAccessOptions = {},
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Added return type Promise<void>
    const user = req.user as RequestUser | undefined; // Cast is okay here after check

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
      let resourceOrganizationId: string | null | undefined = null;

      switch (resourceType) {
        case ResourceType.USER: {
          const resourceUser = await prisma.user.findUnique({ where: { id: resourceId } });
          resourceOrganizationId = resourceUser?.organizationId;
          break;
        }
        case ResourceType.ADMIN: {
          const admin: Admin | null = await prisma.admin.findUnique({ where: { id: resourceId } });
          // Assuming Admin model might have an optional organizationId or a relation to it.
          // If Admin model *definitely* doesn't have it, this case needs rethinking.
          // For now, let's assume it *could* have it, making it type-safe.
          // You'll need to define organizationId on the Admin model in schema.prisma for this to be truly effective.
          if (admin && 'organizationId' in admin) {
            resourceOrganizationId = (admin as Admin & { organizationId?: string | null })
              .organizationId;
          } else {
            // Handle case where admin is found but has no organizationId property,
            // or if Admins are not organization-specific.
            // This might mean access is allowed, or denied, or this check is not applicable.
            // For now, if no organizationId, it won't match userOrganizationId unless both are null/undefined.
          }
          break;
        }
        case ResourceType.LAB: {
          const lab = await prisma.lab.findUnique({ where: { id: resourceId } });
          resourceOrganizationId = lab?.organizationId;
          break;
        }
        case ResourceType.TIME_SLOT: {
          const timeSlot = await prisma.timeSlot.findUnique({
            where: { id: resourceId },
            include: { lab: true },
          });
          resourceOrganizationId = timeSlot?.lab?.organizationId;
          break;
        }
        case ResourceType.BOOKING: {
          const booking = await prisma.booking.findUnique({
            where: { id: resourceId },
            include: { timeSlot: { include: { lab: true } } },
          });
          resourceOrganizationId = booking?.timeSlot?.lab?.organizationId;
          break;
        }
        case ResourceType.WAITLIST: {
          const waitlist = await prisma.waitlist.findUnique({
            where: { id: resourceId },
            include: { timeSlot: { include: { lab: true } } },
          });
          resourceOrganizationId = waitlist?.timeSlot?.lab?.organizationId;
          break;
        }
        case ResourceType.NOTIFICATION: {
          const notification = await prisma.notification.findUnique({
            where: { id: resourceId },
            include: { user: true },
          });
          resourceOrganizationId = notification?.user?.organizationId;
          break;
        }
        case ResourceType.ORGANIZATION: {
          resourceOrganizationId = resourceId;
          break;
        }
        default: {
          const exhaustiveCheck: never = resourceType;
          return next(
            new HttpException(
              500,
              `Organization check not implemented for resource type: ${exhaustiveCheck}`,
            ),
          );
        }
      }

      if (!resourceOrganizationId) {
        return next(
          new HttpException(404, 'Resource not found or not associated with an organization'),
        );
      }

      if (resourceOrganizationId !== userOrganizationId) {
        return next(new HttpException(403, 'Resource does not belong to your organization'));
      }

      next();
    } catch (error) {
      console.error('Organization access check failed:', error);
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
