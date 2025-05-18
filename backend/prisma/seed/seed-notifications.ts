import { PrismaClient, NotificationType } from '@prisma/client';

export async function seedNotifications(prisma: PrismaClient) {
  console.log('Seeding notifications...');

  // Get users for notifications
  const users = await prisma.user.findMany({
    where: { user_role: 'USER' },
    take: 5
  });

  if (users.length === 0) {
    throw new Error('No users found. Please seed users first.');
  }

  // Sample notification data
  const notificationData = [
    {
      userEmail: users[0].user_email,
      notification_type: NotificationType.BOOKING_CONFIRMATION,
      notification_message: "Your booking for Programming Lab Alpha has been confirmed.",
      read: false
    },
    {
      userEmail: users[1].user_email,
      notification_type: NotificationType.WAITLIST_NOTIFICATION,
      notification_message: "A slot has opened up in Web Development Lab.",
      read: true
    },
    {
      userEmail: users[2].user_email,
      notification_type: NotificationType.GENERAL_ANNOUNCEMENT,
      notification_message: "The lab will be closed for maintenance on Sunday.",
      read: false
    },
    {
      userEmail: users[3].user_email,
      notification_type: NotificationType.BOOKING_CANCELLATION,
      notification_message: "Your booking for Data Science Lab has been cancelled.",
      read: false
    },
    {
      userEmail: users[4].user_email,
      notification_type: NotificationType.SLOT_AVAILABLE,
      notification_message: "New slots are available in Cybersecurity Lab.",
      read: false
    }
  ];

  // Create notifications
  for (const notification of notificationData) {
    const user = await prisma.user.findUnique({
      where: { user_email: notification.userEmail }
    });

    if (!user) continue;

    await prisma.notification.create({
      data: {
        user_id: user.id,
        notification_type: notification.notification_type,
        notification_message: notification.notification_message,
        read: notification.read,
        createdAt: new Date()
      }
    });
  }

  console.log('Notifications seeded successfully');
}