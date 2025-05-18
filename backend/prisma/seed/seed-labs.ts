import { PrismaClient, LabStatus } from '@prisma/client';

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

  // Seed labs
  for (const lab of labData) {
    // Find the organization
    const organization = await prisma.organization.findFirst({
      where: { org_name: lab.organizationName }
    });

    if (!organization) {
      console.log(`Organization ${lab.organizationName} not found, skipping lab ${lab.lab_name}`);
      continue;
    }

    // Find the admin - CORRECTED
    const admin = await prisma.admin.findUnique({
      where: { admin_email: lab.adminEmail }
    });

    if (!admin) {
      console.log(`Admin ${lab.adminEmail} not found, skipping lab ${lab.lab_name}`);
      continue;
    }

    // Check if lab already exists
    const existingLab = await prisma.lab.findFirst({
      where: { lab_name: lab.lab_name }
    });

    if (existingLab) {
      // Update existing lab
      await prisma.lab.update({
        where: { id: existingLab.id },
        data: {
          lab_capacity: lab.lab_capacity,
          status: lab.status,
          location: lab.location,
          description: lab.description,
          organizationId: organization.id,
          adminId: admin.id
        }
      });
      console.log(`Updated existing lab: ${lab.lab_name}`);
    } else {
      // Create new lab
      await prisma.lab.create({
        data: {
          lab_name: lab.lab_name,
          lab_capacity: lab.lab_capacity,
          status: lab.status,
          location: lab.location,
          description: lab.description,
          organizationId: organization.id,
          adminId: admin.id
        }
      });
      console.log(`Created new lab: ${lab.lab_name}`);
    }
  }

  console.log('Labs seeded successfully');
}