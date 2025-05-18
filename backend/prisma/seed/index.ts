import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seed-users';
import { seedOrganizations } from './seed-orgs';
import { seedLabs } from './seed-labs';
import { seedTimeSlots } from './seed-timeslots';
import { seedBookings } from './seed-bookings';
import { seedWaitlists } from './seed-waitlists';
import { seedNotifications } from './seed-notifications';
import { seedOrganizationNotifications } from './seed-org-notifications';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');
  
  try {
    // Seed in the correct order to respect relationships
    await seedUsers(prisma);
    await seedOrganizations(prisma);
    await seedLabs(prisma);
    await seedTimeSlots(prisma);
    await seedBookings(prisma);
    await seedWaitlists(prisma);
    await seedNotifications(prisma);
    await seedOrganizationNotifications(prisma);
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding the database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });