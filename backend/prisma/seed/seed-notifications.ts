import { PrismaClient, NotificationType } from '@prisma/client';
import { getSeedConfig } from './seed-config';

export async function seedNotifications(prisma: PrismaClient) {
  console.log('Seeding notifications...');
  const config = getSeedConfig();

  // Get users for notifications
  const users = await prisma.user.findMany({
    where: { user_role: 'USER' }
  });

  if (users.length === 0) {
    throw new Error('No users found. Please seed users first.');
  }

  // Sample notification templates
  const notificationTemplates = [
    {
      type: NotificationType.BOOKING_CONFIRMATION,
      message: "Your booking for {lab} has been confirmed."
    },
    {
      type: NotificationType.WAITLIST_NOTIFICATION,
      message: "A slot has opened up in {lab}."
    },
    {
      type: NotificationType.GENERAL_ANNOUNCEMENT,
      message: "The lab will be closed for maintenance on Sunday."
    },
    {
      type: NotificationType.BOOKING_CANCELLATION,
      message: "Your booking for {lab} has been cancelled."
    },
    {
      type: NotificationType.SLOT_AVAILABLE,
      message: "New slots are available in {lab}."
    }
  ];

  // Get labs for notification messages
  const labs = await prisma.lab.findMany();

  let notificationsCreated = 0;

  // For each user, create the configured number of notifications
  for (const user of users) {
    for (let i = 0; i < config.notificationsPerUser; i++) {
      // Select a notification template
      const templateIndex = i % notificationTemplates.length;
      const template = notificationTemplates[templateIndex];

      // Select a lab to mention
      const labIndex = (users.indexOf(user) + i) % Math.max(1, labs.length);
      const labName = labs.length > 0 ? labs[labIndex].lab_name : "Programming Lab";

      // Create the notification message with the lab name
      const message = template.message.replace("{lab}", labName);

      await prisma.notification.create({
        data: {
          user_id: user.id,
          notification_type: template.type,
          notification_message: message,
          read: Math.random() > 0.7, // 30% chance of being read
          createdAt: new Date()
        }
      });

      notificationsCreated++;
    }
  }

  console.log(`Notifications seeded successfully (${notificationsCreated} notifications created)`);
}