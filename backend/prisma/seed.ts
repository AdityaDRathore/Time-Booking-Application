import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seed/seed-users';
import { seedOrganizations } from './seed/seed-orgs';
import { seedLabs } from './seed/seed-labs';
import { seedTimeSlots } from './seed/seed-timeslots';
import { seedBookings } from './seed/seed-bookings';
import { seedWaitlists } from './seed/seed-waitlists';
import { seedNotifications } from './seed/seed-notifications';
import { seedOrganizationNotifications } from './seed/seed-org-notifications';
import { seedAdminOrgLinks } from './seed/seed-admin-org-links';
import { logSeedOperation, verifyDataExists } from './seed/seed-utils';

async function main() {
  console.log(`\n🌱 Starting database seeding for ${process.env.NODE_ENV || 'development'} environment...\n`);

  const prisma = new PrismaClient();
  const startTime = Date.now();

  try {
    // Seed in order of dependencies
    await logSeedOperation('Users', () => seedUsers(prisma));
    await verifyDataExists(prisma, 'user', 'Failed to seed users');

    await logSeedOperation('Organizations', () => seedOrganizations(prisma));
    await verifyDataExists(prisma, 'organization', 'Failed to seed organizations');

    await logSeedOperation('Admin-Organization Links', () => seedAdminOrgLinks(prisma));
    await verifyDataExists(prisma, 'admin', 'Failed to seed admin-organization links');

    await logSeedOperation('Labs', () => seedLabs(prisma));
    await verifyDataExists(prisma, 'lab', 'Failed to seed labs');

    await logSeedOperation('Time Slots', () => seedTimeSlots(prisma));
    await verifyDataExists(prisma, 'timeSlot', 'Failed to seed time slots');

    await logSeedOperation('Bookings', () => seedBookings(prisma));
    // Bookings may be empty in test environment, so no verification

    await logSeedOperation('Waitlists', () => seedWaitlists(prisma));
    // Waitlists may be empty, so no verification

    await logSeedOperation('User Notifications', () => seedNotifications(prisma));
    // Notifications may be empty, so no verification

    await logSeedOperation('Organization Notifications', () => seedOrganizationNotifications(prisma));
    // Org notifications may be empty, so no verification

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Database seeding completed successfully in ${duration}s\n`);

    // Print verification summary
    await verifySeedData(prisma);
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function verifySeedData(prisma: PrismaClient) {
  console.log('\n📊 Seed Data Verification Summary:');

  // Get counts of all entity types
  const userCount = await prisma.user.count();
  const adminCount = await prisma.admin.count();
  const organizationCount = await prisma.organization.count();
  const labCount = await prisma.lab.count();
  const timeSlotCount = await prisma.timeSlot.count();
  const bookingCount = await prisma.booking.count();
  const waitlistCount = await prisma.waitlist.count();
  const notificationCount = await prisma.notification.count();
  const orgNotificationCount = await prisma.organizationNotification.count();

  console.log(`Users: ${userCount}`);
  console.log(`Admins: ${adminCount}`);
  console.log(`Organizations: ${organizationCount}`);
  console.log(`Labs: ${labCount}`);
  console.log(`Time Slots: ${timeSlotCount}`);
  console.log(`Bookings: ${bookingCount}`);
  console.log(`Waitlists: ${waitlistCount}`);
  console.log(`User Notifications: ${notificationCount}`);
  console.log(`Organization Notifications: ${orgNotificationCount}`);

  // Verify key relationships
  console.log('\n🔍 Relationship Verification:');

  // Check if admins are properly linked to organizations
  const adminsWithoutOrgs = await prisma.admin.count({
    where: {
      organization: {
        isNot: {}
      }
    }
  });

  if (adminsWithoutOrgs > 0) {
    console.warn(`⚠️ Found ${adminsWithoutOrgs} admins not linked to any organization`);
  } else {
    console.log('✅ All admins are properly linked to organizations');
  }

  // Check if labs are properly linked to organizations and admins
  const labsWithoutOrgs = await prisma.lab.count({
    where: {
      organization: {
        isNot: {}
      }
    }
  });

  if (labsWithoutOrgs > 0) {
    console.warn(`⚠️ Found ${labsWithoutOrgs} labs not linked to any organization`);
  } else {
    console.log('✅ All labs are properly linked to organizations');
  }

  console.log('\n📝 Manual Setup Note:');
  console.log('- No additional manual steps required.');
  console.log('- User credentials are available in seed-users.ts');
  console.log('- Super admin login: superadmin@mpgovt.in / SuperAdmin123!');
}

main();

export { seedUsers, seedLabs, seedTimeSlots, seedBookings };
