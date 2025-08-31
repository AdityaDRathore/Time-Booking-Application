import { Prisma, PrismaClient, Lab } from '@prisma/client';
import { BaseRepository } from '@src/repository/base/BaseRepository';
import { prisma } from '@src/repository/base/transaction';

type CreateLabDTO = Pick<Lab, 'lab_name' | 'location' | 'lab_capacity'>;
type UpdateLabDTO = Partial<CreateLabDTO> & { isOccupied?: boolean };

export class LabService {
  private labRepository: BaseRepository<Lab, CreateLabDTO, UpdateLabDTO>;

  constructor() {
    this.labRepository = new BaseRepository(prisma.lab);
  }

  async getAllLabs(): Promise<Lab[]> {
    return this.labRepository.findAll();
  }

  async getLabById(id: string): Promise<Lab | null> {
    return this.labRepository.findById(id);
  }

  async createLab(data: CreateLabDTO): Promise<Lab> {
    return this.labRepository.create(data);
  }

  async updateLab(id: string, data: UpdateLabDTO): Promise<Lab> {
    return this.labRepository.update(id, data);
  }

  async deleteLab(id: string): Promise<Lab> {
    return this.labRepository.delete(id);
  }

  async checkLabCapacity(labId: string, required: number): Promise<boolean> {
    const lab = await this.getLabById(labId);
    return !!lab && lab.lab_capacity >= required;
  }

  /**
   * ✅ Real-time status update for lab occupancy.
   * @param labId ID of the lab to update
   * @param isOccupied true if lab is occupied
   */
  async updateLabStatus(labId: string, isOccupied: boolean): Promise<Lab> {
    return prisma.lab.update({
      where: { id: labId },
      data: { isOccupied },
    });
  }
}
