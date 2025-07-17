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
import { Clock, Plus, Calendar, Edit3, Trash2, Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  days: z.array(z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])).nonempty(),
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
    mutationFn: (data: {
      start_date: string;
      end_date: string;
      start_time: string;
      end_time: string;
      days: string[];
    }) => createBulkTimeSlots(labId!, data),
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
    const { date, startTime, endTime } = data;

    if (!date || !startTime || !endTime) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const startIso = toISOString(date, startTime);
      const endIso = toISOString(date, endTime);

      if (mode === 'edit' && editingSlot) {
        updateMutation.mutate({
          start_time: startIso,
          end_time: endIso,
        });
      } else {
        createMutation.mutate({ date, startTime, endTime });
      }
    } catch (err) {
      toast.error('Invalid date/time input');
    }
  };

  const onSubmitBulk = (data: any) => {
    const { startDate, endDate, startTime, endTime, days } = data;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const result: { date: string; start_time: string; end_time: string }[] = [];

    const daysMap: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
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
    bulkMutation.mutate({
      start_date: startDate,
      end_date: endDate,
      start_time: startTime,
      end_time: endTime,
      days,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full mb-4">
            <Clock className="w-5 h-5 text-orange-600 mr-2" />
            <span className="text-orange-800 font-semibold">समय स्लॉट प्रबंधन | Time Slot Management</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            <span className="text-orange-600">समय</span> <span className="text-green-600">स्लॉट</span>
          </h1>
          <p className="text-lg text-gray-600">Manage Lab Time Slots</p>
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 text-gray-700 hover:text-orange-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setMode('add-single')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 hover:from-blue-600 hover:to-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Single Slot
          </button>
          <button
            onClick={() => setMode('bulk')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 hover:from-indigo-600 hover:to-indigo-700"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Add Bulk Slots
          </button>
          {mode !== 'view' && (
            <button
              onClick={() => {
                setMode('view');
                resetSingle();
                resetBulk();
                setEditingSlot(null);
              }}
              className="inline-flex items-center px-6 py-3 bg-gray-300 text-gray-700 rounded-xl shadow-lg hover:shadow-xl transition duration-300 hover:bg-gray-400"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Forms */}
        {(mode === 'add-single' || mode === 'edit') && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-600" />
              {mode === 'edit' ? 'Edit Time Slot' : 'Add Single Time Slot'}
            </h3>
            <form onSubmit={submitSingle(onSubmitSingle)} className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  required {...regSingle('date')}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                />
                {errSingle.date && <p className="text-red-600 text-sm mt-1">{errSingle.date.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    required {...regSingle('startTime')}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                    step="60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    required {...regSingle('endTime')}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                    step="60"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 font-medium"
              >
                {mode === 'edit' ? 'Update Slot' : 'Create Slot'}
              </button>
            </form>
          </div>
        )}

        {mode === 'bulk' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-orange-600" />
              Add Bulk Time Slots
            </h3>
            <form onSubmit={submitBulk(onSubmitBulk)} className="space-y-6 max-w-xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    {...regBulk('startDate')}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    {...regBulk('endDate')}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    {...regBulk('startTime')}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                    step="60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    {...regBulk('endTime')}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                    step="60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Days</label>
                <div className="grid grid-cols-4 gap-3">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <label key={day} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        value={day}
                        {...regBulk('days')}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
                {errBulk.days && <p className="text-red-600 text-sm mt-1">{errBulk.days.message}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 font-medium"
              >
                Add Bulk Slots
              </button>
            </form>
          </div>
        )}

        {/* Time Slots Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">समय स्लॉट्स | Time Slots</h2>
              <div className="flex items-center px-3 py-1 bg-gray-100 rounded-full">
                <Clock className="w-4 h-4 text-gray-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">{timeSlots.length} Slots</span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">समय स्लॉट्स लोड हो रहे हैं | Loading time slots...</p>
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg font-semibold">कोई समय स्लॉट नहीं मिला | No time slots found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seats Left</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeSlots.map((slot: TimeSlot) => (
                    <tr key={slot.id} className={`hover:bg-gray-50 ${slot.isFullyBooked ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(slot.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(slot.start_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(slot.end_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {slot.lab?.lab_capacity != null ? (
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${slot.seatsLeft === 0
                              ? 'bg-red-100 text-red-800'
                              : slot.seatsLeft <= 2
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                              }`}
                          >
                            <Users className="w-3 h-3 mr-1" />
                            {slot.seatsLeft} / {slot.lab.lab_capacity}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
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
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition duration-200"
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            const confirmDelete = window.confirm('Are you sure you want to delete this time slot?');
                            if (confirmDelete) {
                              deleteMutation.mutate(slot.id);
                            }
                          }}
                          className="inline-flex items-center text-red-600 hover:text-red-800 transition duration-200"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}