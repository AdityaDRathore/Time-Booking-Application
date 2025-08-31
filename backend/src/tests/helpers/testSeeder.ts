import { PrismaClient } from '@prisma/client';

// 🧩 Correct named imports with aliases
import { seedUsers } from '@prisma/seed/seed-users';
import { seedLabs } from '@prisma/seed/seed-labs';
import { seedTimeSlots } from '@prisma/seed/seed-timeslots';
import { seedBookings } from '@prisma/seed/seed-bookings';
import { seedNotifications } from '@prisma/seed/seed-notifications';
import { seedOrganizationNotifications as seedOrgNotifications } from '@prisma/seed/seed-org-notifications';
import { seedOrganizations as seedOrgs } from '@prisma/seed/seed-orgs';
import { seedWaitlists } from '@prisma/seed/seed-waitlists';
import { seedAdminOrgLinks } from '@prisma/seed/seed-admin-org-links';
const prisma = new PrismaClient();

export const setupTestDB = async () => {
  console.log('🧹 Cleaning test database...');

  // Delete in FK-safe order (children first → parents last)
  await prisma.notification.deleteMany();
  await prisma.waitlist.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.organizationNotification.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.lab.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.superAdmin.deleteMany();

  console.log('🌱 Seeding test database...');

  // 🧪 Order matters
  await seedUsers(prisma);
  await seedOrgs(prisma);
  await seedAdminOrgLinks(prisma);         // optionally includes Admins
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
