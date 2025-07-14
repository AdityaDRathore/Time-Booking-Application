import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLabTimeSlots,
  createTimeSlot,
  createBulkTimeSlots,
  updateTimeSlot,
  deleteTimeSlot,
} from '../../api/admin/timeSlots';
import { TimeSlot } from '../../types/timeSlot';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';

const singleSlotSchema = z.object({
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

const bulkSlotSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  days: z.array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])).nonempty(),
});

const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  const datePart = date.toLocaleDateString();
  const timePart = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${datePart}, ${timePart}`;
};

export default function AdminLabTimeSlotsPage() {
  const { labId } = useParams<{ labId: string }>();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<'view' | 'add-single' | 'bulk' | 'edit'>('view');
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);

  const { data: timeSlots = [], isLoading } = useQuery({
    queryKey: ['admin', 'lab-time-slots', labId],
    queryFn: () => getLabTimeSlots(labId!),
    enabled: !!labId,
  });

  function toISOString(dateStr: string, timeStr: string): string {
    return new Date(`${dateStr}T${timeStr}:00`).toISOString();
  }

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      createTimeSlot({
        labId: labId!,
        date: data.date,
        startTime: toISOString(data.date, data.startTime),
        endTime: toISOString(data.date, data.endTime),
      }),
    onSuccess: () => {
      toast.success('Time slot added');
      queryClient.invalidateQueries(['admin', 'lab-time-slots', labId]);
      resetSingle();
      setMode('view');
    },
  });

  const bulkMutation = useMutation({
    mutationFn: (slots: any[]) => createBulkTimeSlots(labId!, slots),
    onSuccess: () => {
      toast.success('Bulk time slots added');
      queryClient.invalidateQueries(['admin', 'lab-time-slots', labId]);
      resetBulk();
      setMode('view');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateTimeSlot(editingSlot!.id, data),
    onSuccess: () => {
      toast.success('Slot updated');
      queryClient.invalidateQueries(['admin', 'lab-time-slots', labId]);
      setEditingSlot(null);
      setMode('view');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTimeSlot,
    onSuccess: () => {
      toast.success('Time slot deleted successfully');
      queryClient.invalidateQueries(['admin', 'lab-time-slots', labId]);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete time slot');
    },
  });

  const {
    register: regSingle,
    handleSubmit: submitSingle,
    reset: resetSingle,
    formState: { errors: errSingle },
  } = useForm({
    resolver: zodResolver(singleSlotSchema),
  });

  const {
    register: regBulk,
    handleSubmit: submitBulk,
    reset: resetBulk,
    formState: { errors: errBulk },
  } = useForm({
    resolver: zodResolver(bulkSlotSchema),
  });

  const onSubmitSingle = (data: any) => {
    if (mode === 'edit' && editingSlot) {
      updateMutation.mutate({
        start_time: toISOString(data.date, data.startTime),
        end_time: toISOString(data.date, data.endTime),
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const onSubmitBulk = (data: any) => {
    const { startDate, endDate, startTime, endTime, days } = data;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const result: { date: string; start_time: string; end_time: string }[] = [];

    const daysMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      const dayName = Object.entries(daysMap).find(([, val]) => val === day)?.[0];
      if (dayName && days.includes(dayName)) {
        const dateStr = d.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          start_time: toISOString(dateStr, startTime),
          end_time: toISOString(dateStr, endTime),
        });
      }
    }
    bulkMutation.mutate(result);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold">Time Slots for Lab</h2>

      <div className="flex gap-4">
        <button onClick={() => setMode('add-single')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add Slot
        </button>
        <button onClick={() => setMode('bulk')} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          + Add Bulk Slots
        </button>
        <button onClick={() => { setMode('view'); resetSingle(); resetBulk(); setEditingSlot(null); }} className="bg-gray-300 px-4 py-2 rounded">
          Cancel
        </button>
      </div>

      {(mode === 'add-single' || mode === 'edit') && (
        <form onSubmit={submitSingle(onSubmitSingle)} className="space-y-4 border p-6 rounded bg-white shadow-md max-w-md">
          <h3 className="font-semibold text-xl mb-2">{mode === 'edit' ? 'Edit Time Slot' : 'Add Time Slot'}</h3>

          <div>
            <label className="block mb-1 font-medium">Date</label>
            <input type="date" {...regSingle('date')} className="w-full border px-3 py-2 rounded" />
            {errSingle.date && <p className="text-red-600 text-sm">{errSingle.date.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Start Time</label>
              <input type="time" {...regSingle('startTime')} className="w-full border px-3 py-2 rounded" step="60" />
            </div>
            <div>
              <label className="block mb-1 font-medium">End Time</label>
              <input type="time" {...regSingle('endTime')} className="w-full border px-3 py-2 rounded" step="60" />
            </div>
          </div>

          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full">
            {mode === 'edit' ? 'Update Slot' : 'Create Slot'}
          </button>
        </form>
      )}

      {mode === 'bulk' && (
        <form onSubmit={submitBulk(onSubmitBulk)} className="space-y-4 border p-6 rounded bg-white shadow-md max-w-xl">
          <h3 className="font-semibold text-xl mb-2">Add Bulk Time Slots</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Start Date</label>
              <input type="date" {...regBulk('startDate')} className="w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block mb-1 font-medium">End Date</label>
              <input type="date" {...regBulk('endDate')} className="w-full border px-3 py-2 rounded" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Start Time</label>
              <input type="time" {...regBulk('startTime')} className="w-full border px-3 py-2 rounded" step="60" />
            </div>
            <div>
              <label className="block mb-1 font-medium">End Time</label>
              <input type="time" {...regBulk('endTime')} className="w-full border px-3 py-2 rounded" step="60" />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">Select Days</label>
            <div className="grid grid-cols-4 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <label key={day} className="flex items-center gap-2">
                  <input type="checkbox" value={day} {...regBulk('days')} />
                  {day}
                </label>
              ))}
            </div>
            {errBulk.days && <p className="text-red-600 text-sm">{errBulk.days.message}</p>}
          </div>

          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full">
            Add Bulk Slots
          </button>
        </form>
      )}

      {isLoading ? (
        <p>Loading time slots...</p>
      ) : timeSlots.length === 0 ? (
        <p>No time slots available.</p>
      ) : (
        <table className="min-w-full bg-white border mt-6">
          <thead>
            <tr>
              <th className="border p-2">Date</th>
              <th className="border p-2">Start</th>
              <th className="border p-2">End</th>
              <th className="border p-2">Booked</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot: TimeSlot) => (
              <tr key={slot.id} className={slot.isFullyBooked ? 'bg-red-50' : ''}>
                <td className="border p-2">{formatDateTime(slot.date)}</td>
                <td className="border p-2">{formatDateTime(slot.start_time)}</td>
                <td className="border p-2">{formatDateTime(slot.end_time)}</td>
                <td className="border p-2">
                  {slot.lab?.lab_capacity != null ? (
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${slot.seatsLeft === 0 ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}
                    >
                      {slot.seatsLeft} / {slot.lab.lab_capacity}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => {
                      setEditingSlot(slot);
                      setMode('edit');
                      resetSingle({
                        date: slot.date,
                        startTime: new Date(slot.start_time).toTimeString().slice(0, 5),
                        endTime: new Date(slot.end_time).toTimeString().slice(0, 5),
                      });
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      const confirmDelete = window.confirm('Are you sure you want to delete this time slot?');
                      if (confirmDelete) {
                        deleteMutation.mutate(slot.id);
                      }
                    }}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
