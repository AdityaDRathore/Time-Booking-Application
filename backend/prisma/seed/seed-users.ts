import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { getSeedConfig } from './seed-config';

const userData = [
  {
    id: 'u1',
    user_name: 'User One',
    user_email: 'u1@example.com',
    user_password: 'Password123!',
    user_role: UserRole.USER
  },
  {
    id: 'u2',
    user_name: 'User Two',
    user_email: 'u2@example.com',
    user_password: 'Password123!',
    user_role: UserRole.USER
  },
  {
    user_name: 'Rahul Sharma',
    user_email: 'rahul.sharma@example.com',
    user_password: 'Password123!',
    user_role: UserRole.USER
  },
  {
    user_name: 'Priya Patel',
    user_email: 'priya.patel@example.com',
    user_password: 'Password123!',
    user_role: UserRole.USER
  },
  {
    user_name: 'Amit Kumar',
    user_email: 'amit.kumar@example.com',
    user_password: 'Password123!',
    user_role: UserRole.USER
  }
];

const adminData = [
  {
    user_name: 'Rajesh Khanna',
    user_email: 'rajesh.admin@example.com',
    user_password: 'AdminPass123!',
    user_role: UserRole.ADMIN
  },
  {
    user_name: 'Sunita Desai',
    user_email: 'sunita.admin@example.com',
    user_password: 'AdminPass123!',
    user_role: UserRole.ADMIN
  },
  {
    user_name: 'Mohan Reddy',
    user_email: 'mohan.admin@example.com',
    user_password: 'AdminPass123!',
    user_role: UserRole.ADMIN
  }
];

const superAdminData = [
  {
    user_name: 'Anil Kapoor',
    user_email: 'superadmin@mpgovt.in',
    user_password: 'SuperAdmin123!',
    user_role: UserRole.SUPER_ADMIN,
    validation_key: 'MPGovtAdmin2025'
  }
];

export async function seedUsers(prisma: PrismaClient) {
  console.log('Seeding users...');
  const config = getSeedConfig();
  const saltRounds = 10;

  // ✅ Force seeding u1 and u2 for socket tests
  const mustHaveUsers = userData.filter(u => u.id === 'u1' || u.id === 'u2');
  for (const user of mustHaveUsers) {
    try {
      const hashedPassword = await bcrypt.hash(user.user_password, saltRounds);
      await prisma.user.upsert({
        where: { user_email: user.user_email },
        update: {},
        create: {
          id: user.id,
          user_name: user.user_name,
          user_email: user.user_email,
          user_password: hashedPassword,
          user_role: user.user_role,
        },
      });
    } catch (err) {
      console.error(`❌ Failed to force seed user ${user.user_email}`, err);
    }
  }

  // 🔁 Continue seeding others based on config
  const usersToCreate = Math.min(userData.length, config.users.regular);
  for (let i = 0; i < usersToCreate; i++) {
    const user = userData[i];
    // Skip u1 and u2 here to avoid duplication
    if (user.id === 'u1' || user.id === 'u2') continue;

    try {
      const hashedPassword = await bcrypt.hash(user.user_password, saltRounds);
      await prisma.user.upsert({
        where: { user_email: user.user_email },
        update: {},
        create: {
          user_name: user.user_name,
          user_email: user.user_email,
          user_password: hashedPassword,
          user_role: user.user_role,
        },
      });
    } catch (err) {
      console.error(`❌ Failed to seed user ${user.user_email}`, err);
    }
  }

  // Admins
  const adminsToCreate = Math.min(adminData.length, config.users.admins);
  for (let i = 0; i < adminsToCreate; i++) {
    const admin = adminData[i];
    try {
      const hashedPassword = await bcrypt.hash(admin.user_password, saltRounds);
      await prisma.user.upsert({
        where: { user_email: admin.user_email },
        update: {},
        create: {
          user_name: admin.user_name,
          user_email: admin.user_email,
          user_password: hashedPassword,
          user_role: admin.user_role,
        },
      });
    } catch (err) {
      console.error(`❌ Failed to seed admin ${admin.user_email}`, err);
    }
  }

  // Super Admin
  for (const superAdmin of superAdminData) {
    try {
      const hashedPassword = await bcrypt.hash(superAdmin.user_password, saltRounds);
      await prisma.user.upsert({
        where: { user_email: superAdmin.user_email },
        update: {},
        create: {
          user_name: superAdmin.user_name,
          user_email: superAdmin.user_email,
          user_password: hashedPassword,
          user_role: superAdmin.user_role,
          validation_key: superAdmin.validation_key,
        },
      });
    } catch (err) {
      console.error(`❌ Failed to seed super admin ${superAdmin.user_email}`, err);
    }
  }

  // Test fallback user
  try {
    await prisma.user.upsert({
      where: { user_email: 'test@example.com' },
      update: {},
      create: {
        id: 'test-user-id',
        user_name: 'Test User',
        user_email: 'test@example.com',
        user_password: await bcrypt.hash('testpassword', saltRounds),
        user_role: UserRole.USER,
      },
    });
  } catch (err) {
    console.error(`❌ Failed to seed test socket user`, err);
  }

  console.log(
    `✅ Users seeded: ${usersToCreate} regular (plus u1, u2), ${adminsToCreate} admins, 1 super admin, 1 test socket user`
  );
}
