// src/services/TimeSlot/timeslot.service.ts

import { prisma } from '../../repository/base/transaction';
import { BaseRepository } from './repository/base/BaseRepository';
import { TimeSlot } from '@prisma/client';
import { CreateTimeSlotDTO, UpdateTimeSlotDTO } from './timeslot.schema';

export class TimeSlotService {
  private timeslotRepo: BaseRepository<TimeSlot, CreateTimeSlotDTO, UpdateTimeSlotDTO>;

  constructor() {
    this.timeslotRepo = new BaseRepository(prisma.timeSlot);
  }

  async getAllSlots() {
    return this.timeslotRepo.findAll();
  }

  async getSlotById(id: string) {
    return this.timeslotRepo.findById(id);
  }

  async createSlot(data: CreateTimeSlotDTO) {
    return this.timeslotRepo.create(data);
  }

  async updateSlot(id: string, data: UpdateTimeSlotDTO) {
    return this.timeslotRepo.update(id, data);
  }

  async deleteSlot(id: string) {
    return this.timeslotRepo.delete(id);
  }

  async getSlotsByLab(labId: string) {
    return prisma.timeSlot.findMany({
      where: { lab_id: labId },
      orderBy: { start_time: 'asc' }
    });
  }
}
