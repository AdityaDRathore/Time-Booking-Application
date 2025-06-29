import { PrismaClient } from '@prisma/client';
import { addDays, setHours, setMinutes } from 'date-fns';
import { getSeedConfig } from './seed-config';

export async function seedTimeSlots(prisma: PrismaClient) {
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

      // ⛔ Optional: Skip weekends
      if (
        (currentDate.getDay() === 0 || currentDate.getDay() === 6) &&
        config.timeSlotsPerLab > 4
      ) {
        continue;
      }

      console.log(`📅 Seeding ${lab.id} on ${currentDate.toDateString()}`);

      for (const slot of timeSlots) {
        const startTime = new Date(currentDate);
        setHours(startTime, slot.startHour);
        setMinutes(startTime, 0);

        const endTime = new Date(currentDate);
        setHours(endTime, slot.endHour);
        setMinutes(endTime, 0);

        await prisma.timeSlot.create({
          data: {
            lab_id: lab.id,
            start_time: startTime,
            end_time: endTime,
            date: new Date(currentDate.toDateString()), // strip time
            status: 'AVAILABLE',
          },
        });

        slotsCreated++;
      }
    }

    // ✅ Ensure July 2 is seeded
    const july2 = new Date('2025-07-02');
    for (const slot of timeSlots) {
      const startTime = new Date(july2);
      setHours(startTime, slot.startHour);
      setMinutes(startTime, 0);

      const endTime = new Date(july2);
      setHours(endTime, slot.endHour);
      setMinutes(endTime, 0);

      await prisma.timeSlot.create({
        data: {
          lab_id: lab.id,
          start_time: startTime,
          end_time: endTime,
          date: new Date(july2.toDateString()),
          status: 'AVAILABLE',
        },
      });

      console.log(`✅ Forced slot added for ${july2.toDateString()} for lab ${lab.id}`);
      slotsCreated++;
    }
  }

  // 🧪 Test slot for socket etc.
  const testLab = labs[0];
  const now = new Date();
  const testStart = new Date(now);
  setHours(testStart, 10);
  setMinutes(testStart, 0);

  const testEnd = new Date(now);
  setHours(testEnd, 12);
  setMinutes(testEnd, 0);

  await prisma.timeSlot.upsert({
    where: { id: 'slot-123' },
    update: {},
    create: {
      id: 'slot-123',
      lab_id: testLab.id,
      start_time: testStart,
      end_time: testEnd,
      date: new Date(now.toDateString()),
      status: 'AVAILABLE',
    },
  });

  console.log(`🧪 Test slot 'slot-123' created`);
  console.log(`✅ Time slots seeded: ${slotsCreated} + 1 test slot`);
}
