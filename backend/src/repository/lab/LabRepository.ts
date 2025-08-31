import { Prisma, PrismaClient, Lab, LabStatus } from '@prisma/client';


export type CreateLabDTO = Pick<Lab, 'lab_name' | 'lab_capacity' | 'organizationId' | 'adminId'> & {
  status?: LabStatus;
  location?: string;
  description?: string;
};

export type UpdateLabDTO = Partial<CreateLabDTO>;

export class LabRepository {
  constructor(private prisma: PrismaClient) { }

  // Get all labs
  async getAllLabs(): Promise<Lab[]> {
    return this.prisma.lab.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get lab by ID
  async getLabById(id: string): Promise<Lab | null> {
    return this.prisma.lab.findUnique({
      where: { id },
    });
  }

  // Get labs by organization
  async getLabsByOrganization(orgId: string): Promise<Lab[]> {
    return this.prisma.lab.findMany({
      where: { organizationId: orgId },
      orderBy: { lab_name: 'asc' },
    });
  }

  // Create a new lab
  async createLab(data: CreateLabDTO): Promise<Lab> {
    return this.prisma.lab.create({
      data,
    });
  }

  // Update a lab
  async updateLab(id: string, data: UpdateLabDTO): Promise<Lab> {
    return this.prisma.lab.update({
      where: { id },
      data,
    });
  }

  // Delete a lab
  async deleteLab(id: string): Promise<Lab> {
    return this.prisma.lab.delete({
      where: { id },
    });
  }
}
