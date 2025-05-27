import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { ResourceType } from '../constants/ownership';
import { HttpException } from '../../exceptions/HttpException';
import { RequestUser } from '../middleware/rbacMiddleware';

/**
 * Authorization context containing information needed for authorization decisions
 */
export interface AuthContext {
  userId: string;
  userRole: UserRole;
  organizationId?: string | null;
  resourceType?: ResourceType;
  resourceId?: string;
  requestTime?: Date;
  requestMethod?: string;
  requestPath?: string;
  additionalData?: Record<string, unknown>;
}

/**
 * Create an authorization context from a request
 * @param req Express request
 * @param resourceType Optional resource type
 * @param resourceId Optional resource ID
 * @returns Authorization context
 */
export const createAuthContextFromRequest = (
  req: Request,
  resourceType?: ResourceType,
  resourceId?: string,
): AuthContext | null => {
  const user = req.user as RequestUser | undefined;
  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    userRole: user.role,
    organizationId: user.organizationId,
    resourceType,
    resourceId,
    requestTime: new Date(),
    requestMethod: req.method,
    requestPath: req.path,
  };
};

/**
 * Check if a context satisfies time-based restrictions
 * @param context Authorization context
 * @param startTime Start of allowed time window (hours 0-23)
 * @param endTime End of allowed time window (hours 0-23)
 * @param daysOfWeek Array of allowed days (0-6, where 0 is Sunday)
 * @returns Boolean indicating if time restrictions are satisfied
 */
export const checkTimeRestrictions = (
  context: AuthContext,
  startTime: number,
  endTime: number,
  daysOfWeek: number[] = [0, 1, 2, 3, 4, 5, 6],
): boolean => {
  const now = context.requestTime || new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();

  return currentHour >= startTime && currentHour < endTime && daysOfWeek.includes(currentDay);
};

/**
 * Create a middleware that uses context for authorization decisions
 * @param checkFn Function that checks if access is allowed based on context
 * @param resourceType Optional resource type
 * @param resourceIdParam Parameter name in URL that contains resource ID
 * @returns Express middleware
 */
export const createContextMiddleware = (
  checkFn: (context: AuthContext) => boolean | Promise<boolean>,
  resourceType?: ResourceType,
  resourceIdParam: string = 'id',
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user as RequestUser | undefined;
    if (!user) {
      return next(new HttpException(401, 'Authentication required'));
    }

    const resourceId = req.params[resourceIdParam];
    const context = createAuthContextFromRequest(req, resourceType, resourceId);

    if (!context) {
      return next(new HttpException(401, 'Could not create authorization context'));
    }

    try {
      const isAllowed = await Promise.resolve(checkFn(context));

      if (!isAllowed) {
        return next(new HttpException(403, 'Access denied based on context'));
      }

      next();
    } catch (error) {
      console.error('Context-based authorization error:', error);
      next(new HttpException(500, 'Error during context-based authorization'));
    }
  };
};
