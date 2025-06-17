import { Notification } from '@prisma/client';
import { prisma } from '@/repository/base/transaction';
import { NotificationPayload } from './notification.types';

export class NotificationService {
  async sendNotification(data: NotificationPayload): Promise<Notification> {
    return prisma.notification.create({
      data: {
        user_id: data.user_id,
        notification_type: data.notification_type,
        notification_message: data.notification_message,
        notification_timestamp: new Date(),
        read: false,
      },
    });
  }

  async getUserNotifications(user_id: string): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { user_id },
      orderBy: { notification_timestamp: 'desc' },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(user_id: string): Promise<number> {
    const updated = await prisma.notification.updateMany({
      where: { user_id, read: false },
      data: { read: true },
    });
    return updated.count;
  }

  async deleteNotification(id: string): Promise<Notification> {
    return prisma.notification.delete({
      where: { id },
    });
  }
}
