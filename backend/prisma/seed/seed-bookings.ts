import { PrismaClient, BookingStatus } from '@prisma/client';
import { getSeedConfig } from './seed-config';

export async function seedBookings(prisma: PrismaClient) {
  console.log('Seeding bookings...');
  const config = getSeedConfig();

  // Get users for bookings
  const users = await prisma.user.findMany({
    where: { user_role: 'USER' }
  });

  if (users.length === 0) {
    throw new Error('No users found. Please seed users first.');
  }

  // Get available time slots
  const timeSlots = await prisma.timeSlot.findMany({
    orderBy: { start_time: 'asc' }
  });

  if (timeSlots.length === 0) {
    throw new Error('No time slots found. Please seed time slots first.');
  }

  // Create bookings with different statuses
  const bookingStatuses = [
    BookingStatus.CONFIRMED,
    BookingStatus.PENDING,
    BookingStatus.COMPLETED,
    BookingStatus.CANCELLED
  ];

  let bookingsCreated = 0;

  // For each user, create the configured number of bookings
  for (const user of users) {
    for (let i = 0; i < config.bookingsPerUser; i++) {
      // Select a time slot for this booking (ensure we don't reuse slots too much)
      const slotIndex = (users.indexOf(user) * config.bookingsPerUser + i) % timeSlots.length;
      const timeSlot = timeSlots[slotIndex];

      // Select a status for this booking
      const status = bookingStatuses[i % bookingStatuses.length];

      await prisma.booking.create({
        data: {
          user_id: user.id,
          slot_id: timeSlot.id,
          booking_status: status,
          booking_timestamp: new Date()
        }
      });

      bookingsCreated++;
    }
  }

  console.log(`Bookings seeded successfully (${bookingsCreated} bookings created)`);
}