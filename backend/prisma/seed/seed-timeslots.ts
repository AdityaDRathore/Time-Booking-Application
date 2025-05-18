import { PrismaClient } from '@prisma/client';
import { addDays, setHours, setMinutes } from 'date-fns';

export async function seedTimeSlots(prisma: PrismaClient) {
  console.log('Seeding time slots...');

  // Get all labs
  const labs = await prisma.lab.findMany({
    where: { status: 'ACTIVE' }
  });

  if (labs.length === 0) {
    throw new Error('No active labs found. Please seed labs first.');
  }

  // Create time slots for the next 14 days
  const today = new Date();

  // Define time slot configurations (start hour, end hour)
  const timeSlots = [
    { startHour: 9, endHour: 11 },
    { startHour: 11, endHour: 13 },
    { startHour: 14, endHour: 16 },
    { startHour: 16, endHour: 18 }
  ];

  for (const lab of labs) {
    for (let i = 1; i <= 14; i++) {
      const currentDate = addDays(today, i);

      // Skip weekends (Saturday and Sunday)
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        continue;
      }

      for (const slot of timeSlots) {
        // Randomly skip some slots to create varied availability (20% chance)
        if (Math.random() < 0.2) {
          continue;
        }

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
      }
    }
  }

  console.log('Time slots seeded successfully');
}