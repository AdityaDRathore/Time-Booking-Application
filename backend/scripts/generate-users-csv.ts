// scripts/generate-users-csv.ts
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

const users = [
  { id: 'u1', role: 'USER' },
  { id: 'u2', role: 'USER' },
];

async function main() {
  const slot = await prisma.timeSlot.findFirst();
  if (!slot) {
    throw new Error('❌ No time slots found in DB. Please seed time slots first.');
  }

  console.log(`🎯 Using slotId: ${slot.id}`);

  const lines = ['userId,token,slotId']; // CSV header

  users.forEach((user) => {
    const token = jwt.sign(
      { userId: user.id, userRole: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    lines.push(`${user.id},${token},${slot.id}`);
  });

  const outPath = path.join(__dirname, '..', 'src', 'tests', 'load', 'users.csv');
  fs.mkdirSync(path.dirname(outPath), { recursive: true }); // ✅ Ensure folder exists
  fs.writeFileSync(outPath, lines.join('\n'));

  console.log(`✅ users.csv generated at ${outPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
