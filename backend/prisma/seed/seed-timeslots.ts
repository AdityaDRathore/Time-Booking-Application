import { PrismaClient } from '@prisma/client';
import { addDays, setHours, setMinutes, startOfDay } from 'date-fns';
import { getSeedConfig } from './seed-config';

export async function seedTimeSlots(prisma: PrismaClient) {
  await prisma.timeSlot.deleteMany({});
  console.log('Seeding time slots...');
  const config = getSeedConfig();

  const labs = await prisma.lab.findMany({
    where: { status: 'ACTIVE' },
  });

  if (labs.length === 0) {
    throw new Error('No active labs found. Please seed labs first.');
  }

  const today = new Date();
  const daysToSeed = config.timeSlotsPerLab / 4;
  const timeSlots = [
    { startHour: 9, endHour: 11 },
    { startHour: 11, endHour: 13 },
    { startHour: 14, endHour: 16 },
    { startHour: 16, endHour: 18 },
  ];

  let slotsCreated = 0;

  for (const lab of labs) {
    for (let i = 1; i <= daysToSeed; i++) {
      const currentDate = addDays(today, i);

      if (
        (currentDate.getDay() === 0 || currentDate.getDay() === 6) &&
        config.timeSlotsPerLab > 4
      ) {
        continue;
      }

      const dateOnly = startOfDay(currentDate);

      console.log(`📅 Seeding ${lab.id} on ${dateOnly.toDateString()}`);

      for (const slot of timeSlots) {
        const startTime = setMinutes(setHours(new Date(dateOnly), slot.startHour), 0);
        const endTime = setMinutes(setHours(new Date(dateOnly), slot.endHour), 0);

        await prisma.timeSlot.create({
          data: {
            lab_id: lab.id,
            start_time: startTime,
            end_time: endTime,
            date: dateOnly,
            status: 'AVAILABLE',
          },
        });

        slotsCreated++;
      }
    }

    // ✅ Force seed July 10
    const july10 = startOfDay(new Date('2025-07-10'));
    for (const slot of timeSlots) {
      const startTime = setMinutes(setHours(new Date(july10), slot.startHour), 0);
      const endTime = setMinutes(setHours(new Date(july10), slot.endHour), 0);

      await prisma.timeSlot.create({
        data: {
          lab_id: lab.id,
          start_time: startTime,
          end_time: endTime,
          date: july10,
          status: 'AVAILABLE',
        },
      });

      console.log(`✅ Forced slot added for ${july10.toDateString()} for lab ${lab.id}`);
      slotsCreated++;
    }
  }

  // 🧪 Test slot
  const testLab = labs[0];
  const now = new Date();
  const testDate = startOfDay(now);
  const testStart = setMinutes(setHours(new Date(testDate), 10), 0);
  const testEnd = setMinutes(setHours(new Date(testDate), 12), 0);

  await prisma.timeSlot.upsert({
    where: { id: 'slot-123' },
    update: {},
    create: {
      id: 'slot-123',
      lab_id: testLab.id,
      start_time: testStart,
      end_time: testEnd,
      date: testDate,
      status: 'AVAILABLE',
    },
  });

  console.log(`🧪 Test slot 'slot-123' created`);
  console.log(`✅ Time slots seeded: ${slotsCreated} + 1 test slot`);
}
