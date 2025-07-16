import { PrismaClient, NotificationType } from '@prisma/client';
import { getSeedConfig } from './seed-config';

export async function seedNotifications(prisma: PrismaClient) {
  console.log('Seeding notifications...');
  const config = getSeedConfig();

  const users = await prisma.user.findMany({
    where: { user_role: 'USER' },
  });

  if (users.length === 0) {
    throw new Error('No users found. Please seed users first.');
  }

  const labs = await prisma.lab.findMany();

  const now = new Date();
  let notificationsCreated = 0;

  const notificationTemplates = [
    {
      type: NotificationType.BOOKING_CONFIRMATION,
      message: 'Your booking for {lab} has been confirmed.',
    },
    {
      type: NotificationType.WAITLIST_NOTIFICATION,
      message: 'You have been waitlisted for {lab}.',
    },
    {
      type: NotificationType.BOOKING_CANCELLATION,
      message: 'Your booking for {lab} has been cancelled.',
    },
    {
      type: NotificationType.SLOT_AVAILABLE,
      message: 'New slots are available in {lab}.',
    },
    {
      type: NotificationType.GENERAL_ANNOUNCEMENT,
      message: 'The lab will be closed for maintenance on Sunday.',
    },
  ];

  for (const user of users) {
    for (let i = 0; i < config.notificationsPerUser; i++) {
      const template = notificationTemplates[i % notificationTemplates.length];
      const lab = labs[i % labs.length] || { lab_name: 'Demo Lab' };

      const date = new Date(now.getTime() + i * 60 * 60 * 1000); // staggered future times
      const startTime = new Date(date.setHours(9, 0));
      const endTime = new Date(date.setHours(10, 0));

      const message = template.message.replace('{lab}', lab.lab_name);

      await prisma.notification.create({
        data: {
          user_id: user.id,
          notification_type: template.type,
          notification_message: message,
          read: Math.random() > 0.7,
          notification_timestamp: new Date(),
          metadata: {
            labName: lab.lab_name,
            date: startTime.toISOString(),
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            position: template.type === NotificationType.WAITLIST_NOTIFICATION ? Math.floor(Math.random() * 5) + 1 : undefined,
          },
        },
      });

      notificationsCreated++;
    }
  }

  console.log(`✅ Seeded ${notificationsCreated} notifications successfully.`);
}
