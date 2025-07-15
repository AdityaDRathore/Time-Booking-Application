import { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserRole, RequestStatus } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { errorTypes } from '../utils/errors';
import { sendEmail } from '../utils/sendEmail';

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

      const superAdmin = await prisma.superAdmin.findUnique({
        where: { super_admin_email: req.user.email },
      });

      if (!superAdmin) {
        return sendError(res, 'SuperAdmin not found', errorTypes.NOT_FOUND);
      }

      await prisma.$transaction(async (tx) => {
        const org = await tx.organization.create({
          data: {
            org_name: request.org_name,
            org_type: request.org_type,
            org_location: request.org_location,
            superAdminId: superAdmin.id,
          },
        });

        await tx.admin.create({
          data: {
            admin_name: request.user.user_name,
            admin_email: request.user.user_email,
            admin_password: request.user.user_password, // already hashed
            userId: request.userId,
            organizationId: org.id,
          },
        });

        await tx.user.update({
          where: { id: request.userId },
          data: {
            user_role: UserRole.ADMIN,
            organizationId: org.id,
          },
        });

        await tx.adminRegistrationRequest.update({
          where: { id: requestId },
          data: { status: RequestStatus.APPROVED },
        });
      });

      // ✅ Send approval email
      await sendEmail(
        request.user.user_email,
        '✅ Admin Registration Approved',
        `Dear ${request.user.user_name},

Your admin registration request for "${request.org_name}" has been approved by the Super Admin.

You can now log in and access the admin panel.

Thank you,
Digital Lab Booking Team`
      );

      return sendSuccess(res, { message: 'Admin request approved and email sent.' });
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
        include: { user: true },
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

      // ✅ Send rejection email
      await sendEmail(
        request.user.user_email,
        '❌ Admin Registration Declined',
        `Dear ${request.user.user_name},

Unfortunately, your admin registration request for "${request.org_name}" has been declined by the Super Admin.

If you believe this is a mistake or need clarification, feel free to contact us.

Thank you,
Digital Lab Booking Team`
      );

      return sendSuccess(res, { message: 'Admin request rejected and email sent.' });
    } catch (error) {
      next(error);
    }
  }
}

export const getAdminRequestHistory = async (req: Request, res: Response) => {
  try {
    const history = await prisma.adminRegistrationRequest.findMany({
      where: {
        status: { in: ['APPROVED', 'REJECTED'] },
      },
      include: {
        user: {
          select: {
            user_name: true,
            user_email: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return sendSuccess(res, history);
  } catch (error) {
    console.error('Failed to fetch admin request history:', error);
    return sendError(res, 'Failed to fetch history', 500, 'FETCH_HISTORY_ERROR');
  }
};

export default new SuperAdminController();
