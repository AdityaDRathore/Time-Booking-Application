// src/services/TimeSlot/timeslot.schema.ts

import { TimeSlot } from "@prisma/client";

export type CreateTimeSlotDTO = Pick<TimeSlot, 'lab_id' | 'date' | 'start_time' | 'end_time' | 'status'>;

export type UpdateTimeSlotDTO = Partial<CreateTimeSlotDTO>;
