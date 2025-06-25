import api from '../../services/apiClient';
import { TimeSlot } from '../../types/timeSlot';

interface CreateTimeSlotPayload {
  labId: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface BulkCreatePayload {
  labId: string;
  slots: {
    date: string;
    startTime: string;
    endTime: string;
  }[];
}

export const getLabTimeSlots = async (labId: string): Promise<TimeSlot[]> => {
  const res = await api.get(`/admin/labs/${labId}/time-slots`);
  return res.data;
};

export const createTimeSlot = async (payload: CreateTimeSlotPayload): Promise<TimeSlot> => {
  const res = await api.post('/admin/time-slots', payload);
  return res.data;
};

export const createBulkTimeSlots = async (payload: BulkCreatePayload): Promise<TimeSlot[]> => {
  const res = await api.post('/admin/time-slots/bulk', payload);
  return res.data;
};

export const updateTimeSlot = async (
  id: string,
  payload: Partial<CreateTimeSlotPayload>
): Promise<TimeSlot> => {
  const res = await api.put(`/admin/time-slots/${id}`, payload);
  return res.data;
};

export const deleteTimeSlot = async (id: string): Promise<void> => {
  await api.delete(`/admin/time-slots/${id}`);
};
