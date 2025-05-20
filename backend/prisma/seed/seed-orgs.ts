import { PrismaClient } from '@prisma/client';
import { getSeedConfig } from './seed-config';

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
  const config = getSeedConfig();

  // First, find the User with SUPER_ADMIN role
  const superAdminUser = await prisma.user.findFirst({
    where: { user_role: 'SUPER_ADMIN' }
  });

  if (!superAdminUser) {
    throw new Error('Super admin user not found. Please seed users first.');
  }

  console.log(`Found Super Admin user: ${superAdminUser.user_name} (${superAdminUser.user_email})`);

  // Next, find or create a corresponding SuperAdmin record
  let superAdmin = await prisma.superAdmin.findFirst({
    where: { super_admin_email: superAdminUser.user_email }
  });

  if (!superAdmin) {
    console.log('Creating new SuperAdmin record from the User with SUPER_ADMIN role...');
    superAdmin = await prisma.superAdmin.create({
      data: {
        super_admin_name: superAdminUser.user_name,
        super_admin_email: superAdminUser.user_email,
        super_admin_password: superAdminUser.user_password,
        validation_key: superAdminUser.validation_key
      }
    });
  }

  console.log(`Using SuperAdmin ID: ${superAdmin.id} for organizations`);

  // Now seed organizations with the proper SuperAdmin ID
  const orgsToCreate = Math.min(organizationData.length, config.organizations);

  let orgsCreated = 0;

  for (let i = 0; i < orgsToCreate; i++) {
    const org = organizationData[i];

    // Check if organization already exists
    const existingOrg = await prisma.organization.findFirst({
      where: { org_name: org.org_name }
    });

    if (existingOrg) {
      // Update existing organization with SuperAdmin link
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
      // Create new organization with SuperAdmin link
      await prisma.organization.create({
        data: {
          org_name: org.org_name,
          org_type: org.org_type,
          org_location: org.org_location,
          superAdminId: superAdmin.id
        }
      });
      orgsCreated++;
      console.log(`Created new organization: ${org.org_name}`);
    }
  }

  console.log(`Organizations seeded successfully (${orgsCreated} new, ${orgsToCreate - orgsCreated} updated)`);
}