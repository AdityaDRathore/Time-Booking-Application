import { Router } from 'express';
import {
  sendNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '@/controllers/notification.controller';

import validate from '@/middleware/validate.middleware';  // Your validation middleware
import {
  sendNotificationSchema,
  idParamSchema,       // for validating :id params
} from '@/validation/notification.validation';

const router = Router();

// Send a new notification (validate request body)
router.post('/', validate(sendNotificationSchema), sendNotification);

// Get all notifications for the authenticated user (no body validation needed here)
router.get('/', getUserNotifications);

// Mark a specific notification as read by ID (validate :id param)
router.patch('/:id/read', validate(idParamSchema, 'params'), markAsRead);

// Mark all notifications as read for the authenticated user (no body)
router.patch('/read-all', markAllAsRead);

// Delete a specific notification by ID (validate :id param)
router.delete('/:id', validate(idParamSchema, 'params'), deleteNotification);

export default router;
