// ✅ 1. Define all mock functions first
const mockCreate = jest.fn();
const mockFindMany = jest.fn();
const mockUpdate = jest.fn();
const mockUpdateMany = jest.fn();
const mockDelete = jest.fn();

// ✅ 2. Mock the prisma module BEFORE importing the service
jest.mock('@/repository/base/transaction', () => ({
  prisma: {
    notification: {
      create: mockCreate,
      findMany: mockFindMany,
      update: mockUpdate,
      updateMany: mockUpdateMany,
      delete: mockDelete,
    },
  },
}));

// ✅ 3. Now safely import the service and required types
import { NotificationService } from '../notification.service';
import { NotificationType } from '@prisma/client';

const mockNotification = {
  id: 'notif1',
  user_id: 'u1',
  notification_type: NotificationType.BOOKING_CONFIRMATION,
  notification_message: 'Your booking is confirmed.',
  notification_timestamp: new Date(),
  read: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('NotificationService', () => {
  const service = new NotificationService();
  const userId = 'u1';
  const notifId = 'notif1';

  beforeEach(() => {
    jest.clearAllMocks();

    mockCreate.mockResolvedValue(mockNotification);
    mockFindMany.mockResolvedValue([mockNotification]);
    mockUpdate.mockResolvedValue({ ...mockNotification, read: true });
    mockUpdateMany.mockResolvedValue({ count: 2 });
    mockDelete.mockResolvedValue(mockNotification);
  });

  it('should send a notification', async () => {
    const notif = await service.sendNotification({
      user_id: userId,
      notification_type: NotificationType.BOOKING_CONFIRMATION,
      notification_message: 'Your booking is confirmed.',
    });

    expect(notif.user_id).toBe(userId);
    expect(mockCreate).toHaveBeenCalled();
  });

  it('should get notifications for a user', async () => {
    const notifs = await service.getUserNotifications(userId);

    expect(Array.isArray(notifs)).toBe(true);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { user_id: userId },
      orderBy: { notification_timestamp: 'desc' },
    });
  });

  it('should mark a notification as read', async () => {
    const updated = await service.markAsRead(notifId);

    expect(updated.read).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: notifId },
      data: { read: true },
    });
  });

  it('should mark all notifications as read', async () => {
    const count = await service.markAllAsRead(userId);

    expect(count).toBe(2);
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { user_id: userId, read: false },
      data: { read: true },
    });
  });

  it('should delete a notification', async () => {
    const deleted = await service.deleteNotification(notifId);

    expect(deleted.id).toBe(notifId);
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: notifId } });
  });
});
