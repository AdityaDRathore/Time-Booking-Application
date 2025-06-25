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

// Zod schemas
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

  const createMutation = useMutation({
    mutationFn: (data: any) => createTimeSlot({ labId: labId!, ...data }),
    onSuccess: () => {
      toast.success('Time slot added');
      queryClient.invalidateQueries(['admin', 'lab-time-slots', labId]);
      resetSingle();
      setMode('view');
    },
  });

  const bulkMutation = useMutation({
    mutationFn: (data: any) => createBulkTimeSlots({ labId: labId!, ...data }),
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
      toast.success('Time slot deleted');
      queryClient.invalidateQueries(['admin', 'lab-time-slots', labId]);
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
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const onSubmitBulk = (data: any) => {
    bulkMutation.mutate(data);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Time Slots for Lab</h2>

      <div className="flex gap-4 mb-4">
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

      {mode === 'add-single' || mode === 'edit' ? (
        <form onSubmit={submitSingle(onSubmitSingle)} className="space-y-4 border p-4 rounded bg-gray-50 mb-6">
          <h3 className="font-semibold text-lg">{mode === 'edit' ? 'Edit Slot' : 'Add Slot'}</h3>
          <input {...regSingle('date')} placeholder="Date (YYYY-MM-DD)" className="input" />
          {errSingle.date && <p className="text-red-600">{errSingle.date.message}</p>}
          <input {...regSingle('startTime')} placeholder="Start Time (HH:MM)" className="input" />
          <input {...regSingle('endTime')} placeholder="End Time (HH:MM)" className="input" />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            {mode === 'edit' ? 'Update' : 'Create'}
          </button>
        </form>
      ) : null}

      {mode === 'bulk' && (
        <form onSubmit={submitBulk(onSubmitBulk)} className="space-y-4 border p-4 rounded bg-gray-50 mb-6">
          <h3 className="font-semibold text-lg">Add Bulk Slots</h3>
          <input {...regBulk('startDate')} placeholder="Start Date (YYYY-MM-DD)" className="input" />
          <input {...regBulk('endDate')} placeholder="End Date (YYYY-MM-DD)" className="input" />
          <input {...regBulk('startTime')} placeholder="Start Time (HH:MM)" className="input" />
          <input {...regBulk('endTime')} placeholder="End Time (HH:MM)" className="input" />
          <label>Select Days:</label>
          <div className="grid grid-cols-4 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <label key={day} className="flex items-center gap-2">
                <input type="checkbox" value={day} {...regBulk('days')} />
                {day}
              </label>
            ))}
          </div>
          {errBulk.days && <p className="text-red-600">{errBulk.days.message}</p>}
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            Add Bulk Slots
          </button>
        </form>
      )}

      {isLoading ? (
        <p>Loading time slots...</p>
      ) : timeSlots.length === 0 ? (
        <p>No time slots available.</p>
      ) : (
        <table className="min-w-full bg-white border">
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
              <tr key={slot.id}>
                <td className="border p-2">{slot.date}</td>
                <td className="border p-2">{slot.startTime}</td>
                <td className="border p-2">{slot.endTime}</td>
                <td className="border p-2">{slot.isBooked ? 'Yes' : 'No'}</td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => {
                      setEditingSlot(slot);
                      setMode('edit');
                      resetSingle({
                        date: slot.date,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                      });
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(slot.id)}
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
