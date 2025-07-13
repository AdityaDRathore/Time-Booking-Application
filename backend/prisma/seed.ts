import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seed/seed-users';
import { seedOrganizations } from './seed/seed-orgs';
import { seedLabs } from './seed/seed-labs';
import { seedTimeSlots } from './seed/seed-timeslots';
import { seedBookings } from './seed/seed-bookings';
import { seedWaitlists } from './seed/seed-waitlists';
import { seedNotifications } from './seed/seed-notifications';
import { seedOrganizationNotifications } from './seed/seed-org-notifications';
import { logSeedOperation, verifyDataExists } from './seed/seed-utils';

async function main() {
  const prisma = new PrismaClient();
  console.log(`\n🌱 Starting database seeding for ${process.env.NODE_ENV || 'development'}...\n`);
  const startTime = Date.now();

  try {
    // Clean database
    console.log('🧹 Cleaning existing data...');
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

    // Seed in order
    await logSeedOperation('Super Admin', () => seedUsers(prisma, { onlySuperAdmin: true }));
    await verifyDataExists(prisma, 'user', 'Failed to seed super admin');

    await logSeedOperation('Organizations', () => seedOrganizations(prisma));
    await verifyDataExists(prisma, 'organization', 'Failed to seed organizations');

    await logSeedOperation('Users', () => seedUsers(prisma, { skipSuperAdmin: true }));
    await verifyDataExists(prisma, 'user', 'Failed to seed users');

    // ⛔ Removed: seedAdminOrgLinks (already handled in seedUsers)

    await logSeedOperation('Labs', () => seedLabs(prisma));
    await verifyDataExists(prisma, 'lab', 'Failed to seed labs');

    await logSeedOperation('Time Slots', () => seedTimeSlots(prisma));
    await verifyDataExists(prisma, 'timeSlot', 'Failed to seed time slots');

    await logSeedOperation('Bookings', () => seedBookings(prisma));
    await logSeedOperation('Waitlists', () => seedWaitlists(prisma));
    await logSeedOperation('User Notifications', () => seedNotifications(prisma));
    await logSeedOperation('Organization Notifications', () => seedOrganizationNotifications(prisma));

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Seeding completed in ${duration}s\n`);

    await verifySeedData(prisma);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function verifySeedData(prisma: PrismaClient) {
  console.log('\n📊 Verification Summary:');

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

  console.log('\n🔍 Relationship Checks:');
  console.log('✅ Admins require organization linkage — null check skipped since organizationId is required');

  const labsWithoutOrgs = await prisma.lab.count({
    where: {
      organization: { isNot: {} },
    },
  });

  if (labsWithoutOrgs > 0) {
    console.warn(`⚠️ Found ${labsWithoutOrgs} labs not linked to any organization`);
  } else {
    console.log('✅ All labs are properly linked to organizations');
  }

  console.log('\n📝 Manual Setup Notes:');
  console.log('- No manual setup required.');
  console.log('- Test user email: test@example.com / testpassword');
  console.log('- Super admin: superadmin@mpgovt.in / SuperAdmin123!');
}

main();

export { seedUsers, seedLabs, seedTimeSlots, seedBookings };
