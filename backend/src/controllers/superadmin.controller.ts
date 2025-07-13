import { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserRole, RequestStatus } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { errorTypes } from '../utils/errors';

const prisma = new PrismaClient();

class SuperAdminController {
  /**
   * List all pending admin registration requests
   */
  async listPendingAdminRequests(req: Request, res: Response) {
    const requests = await prisma.adminRegistrationRequest.findMany({
      where: { status: RequestStatus.PENDING },
      include: { user: true },
    });
    return sendSuccess(res, requests);
  }

  /**
   * Approve a pending admin registration request
   */
  async approveAdminRequest(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized access', errorTypes.UNAUTHORIZED);
      }

      const requestId = req.params.id;

      const request = await prisma.adminRegistrationRequest.findUnique({
        where: { id: requestId },
        include: { user: true },
      });

      if (!request) {
        return sendError(res, 'Request not found', errorTypes.NOT_FOUND);
      }

      if (request.status !== RequestStatus.PENDING) {
        return sendError(res, 'Request already processed', errorTypes.BAD_REQUEST);
      }

      if (!request.user) {
        return sendError(res, 'User not found in request', errorTypes.BAD_REQUEST);
      }

      // ✅ Get the SuperAdmin by their email (from JWT payload)
      const superAdmin = await prisma.superAdmin.findUnique({
        where: { super_admin_email: req.user.email },
      });

      if (!superAdmin) {
        return sendError(res, 'SuperAdmin not found', errorTypes.NOT_FOUND);
      }

      // ✅ Use transaction to ensure atomicity
      await prisma.$transaction(async (tx) => {
        // 1. Create Organization
        const org = await tx.organization.create({
          data: {
            org_name: request.org_name,
            org_type: request.org_type,
            org_location: request.org_location,
            superAdminId: superAdmin.id,
          },
        });

        // 2. Create Admin
        await tx.admin.create({
          data: {
            admin_name: request.user.user_name,
            admin_email: request.user.user_email,
            admin_password: request.user.user_password, // already hashed
            userId: request.userId,
            organizationId: org.id,
          },
        });

        // 3. Promote user to ADMIN
        await tx.user.update({
          where: { id: request.userId },
          data: {
            user_role: UserRole.ADMIN,
            organizationId: org.id,
          },
        });

        // 4. Mark request as APPROVED
        await tx.adminRegistrationRequest.update({
          where: { id: requestId },
          data: { status: RequestStatus.APPROVED },
        });
      });

      return sendSuccess(res, { message: 'Admin request approved' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject a pending admin registration request
   */
  async rejectAdminRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.params.id;

      const request = await prisma.adminRegistrationRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        return sendError(res, 'Request not found', errorTypes.NOT_FOUND);
      }

      if (request.status !== RequestStatus.PENDING) {
        return sendError(res, 'Request already processed', errorTypes.BAD_REQUEST);
      }

      await prisma.adminRegistrationRequest.update({
        where: { id: requestId },
        data: { status: RequestStatus.REJECTED },
      });

      return sendSuccess(res, { message: 'Admin request rejected' });
    } catch (error) {
      next(error);
    }
  }
}

export default new SuperAdminController();
