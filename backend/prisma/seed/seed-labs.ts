import { PrismaClient, LabStatus } from '@prisma/client';
import { getSeedConfig } from './seed-config';

const labData = [
  {
    lab_name: "Programming Lab Alpha",
    lab_capacity: 25,
    status: LabStatus.ACTIVE,
    location: "Block A, 2nd Floor",
    description: "Advanced programming lab with high-end systems",
    organizationName: "Bhopal Technical Institute",
    adminEmail: "rajesh.admin@example.com"
  },
  {
    lab_name: "Web Development Lab",
    lab_capacity: 20,
    status: LabStatus.ACTIVE,
    location: "Block B, 1st Floor",
    description: "Specialized for web and mobile development",
    organizationName: "Bhopal Technical Institute",
    adminEmail: "rajesh.admin@example.com"
  },
  {
    lab_name: "Data Science Lab",
    lab_capacity: 15,
    status: LabStatus.ACTIVE,
    location: "Building 3, Room 105",
    description: "Equipped with data analysis and machine learning tools",
    organizationName: "Indore Engineering College",
    adminEmail: "sunita.admin@example.com"
  },
  {
    lab_name: "IoT Lab",
    lab_capacity: 18,
    status: LabStatus.MAINTENANCE,
    location: "Block C, Ground Floor",
    description: "Lab for Internet of Things projects and experiments",
    organizationName: "Gwalior Technical University",
    adminEmail: "mohan.admin@example.com"
  },
  {
    lab_name: "Cybersecurity Lab",
    lab_capacity: 12,
    status: LabStatus.ACTIVE,
    location: "Secure Wing, 3rd Floor",
    description: "High-security lab for cybersecurity training",
    organizationName: "Indore Engineering College",
    adminEmail: "sunita.admin@example.com"
  }
];

export async function seedLabs(prisma: PrismaClient) {
  console.log('Seeding labs...');
  const config = getSeedConfig();

  // Get organizations
  const organizations = await prisma.organization.findMany({
    take: config.organizations
  });

  if (organizations.length === 0) {
    throw new Error('No organizations found. Please seed organizations first.');
  }

  // Get admins
  const admins = await prisma.admin.findMany();

  if (admins.length === 0) {
    throw new Error('No admins found. Please seed admins first.');
  }

  let labsCreated = 0;

  // For each organization, create the configured number of labs
  for (const org of organizations) {
    // Find an admin for this organization
    const orgAdmins = admins.filter(admin => admin.organizationId === org.id);

    if (orgAdmins.length === 0) {
      console.warn(`No admins found for organization ${org.org_name}, skipping labs`);
      continue;
    }

    // Create labs for this organization
    for (let i = 0; i < config.labsPerOrg && i < labData.length; i++) {
      const labTemplate = labData[i % labData.length]; // Cycle through available templates
      const labName = `${labTemplate.lab_name} - ${org.org_name}`;

      // Check if lab already exists
      const existingLab = await prisma.lab.findFirst({
        where: { lab_name: labName }
      });

      // Select an admin for this lab (round-robin through available org admins)
      const admin = orgAdmins[i % orgAdmins.length];

      if (existingLab) {
        // Update existing lab
        await prisma.lab.update({
          where: { id: existingLab.id },
          data: {
            lab_capacity: labTemplate.lab_capacity,
            status: labTemplate.status,
            location: labTemplate.location,
            description: labTemplate.description,
            organizationId: org.id,
            adminId: admin.id
          }
        });
      } else {
        // Create new lab
        await prisma.lab.create({
          data: {
            lab_name: labName,
            lab_capacity: labTemplate.lab_capacity,
            status: labTemplate.status,
            location: labTemplate.location,
            description: labTemplate.description,
            organizationId: org.id,
            adminId: admin.id
          }
        });
        labsCreated++;
      }
    }
  }

  console.log(`Labs seeded successfully (${labsCreated} labs created)`);
}