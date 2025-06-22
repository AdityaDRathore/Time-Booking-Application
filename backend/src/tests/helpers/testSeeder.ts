import { PrismaClient } from '@prisma/client';

// 🧩 Correct named imports with aliases
import { seedUsers } from '@/../prisma/seed/seed-users';
import { seedLabs } from '@/../prisma/seed/seed-labs';
import { seedTimeSlots } from '@/../prisma/seed/seed-timeslots';
import { seedBookings } from '@/../prisma/seed/seed-bookings';
import { seedNotifications } from '@/../prisma/seed/seed-notifications';
import { seedOrganizationNotifications as seedOrgNotifications } from '@/../prisma/seed/seed-org-notifications';
import { seedOrganizations as seedOrgs } from '@/../prisma/seed/seed-orgs';
import { seedWaitlists } from '@/../prisma/seed/seed-waitlists';
import { seedAdminOrgLinks } from '@/../prisma/seed/seed-admin-org-links';

const prisma = new PrismaClient();

export const setupTestDB = async () => {
  console.log('🧹 Cleaning test database...');

  // Respect foreign key deletion order
  await prisma.booking.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.lab.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.organizationNotification.deleteMany();
  await prisma.waitlist.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.superAdmin.deleteMany();
  await prisma.user.deleteMany();

  console.log('🌱 Seeding test database...');

  // Run all seeding scripts in proper order
  await seedUsers(prisma);
  await seedOrgs(prisma);
  await seedAdminOrgLinks(prisma);
  await seedLabs(prisma);
  await seedTimeSlots(prisma);
  await seedBookings(prisma);
  await seedNotifications(prisma);
  await seedOrgNotifications(prisma);
  await seedWaitlists(prisma);

  console.log('✅ Test database setup completed.');
};

export const disconnectDB = async () => {
  await prisma.$disconnect();
};
