import { Notification, Prisma } from '@prisma/client';
import { prisma } from '@/repository/base/transaction';

export class NotificationRepository {
  async create(data: Prisma.NotificationCreateInput): Promise<Notification> {
    return await prisma.notification.create({ data });
  }

  async findByUser(user_id: string): Promise<Notification[]> {
    return await prisma.notification.findMany({
      where: { user_id },
      orderBy: { notification_timestamp: 'desc' },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return await prisma.notification.update({
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
}
