import { Request, Response } from 'express';
import { NotificationService } from '@/services/Notification/notification.service';
import { sendSuccess as successResponse } from '@/utils/response';

const service = new NotificationService();

export const sendNotification = async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await service.sendNotification(payload);
  return successResponse(res, result, 201);
};

export const getUserNotifications = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await service.getUserNotifications(userId);
  return successResponse(res, result);
};

export const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await service.markAsRead(id);
  return successResponse(res, result);
};

export const markAllAsRead = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const count = await service.markAllAsRead(userId);
  return successResponse(res, { updatedCount: count });
};

export const deleteNotification = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await service.deleteNotification(id);
  return successResponse(res, result);
};
