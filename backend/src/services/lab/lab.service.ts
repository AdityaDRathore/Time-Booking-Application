// src/services/Lab/lab.service.ts

import { Prisma, PrismaClient, Lab } from '@prisma/client';
import { BaseRepository } from '@/repository/base/BaseRepository';
import { prisma } from '@/repository/base/transaction';

type CreateLabDTO = Pick<Lab, 'lab_name' | 'location' | 'lab_capacity'>;
type UpdateLabDTO = Partial<CreateLabDTO>;

export class LabService {
  private labRepository: BaseRepository<Lab, CreateLabDTO, UpdateLabDTO>;

  constructor() {
    this.labRepository = new BaseRepository(prisma.lab); // Inject specific Prisma model
  }

  async getAllLabs() {
    return this.labRepository.findAll();
  }

  async getLabById(id: number) {
    return this.labRepository.findById(id);
  }

  async createLab(data: CreateLabDTO) {
    return this.labRepository.create(data);
  }

  async updateLab(id: number, data: UpdateLabDTO) {
    return this.labRepository.update(id, data);
  }

  async deleteLab(id: string) {
    return this.labRepository.delete(id);
  }


  async checkLabCapacity(labId: number, required: number) {
    const lab = await this.getLabById(labId);
    return lab && lab.lab_capacity >= required;
  }
}
