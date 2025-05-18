import { PrismaClient, BookingStatus } from '@prisma/client';

export async function seedBookings(prisma: PrismaClient) {
  console.log('Seeding bookings...');

  // Get users for bookings
  const users = await prisma.user.findMany({
    where: { user_role: 'USER' },
    take: 5
  });

  if (users.length === 0) {
    throw new Error('No users found. Please seed users first.');
  }

  // Get available time slots
  const timeSlots = await prisma.timeSlot.findMany({
    take: 20,
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

  // Create 10 sample bookings with different statuses
  for (let i = 0; i < 10; i++) {
    const user = users[i % users.length];
    const timeSlot = timeSlots[i % timeSlots.length];
    const status = bookingStatuses[i % bookingStatuses.length];

    await prisma.booking.create({
      data: {
        user_id: user.id,
        slot_id: timeSlot.id,
        booking_status: status,
        // Remove booking_notes as it doesn't exist in your schema
        booking_timestamp: new Date()
        // Other fields like createdAt and updatedAt have default values
      }
    });
  }

  console.log('Bookings seeded successfully');
}