import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { getSeedConfig } from './seed-config';

const userData = [
  {
    user_name: "Rahul Sharma",
    user_email: "rahul.sharma@example.com",
    user_password: "Password123!",
    user_role: UserRole.USER
  },
  {
    user_name: "Priya Patel",
    user_email: "priya.patel@example.com",
    user_password: "Password123!",
    user_role: UserRole.USER
  },
  {
    user_name: "Amit Kumar",
    user_email: "amit.kumar@example.com",
    user_password: "Password123!",
    user_role: UserRole.USER
  },
  {
    user_name: "Neha Singh",
    user_email: "neha.singh@example.com",
    user_password: "Password123!",
    user_role: UserRole.USER
  },
  {
    user_name: "Vijay Verma",
    user_email: "vijay.verma@example.com",
    user_password: "Password123!",
    user_role: UserRole.USER
  }
];

// Admin account data
const adminData = [
  {
    user_name: "Rajesh Khanna",
    user_email: "rajesh.admin@example.com",
    user_password: "AdminPass123!",
    user_role: UserRole.ADMIN
  },
  {
    user_name: "Sunita Desai",
    user_email: "sunita.admin@example.com",
    user_password: "AdminPass123!",
    user_role: UserRole.ADMIN
  },
  {
    user_name: "Mohan Reddy",
    user_email: "mohan.admin@example.com",
    user_password: "AdminPass123!",
    user_role: UserRole.ADMIN
  }
];

// SuperAdmin account
const superAdminData = [
  {
    user_name: "Anil Kapoor",
    user_email: "superadmin@mpgovt.in",
    user_password: "SuperAdmin123!",
    user_role: UserRole.SUPER_ADMIN,
    validation_key: "MPGovtAdmin2025"
  }
];

export async function seedUsers(prisma: PrismaClient) {
  console.log('Seeding users...');
  const config = getSeedConfig();
  const saltRounds = 10;

  const usersToCreate = Math.min(userData.length, config.users.regular);
  for (let i = 0; i < usersToCreate; i++) {
    const user = userData[i];
    const hashedPassword = await bcrypt.hash(user.user_password, saltRounds);
    await prisma.user.upsert({
      where: { user_email: user.user_email },
      update: {},
      create: {
        user_name: user.user_name,
        user_email: user.user_email,
        user_password: hashedPassword,
        user_role: user.user_role
      }
    });
  }

  const adminsToCreate = Math.min(adminData.length, config.users.admins);
  for (let i = 0; i < adminsToCreate; i++) {
    const admin = adminData[i];
    const hashedPassword = await bcrypt.hash(admin.user_password, saltRounds);
    await prisma.user.upsert({
      where: { user_email: admin.user_email },
      update: {},
      create: {
        user_name: admin.user_name,
        user_email: admin.user_email,
        user_password: hashedPassword,
        user_role: admin.user_role
      }
    });
  }

  for (const superAdmin of superAdminData) {
    const hashedPassword = await bcrypt.hash(superAdmin.user_password, saltRounds);
    await prisma.user.upsert({
      where: { user_email: superAdmin.user_email },
      update: {},
      create: {
        user_name: superAdmin.user_name,
        user_email: superAdmin.user_email,
        user_password: hashedPassword,
        user_role: superAdmin.user_role,
        validation_key: superAdmin.validation_key
      }
    });
  }

  // ✅ Add this for socket test
  await prisma.user.upsert({
    where: { user_email: 'test@example.com' }, // ✅ using unique field
    update: {},
    create: {
      id: 'test-user-id', // ✅ manually set ID (optional, since Prisma will autogen otherwise)
      user_name: 'Test User',
      user_email: 'test@example.com',
      user_password: await bcrypt.hash('testpassword', saltRounds),
      user_role: UserRole.USER
    }
  });


  console.log(`✅ Test user 'test-user-id' seeded for socket testing.`);
  console.log(`Users seeded successfully (${usersToCreate} regular, ${adminsToCreate} admins, 1 super admin)`);
}
