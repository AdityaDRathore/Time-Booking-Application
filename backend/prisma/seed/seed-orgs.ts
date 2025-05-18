import { PrismaClient } from '@prisma/client';

const organizationData = [
  {
    org_name: "Bhopal Technical Institute",
    org_type: "Government",
    org_location: "Bhopal, MP"
  },
  {
    org_name: "Indore Engineering College",
    org_type: "Private",
    org_location: "Indore, MP"
  },
  {
    org_name: "Gwalior Technical University",
    org_type: "Semi-Government",
    org_location: "Gwalior, MP"
  }
];

export async function seedOrganizations(prisma: PrismaClient) {
  console.log('Seeding organizations...');

  // Get the super admin to associate with organizations
  const superAdmin = await prisma.user.findFirst({
    where: { user_role: 'SUPER_ADMIN' }
  });

  if (!superAdmin) {
    throw new Error('Super admin not found. Please seed users first.');
  }

  // Seed organizations
  for (const org of organizationData) {
    // Check if organization already exists
    const existingOrg = await prisma.organization.findFirst({
      where: { org_name: org.org_name }
    });

    if (existingOrg) {
      // Update existing organization
      await prisma.organization.update({
        where: { id: existingOrg.id },
        data: {
          org_type: org.org_type,
          org_location: org.org_location,
          superAdminId: superAdmin.id
        }
      });
      console.log(`Updated existing organization: ${org.org_name}`);
    } else {
      // Create new organization
      await prisma.organization.create({
        data: {
          org_name: org.org_name,
          org_type: org.org_type,
          org_location: org.org_location,
          superAdminId: superAdmin.id
        }
      });
      console.log(`Created new organization: ${org.org_name}`);
    }
  }

  console.log('Organizations seeded successfully');
}