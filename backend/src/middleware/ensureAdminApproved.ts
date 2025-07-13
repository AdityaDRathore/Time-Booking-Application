// src/middleware/ensureAdminApproved.ts
import { NextFunction, Request, Response } from 'express';
import { prisma } from '@src/repository/base/transaction';

export const ensureAdminApproved = async (
  req: Request & { user?: { id: string; user_role: string } },
  res: Response,
  next: NextFunction
) => {
  if (req.user?.user_role !== 'ADMIN') return next();

  const request = await prisma.adminRegistrationRequest.findUnique({
    where: { userId: req.user.id }
  });

  if (!request || request.status !== 'APPROVED') {
    return res.status(403).json({
      message: 'Your registration is still pending approval by Super Admin.'
    });
  }

  next();
};
