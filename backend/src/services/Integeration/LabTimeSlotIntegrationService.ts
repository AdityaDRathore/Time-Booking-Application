import { LabService } from '../Lab/lab.service';
import { TimeSlotService } from '../TimeSlot/timeslot.service';
import { DatabaseError } from '@/exceptions/DatabaseError';
import { runTransaction } from '@/repository/base/transaction';

export class LabTimeSlotIntegrationService {
  private labService: LabService;
  private timeSlotService: TimeSlotService;

  constructor(labService: LabService, timeSlotService: TimeSlotService) {
    this.labService = labService;
    this.timeSlotService = timeSlotService;
  }

  // Business rule: Only allow timeslot creation if the lab exists and capacity is valid
  async createTimeSlotWithLabCheck(data: {
    labId: number;
    startTime: Date;
    endTime: Date;
  }) {
    const lab = await this.labService.getLabById(data.labId);
    if (!lab) {
      throw new DatabaseError('Lab does not exist', 'LabNotFound');
    }

    if (data.endTime <= data.startTime) {
      throw new DatabaseError('Invalid timeslot duration', 'InvalidTimeSlot');
    }

    return await this.timeSlotService.createTimeSlot({
      lab_id: data.labId.toString(),
      start_time: data.startTime,
      end_time: data.endTime,
    });
  }

  // Another example: Delete lab and its associated timeslots in a transaction
  async deleteLabAndTimeslots(labId: number) {
    return await runTransaction(async (tx) => {
      const labExists = await this.labService.getLabById(labId);
      if (!labExists) {
        throw new DatabaseError('Lab not found', 'LabNotFound');
      }

      await this.timeSlotService.deleteTimeSlot(labId.toString());
      return await this.labService.deleteLab(labId.toString());
    });
  }
}
