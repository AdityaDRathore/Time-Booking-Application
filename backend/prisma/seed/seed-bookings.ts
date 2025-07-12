import { PrismaClient, BookingStatus } from '@prisma/client';
import { getSeedConfig } from './seed-config';

export async function seedBookings(prisma: PrismaClient) {
  console.log('📚 Seeding bookings...');
  const config = getSeedConfig();

  const users = await prisma.user.findMany({
    where: { user_role: 'USER' }
  });

  if (users.length === 0) throw new Error('❌ No users found. Please seed users first.');

  const timeSlots = await prisma.timeSlot.findMany({
    where: { status: 'AVAILABLE' },
    orderBy: { start_time: 'asc' }
  });

  if (timeSlots.length === 0) throw new Error('❌ No time slots found. Please seed time slots first.');

  const bookingStatuses = [
    BookingStatus.CONFIRMED,
    BookingStatus.PENDING,
    BookingStatus.COMPLETED,
    BookingStatus.CANCELLED
  ];

  let bookingsCreated = 0;

  for (let u = 0; u < users.length; u++) {
    const user = users[u];

    for (let i = 0; i < config.bookingsPerUser; i++) {
      const slotIndex = (u * config.bookingsPerUser + i) % timeSlots.length;
      const slot = timeSlots[slotIndex];

      const status = bookingStatuses[i % bookingStatuses.length];

      await prisma.booking.create({
        data: {
          user_id: user.id,
          slot_id: slot.id,
          booking_status: status,
          booking_timestamp: new Date()
        }
      });

      bookingsCreated++;
    }
  }

  // ✅ Add fixed test booking for socket test
  const testUser = users.find((u) => u.id === 'u1');
  const testSlot = timeSlots.find((s) => s.id === 'slot-123');

  if (testUser && testSlot) {
    await prisma.booking.upsert({
      where: { id: 'booking-123' },
      update: {},
      create: {
        id: 'booking-123',
        user_id: testUser.id,
        slot_id: testSlot.id,
        booking_status: BookingStatus.CONFIRMED,
        booking_timestamp: new Date()
      }
    });
    console.log('🧪 Test booking "booking-123" created for socket test');
  } else {
    console.warn('⚠️ Could not create test booking: user u1 or slot-123 missing');
  }

  console.log(`✅ Bookings seeded (${bookingsCreated} + 1 test booking)`);
}
