import { prisma } from '../../repository/base/transaction';
import { BaseRepository } from '../../repository/base/BaseRepository';
import { Prisma, TimeSlot } from '@prisma/client';

// ✅ Ensure keys match Prisma schema
type CreateSlotDTO = Pick<TimeSlot, 'lab_id' | 'start_time' | 'end_time'>;
type UpdateSlotDTO = Partial<CreateSlotDTO>;

export class TimeSlotService {
  private timeslotRepository: BaseRepository<TimeSlot, CreateSlotDTO, UpdateSlotDTO>;

  constructor() {
    this.timeslotRepository = new BaseRepository(prisma.timeSlot);
  }

  async getAllTimeSlots() {
    return this.timeslotRepository.findAll();
  }

  async getTimeSlotById(id: string) {
    return this.timeslotRepository.findById(id);
  }

  async createTimeSlot(data: CreateSlotDTO) {
    return this.timeslotRepository.create(data);
  }

  async updateTimeSlot(id: string, data: UpdateSlotDTO) {
    return this.timeslotRepository.update(id, data);
  }

  async deleteTimeSlot(id: string) {
    return this.timeslotRepository.delete(id);
  }

  // ✅ Fix: correct snake_case field names and type
  async isAvailable(lab_id: string, start: Date, end: Date) {
    const conflicts = await prisma.timeSlot.findMany({
      where: {
        lab_id,
        OR: [
          {
            start_time: { lte: start },
            end_time: { gte: start },
          },
          {
            start_time: { lte: end },
            end_time: { gte: end },
          },
        ],
      },
    });
    return conflicts.length === 0;
  }
}
