import { PrismaClient, UserRole } from '@prisma/client';

/**
 * Seeds the Admin table by creating Admin entries that link
 * users with ADMIN role to organizations
 */
export async function seedAdminOrgLinks(prisma: PrismaClient) {
  console.log('Creating Admin-Organization links...');

  // Get admin users
  const adminUsers = await prisma.user.findMany({
    where: { user_role: UserRole.ADMIN }
  });

  if (adminUsers.length === 0) {
    console.warn('No admin users found. Skipping Admin-Organization linking.');
    return;
  }

  // Get organizations
  const organizations = await prisma.organization.findMany();

  if (organizations.length === 0) {
    throw new Error('No organizations found. Please seed organizations first.');
  }

  console.log(`Found ${adminUsers.length} admin users and ${organizations.length} organizations`);

  // Create a mapping between admin users and organizations
  // This maps each admin to an organization in round-robin fashion
  const adminOrgPairs = adminUsers.map((admin, index) => {
    return {
      admin,
      organization: organizations[index % organizations.length]
    };
  });

  let createdCount = 0;
  let skippedCount = 0;

  // Create Admin entries for each admin user linked to an organization
  for (const { admin, organization } of adminOrgPairs) {
    // Check if this admin already exists in the Admin table
    const existingAdmin = await prisma.admin.findUnique({
      where: { admin_email: admin.user_email }
    });

    if (existingAdmin) {
      console.log(`Admin with email ${admin.user_email} already exists. Skipping.`);
      skippedCount++;
      continue;
    }

    try {
      await prisma.admin.create({
        data: {
          admin_name: admin.user_name,
          admin_email: admin.user_email,
          admin_password: admin.user_password, // Password already hashed in seed-users.ts
          organizationId: organization.id
        }
      });
      createdCount++;
    } catch (error) {
      console.error(`Failed to create Admin entry for ${admin.user_name}:`, error);
    }
  }

  console.log(`Admin-Organization links created: ${createdCount}, skipped: ${skippedCount}`);
}