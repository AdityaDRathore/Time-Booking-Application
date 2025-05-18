import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const userData = [
  {
    user_name: "Rahul Sharma",
    user_email: "rahul.sharma@example.com",
    user_password: "Password123!", // Will be hashed
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

  // Hash passwords and create users
  const saltRounds = 10;

  // Seed regular users
  for (const user of userData) {
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

  // Seed admin users
  for (const admin of adminData) {
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

  // Seed super admin
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

  console.log('Users seeded successfully');
}