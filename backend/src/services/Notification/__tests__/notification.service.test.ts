import { NotificationService } from '../notification.service';
import { NotificationType } from '@prisma/client';

// Mock notification object
const mockNotification = {
  id: 'notif1',
  user_id: 'u1',
  notification_type: NotificationType.BOOKING_CONFIRMATION,
  notification_message: 'Your booking is confirmed.',
  read: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock Prisma methods
const mockCreate = jest.fn().mockResolvedValue(mockNotification);
const mockFindMany = jest.fn().mockResolvedValue([mockNotification]);
const mockUpdate = jest.fn().mockResolvedValue({ ...mockNotification, read: true });

jest.mock('@/repository/base/transaction', () => ({
  prisma: {
    notification: {
      create: mockCreate,
      findMany: mockFindMany,
      update: mockUpdate,
    },
  },
}));

describe('NotificationService', () => {
  const service = new NotificationService();
  let notifId: string;

  beforeEach(() => {
    jest.clearAllMocks();
    notifId = 'notif1';
  });

  it('should send a notification', async () => {
    const notif = await service.sendNotification({
      user_id: 'u1',
      notification_type: NotificationType.BOOKING_CONFIRMATION,
      notification_message: 'Your booking is confirmed.',
    });

    expect(notif.user_id).toBe('u1');
    expect(notif.notification_type).toBe(NotificationType.BOOKING_CONFIRMATION);
    expect(mockCreate).toHaveBeenCalled();
    notifId = notif.id;
  });

  it('should get notifications for a user', async () => {
    const notifs = await service.getUserNotifications('u1');

    expect(Array.isArray(notifs)).toBe(true);
    expect(notifs.length).toBeGreaterThan(0);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { user_id: 'u1' },
      orderBy: { createdAt: 'desc' },
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
});
