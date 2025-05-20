import { PrismaClient, WaitlistStatus } from '@prisma/client';
import { getSeedConfig } from './seed-config';

export async function seedWaitlists(prisma: PrismaClient) {
  console.log('Seeding waitlists...');
  const config = getSeedConfig();

  // Get users for waitlists
  const users = await prisma.user.findMany({
    where: { user_role: 'USER' }
  });

  if (users.length === 0) {
    throw new Error('No users found. Please seed users first.');
  }

  // Find time slots to mark as fully booked for waitlisting
  const timeSlots = await prisma.timeSlot.findMany({
    take: Math.max(1, Math.ceil(config.waitlistsPerUser * users.length / 2)), // Ensure enough slots
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

  let waitlistsCreated = 0;

  // For each user, create the configured number of waitlist entries
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    for (let j = 0; j < config.waitlistsPerUser; j++) {
      // Select a time slot for this waitlist (round-robin)
      const slotIndex = (i * config.waitlistsPerUser + j) % timeSlots.length;
      const timeSlot = timeSlots[slotIndex];

      // Determine position (1-3)
      const position = (j % 3) + 1;

      // Determine status (first position may be FULFILLED, others ACTIVE)
      const status = position === 1 && Math.random() > 0.7
        ? WaitlistStatus.FULFILLED
        : WaitlistStatus.ACTIVE;

      await prisma.waitlist.create({
        data: {
          user_id: user.id,
          slot_id: timeSlot.id,
          waitlist_position: position,
          waitlist_status: status
        }
      });

      waitlistsCreated++;
    }
  }

  console.log(`Waitlists seeded successfully (${waitlistsCreated} waitlist entries created)`);
}