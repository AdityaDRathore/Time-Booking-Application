import { PrismaClient, WaitlistStatus } from '@prisma/client';

export async function seedWaitlists(prisma: PrismaClient) {
  console.log('Seeding waitlists...');

  // Get users for waitlists
  const users = await prisma.user.findMany({
    where: { user_role: 'USER' },
    take: 3
  });

  if (users.length === 0) {
    throw new Error('No users found. Please seed users first.');
  }

  // Find time slots that are fully booked
  // First, mark two time slots as fully booked
  const timeSlots = await prisma.timeSlot.findMany({
    take: 2,
    orderBy: { start_time: 'asc' }
  });

  if (timeSlots.length === 0) {
    throw new Error('No time slots found. Please seed time slots first.');
  }

  // Update the time slots to be fully booked
  for (const slot of timeSlots) {
    await prisma.timeSlot.update({
      where: { id: slot.id },
      data: { status: 'FULL' }
    });
  }

  // Create waitlist entries
  // First waitlist - position 1 and 2 are ACTIVE
  await prisma.waitlist.create({
    data: {
      user_id: users[0].id,
      slot_id: timeSlots[0].id,
      waitlist_position: 1,
      waitlist_status: WaitlistStatus.ACTIVE,
      // createdAt has default value in schema
    }
  });

  await prisma.waitlist.create({
    data: {
      user_id: users[1].id,
      slot_id: timeSlots[0].id,
      waitlist_position: 2,
      waitlist_status: WaitlistStatus.ACTIVE,
      // createdAt has default value in schema
    }
  });

  // Second waitlist - position 1 is FULFILLED
  await prisma.waitlist.create({
    data: {
      user_id: users[2].id,
      slot_id: timeSlots[1].id,
      waitlist_position: 1,
      waitlist_status: WaitlistStatus.FULFILLED,
      // createdAt has default value in schema
    }
  });

  console.log('Waitlists seeded successfully');
}