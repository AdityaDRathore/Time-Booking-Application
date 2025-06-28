import { PrismaClient } from '@prisma/client';
import { addDays, setHours, setMinutes } from 'date-fns';
import { getSeedConfig } from './seed-config';

export async function seedTimeSlots(prisma: PrismaClient) {
  console.log('Seeding time slots...');
  const config = getSeedConfig();

  const labs = await prisma.lab.findMany({
    where: { status: 'ACTIVE' }
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
    { startHour: 16, endHour: 18 }
  ];

  let slotsCreated = 0;

  for (const lab of labs) {
    for (let i = 1; i <= daysToSeed; i++) {
      const currentDate = addDays(today, i);

      if ((currentDate.getDay() === 0 || currentDate.getDay() === 6) && config.timeSlotsPerLab > 4) {
        continue;
      }

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
            date: currentDate,
            status: 'AVAILABLE'
          }
        });

        slotsCreated++;
      }
    }
  }

  // ✅ Add a fixed slot with id 'slot-123' for socket testing
  const testLab = labs[0]; // Use first active lab
  const now = new Date();
  const start = new Date(now);
  setHours(start, 10);
  setMinutes(start, 0);

  const end = new Date(now);
  setHours(end, 12);
  setMinutes(end, 0);

  await prisma.timeSlot.upsert({
    where: { id: 'slot-123' },
    update: {},
    create: {
      id: 'slot-123',
      lab_id: testLab.id,
      start_time: start,
      end_time: end,
      date: now,
      status: 'AVAILABLE'
    }
  });

  console.log(`🧪 Test slot 'slot-123' created for socket test`);
  console.log(`✅ Time slots seeded successfully (${slotsCreated} + 1 test slot)`);
}
