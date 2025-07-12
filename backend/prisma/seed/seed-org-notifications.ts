import { PrismaClient, NotificationType } from '@prisma/client';
import { getSeedConfig } from './seed-config';

export async function seedOrganizationNotifications(prisma: PrismaClient) {
  console.log('Seeding organization notifications...');

  // Get organizations
  const organizations = await prisma.organization.findMany({
    take: getSeedConfig().organizations
  });

  if (organizations.length === 0) {
    console.warn('No organizations found. Skipping organization notifications seeding.');
    return;
  }

  // Sample organization notification data
  const notificationTypes = [
    NotificationType.GENERAL_ANNOUNCEMENT,
    NotificationType.SYSTEM_NOTIFICATION
  ];

  const notificationContent = [
    {
      title: "System Maintenance",
      content: "System will be under maintenance this weekend. Please plan accordingly."
    },
    {
      title: "New Lab Equipment",
      content: "New equipment has been installed in all labs. Training session scheduled next week."
    },
    {
      title: "Holiday Schedule",
      content: "All labs will be closed during the upcoming holidays. See schedule for details."
    },
    {
      title: "Policy Update",
      content: "Our booking policy has been updated. Please review the changes."
    }
  ];

  let notificationsCreated = 0;

  // Create notifications for each organization
  for (const org of organizations) {
    const notificationsPerOrg = getSeedConfig().orgNotificationsPerOrg;

    for (let i = 0; i < notificationsPerOrg; i++) {
      const notificationIndex = i % notificationContent.length;
      const notificationType = notificationTypes[i % notificationTypes.length];

      await prisma.organizationNotification.create({
        data: {
          notification_message: `${notificationContent[notificationIndex].title}: ${notificationContent[notificationIndex].content}`,
          notification_type: notificationType,
          read: Math.random() > 0.5, // Randomly mark as read
          organization: {
            connect: { id: org.id }
          }
        }
      });

      notificationsCreated++;
    }
  }

  console.log(`Created ${notificationsCreated} organization notifications`);
}