import { PrismaClient, NotificationType } from '@prisma/client';

export async function seedOrganizationNotifications(prisma: PrismaClient) {
  console.log('Seeding organization notifications...');

  // Get organizations
  const organizations = await prisma.organization.findMany({
    take: 3
  });

  if (organizations.length === 0) {
    throw new Error('No organizations found. Please seed organizations first.');
  }

  // Sample organization notification data
  const notificationData = [
    {
      orgName: organizations[0].org_name,
      notification_type: NotificationType.SYSTEM_NOTIFICATION,
      notification_message: "System maintenance scheduled for this weekend.",
      read: false
    },
    {
      orgName: organizations[1].org_name,
      notification_type: NotificationType.GENERAL_ANNOUNCEMENT,
      notification_message: "All labs will be upgraded next month.",
      read: true
    },
    {
      orgName: organizations[2].org_name,
      notification_type: NotificationType.SYSTEM_NOTIFICATION,
      notification_message: "Please update your lab schedules for the upcoming holiday season.",
      read: false
    }
  ];

  // Create organization notifications
  for (const notification of notificationData) {
    const organization = await prisma.organization.findFirst({
      where: { org_name: notification.orgName }
    });

    if (!organization) continue;

    await prisma.organizationNotification.create({
      data: {
        organizationId: organization.id,
        notification_type: notification.notification_type,
        notification_message: notification.notification_message,
        read: notification.read,
        createdAt: new Date()
      }
    });
  }

  console.log('Organization notifications seeded successfully');
}