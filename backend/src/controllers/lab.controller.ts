// src/controllers/lab.controller.ts

import { Request, Response } from 'express';
import { PrismaClient, LabStatus } from '@prisma/client';
import { sendError, sendSuccess } from '../utils/response';

const prisma = new PrismaClient();

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error';
}

export const createLab = async (req: Request, res: Response) => {
  try {
    const {
      lab_name,
      lab_capacity,
      status,
      location,
      description,
      organizationId,
      adminId,
    } = req.body;

    if (!lab_name || !lab_capacity || !organizationId || !adminId) {
      return sendError(res, 'Missing required fields: lab_name, lab_capacity, organizationId, adminId', 400);
    }

    const newLab = await prisma.lab.create({
      data: {
        lab_name,
        lab_capacity,
        status: status ?? LabStatus.ACTIVE,
        location,
        description,
        organizationId,
        adminId,
      },
    });

    return sendSuccess(res, newLab);
  } catch (error) {
    return sendError(res, 'Failed to create lab', 500, getErrorMessage(error));
  }
};

export const getLabs = async (_req: Request, res: Response) => {
  try {
    const labs = await prisma.lab.findMany({
      include: {
        admin: true,
        organization: true,
        timeSlots: true,
      },
    });
    return sendSuccess(res, labs);
  } catch (error) {
    return sendError(res, 'Failed to fetch labs', 500, getErrorMessage(error));
  }
};

export const getLabById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const lab = await prisma.lab.findUnique({
      where: { id },
      include: {
        admin: true,
        organization: true,
        timeSlots: true,
      },
    });

    if (!lab) return sendError(res, 'Lab not found', 404);

    return sendSuccess(res, lab);
  } catch (error) {
    return sendError(res, 'Failed to fetch lab', 500, getErrorMessage(error));
  }
};

export const updateLab = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      lab_name,
      lab_capacity,
      status,
      location,
      description,
      organizationId,
      adminId,
    } = req.body;

    const existingLab = await prisma.lab.findUnique({ where: { id } });
    if (!existingLab) return sendError(res, 'Lab not found', 404);

    const updatedLab = await prisma.lab.update({
      where: { id },
      data: {
        lab_name,
        lab_capacity,
        status,
        location,
        description,
        organizationId,
        adminId,
      },
    });

    return sendSuccess(res, updatedLab);
  } catch (error) {
    return sendError(res, 'Failed to update lab', 500, getErrorMessage(error));
  }
};

export const deleteLab = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingLab = await prisma.lab.findUnique({ where: { id } });
    if (!existingLab) return sendError(res, 'Lab not found', 404);

    await prisma.lab.delete({ where: { id } });

    return sendSuccess(res, { message: 'Lab deleted successfully' });
  } catch (error) {
    return sendError(res, 'Failed to delete lab', 500, getErrorMessage(error));
  }
};
