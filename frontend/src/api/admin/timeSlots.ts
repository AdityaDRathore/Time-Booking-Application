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

// ✅ GET time slots for a specific lab
export const getLabTimeSlots = async (labId: string): Promise<TimeSlot[]> => {
  const res = await api.get(`/admin/labs/${labId}/time-slots`);
  return res.data.data;
};

// ✅ Create single time slot (nested under lab)
export const createTimeSlot = async (payload: CreateTimeSlotPayload): Promise<TimeSlot> => {
  const res = await api.post(`/admin/labs/${payload.labId}/time-slots`, {
    date: payload.date,
    start_time: payload.startTime,
    end_time: payload.endTime,
  });
  return res.data;
};

// ✅ Bulk create time slots (also under lab)
export const createBulkTimeSlots = async (
  labId: string,
  payload: {
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    days: string[];
  }
): Promise<{ createdCount: number }> => {
  const res = await api.post(`/admin/labs/${labId}/time-slots/bulk`, payload);
  return res.data;
};

// ✅ Update specific time slot
export const updateTimeSlot = async (
  id: string,
  payload: { start_time: string; end_time: string }
): Promise<TimeSlot> => {
  const res = await api.put(`/admin/time-slots/${id}`, payload);
  return res.data;
};

// ✅ Delete time slot
export const deleteTimeSlot = async (id: string): Promise<void> => {
  await api.delete(`/admin/time-slots/${id}`);
};
