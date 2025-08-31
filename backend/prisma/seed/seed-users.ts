import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { getSeedConfig } from './seed-config';

const prisma = new PrismaClient();

const userData = [
  {
    user_name: 'User One',
    user_email: 'u1@example.com',
    user_password: 'Password123!',
    user_role: UserRole.USER,
  },
  {
    user_name: 'User Two',
    user_email: 'u2@example.com',
    user_password: 'Password123!',
    user_role: UserRole.USER,
  },
  {
    user_name: 'Rahul Sharma',
    user_email: 'rahul.sharma@example.com',
    user_password: 'Password123!',
    user_role: UserRole.USER,
  },
  {
    user_name: 'Priya Patel',
    user_email: 'priya.patel@example.com',
    user_password: 'Password123!',
    user_role: UserRole.USER,
  },
  {
    user_name: 'Amit Kumar',
    user_email: 'amit.kumar@example.com',
    user_password: 'Password123!',
    user_role: UserRole.USER,
  },
];

const superAdminData = [
  {
    user_name: 'Anil Kapoor',
    user_email: 'superadmin@mpgovt.in',
    user_password: 'SuperAdmin123!',
    user_role: UserRole.SUPER_ADMIN,
    validation_key: 'MPGovtAdmin2025',
  },
];

const adminsToCreate = [
  {
    user_name: 'Rajesh Khanna',
    user_email: 'rajesh.admin@example.com',
    user_password: 'AdminPass123!',
    orgName: 'Gwalior Technical University',
  },
  {
    user_name: 'Sunita Desai',
    user_email: 'sunita.admin@example.com',
    user_password: 'AdminPass123!',
    orgName: 'Bhopal Technical Institute',
  },
  {
    user_name: 'Mohan Reddy',
    user_email: 'mohan.admin@example.com',
    user_password: 'AdminPass123!',
    orgName: 'Indore Engineering College',
  },
];

export async function seedUsers(
  prisma: PrismaClient,
  options?: { onlySuperAdmin?: boolean; skipSuperAdmin?: boolean }
) {
  console.log('🔁 Seeding users...');
  const config = getSeedConfig();
  const saltRounds = 10;

  // Seed essential users (u1, u2)
  const mustHaveEmails = ['u1@example.com', 'u2@example.com'];
  for (const user of userData.filter((u) => mustHaveEmails.includes(u.user_email))) {
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

  // Other regular users
  const usersToCreate = Math.min(userData.length, config.users.regular);
  for (let i = 0; i < usersToCreate; i++) {
    const user = userData[i];
    if (mustHaveEmails.includes(user.user_email)) continue;

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

  // Super Admins
  if (!options?.skipSuperAdmin) {
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
  }
  if (options?.onlySuperAdmin) {
    console.log('✅ Only seeded super admin as requested');
    return;
  }

  // Admins linked to orgs
  for (const admin of adminsToCreate) {
    try {
      const org = await prisma.organization.findFirst({
        where: { org_name: admin.orgName },
      });

      if (!org) {
        console.warn(`⚠️ Organization not found for admin ${admin.user_email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(admin.user_password, saltRounds);

      const user = await prisma.user.upsert({
        where: { user_email: admin.user_email },
        update: {},
        create: {
          user_name: admin.user_name,
          user_email: admin.user_email,
          user_password: hashedPassword,
          user_role: UserRole.ADMIN,
          organizationId: org.id,
        },
      });

      await prisma.admin.upsert({
        where: { admin_email: admin.user_email },
        update: {},
        create: {
          admin_name: admin.user_name,
          admin_email: admin.user_email,
          admin_password: hashedPassword,
          organizationId: org.id,
          userId: user.id,
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { organizationId: org.id },
      });

      console.log(`✅ Admin ${admin.user_name} linked to ${org.org_name}`);
    } catch (err) {
      console.error(`❌ Failed to seed admin ${admin.user_email}`, err);
    }
  }

  // Test fallback user
  try {
    await prisma.user.upsert({
      where: { user_email: 'test@example.com' },
      update: {},
      create: {
        user_name: 'Test User',
        user_email: 'test@example.com',
        user_password: await bcrypt.hash('testpassword', saltRounds),
        user_role: UserRole.USER,
      },
    });
  } catch (err) {
    console.error(`❌ Failed to seed test user`, err);
  }

  console.log('✅ Seeding complete.');
  console.log(`\n🔐 Test Admin Logins:
- rajesh.admin@example.com / AdminPass123!
- sunita.admin@example.com / AdminPass123!
- mohan.admin@example.com / AdminPass123!`);
}
