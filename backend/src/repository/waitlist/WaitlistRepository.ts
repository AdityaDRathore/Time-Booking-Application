import { Waitlist, WaitlistStatus } from '@prisma/client';
import { BaseRepository } from '../base/BaseRepository';
import { prisma } from '../base/transaction';

type CreateWaitlistDTO = {
  user_id: string;
  slot_id: string;
  waitlist_position: number;
  waitlist_status?: WaitlistStatus;
};

type UpdateWaitlistDTO = Partial<CreateWaitlistDTO>;

export class WaitlistRepository extends BaseRepository<
  Waitlist,
  CreateWaitlistDTO,
  UpdateWaitlistDTO
> {
  constructor() {
    super(prisma.waitlist);
  }

  async findByUserAndSlot(user_id: string, slot_id: string): Promise<Waitlist | null> {
    return this.model.findFirst({
      where: { user_id, slot_id },
    });
  }

  async getActiveWaitlistForSlot(slot_id: string): Promise<Waitlist[]> {
    return this.model.findMany({
      where: {
        slot_id,
        waitlist_status: 'ACTIVE',
      },
      orderBy: {
        waitlist_position: 'asc',
      },
    });
  }

  async getAllForSlot(slot_id: string): Promise<Waitlist[]> {
    return this.model.findMany({
      where: { slot_id },
      orderBy: { waitlist_position: 'asc' },
    });
  }
}
export const waitlistRepository = new WaitlistRepository();