// src/pages/LabDetailsPage.tsx

import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getLabById } from '../api/labs';
import { getAvailableTimeSlots } from '../api/timeSlots';
import { createBooking, getUserBookings } from '../api/bookings';
import { joinWaitlist, getWaitlistPosition } from '../api/waitlists';
import { Lab } from '../types/lab';
import { TimeSlot } from '../types/timeSlot';
import { bookingSchema } from '../schemas/bookingSchema';
import { useAuthStore } from '../state/authStore';
import { Booking } from '../types/booking';
import { toast } from 'react-toastify';

const LabDetailsPage = () => {
  const { id: labId } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [modal, setModal] = useState<{ message: string; color: string } | null>(null);

  const showModal = (message: string, color: string) => setModal({ message, color });

  const { data: lab } = useQuery({
    queryKey: ['lab', labId],
    queryFn: () => getLabById(labId!),
    enabled: !!labId,
  });

  const { data: timeSlots } = useQuery({
    queryKey: ['timeSlots', labId, selectedDate],
    queryFn: () => getAvailableTimeSlots(labId!, selectedDate),
    enabled: !!labId && !!selectedDate,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: getUserBookings,
    enabled: !!user,
  }) as { data: Booking[] };

  const filteredSlots = timeSlots?.filter((slot: TimeSlot) => {
    const now = new Date();
    const start = new Date(slot.start_time);
    if (start <= now) return false;
    const hour = start.getHours();
    if (filter === 'morning') return hour >= 6 && hour < 12;
    if (filter === 'afternoon') return hour >= 12 && hour < 17;
    if (filter === 'evening') return hour >= 17 && hour < 22;
    return true;
  });

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeSlots', labId, selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] });
      setIsModalOpen(false);
      showModal('Booking successful!', 'green');
    },
    onError: (error: any) => {
      const code = error?.error?.code || error?.code;
      const message = error?.error?.message || error?.message || 'Booking failed';

      if (code === 'User already has a booking that overlaps with this time slot' || message.includes('overlap')) {
        setIsModalOpen(false);
        showModal('You already have a booking that overlaps with this time slot.', 'red');
      } else {
        toast.error(message);
      }
    },
  });

  const waitlistMutation = useMutation({
    mutationFn: (slot_id: string) => joinWaitlist(slot_id, user?.id!),
    onSuccess: async (_: any, slot_id: string) => {
      try {
        const position = await getWaitlistPosition(slot_id, user?.id!);
        showModal(`Waitlist joined! Your position is #${position}`, 'yellow');
      } catch {
        toast.success('Added to waitlist');
      }
      queryClient.invalidateQueries({ queryKey: ['waitlists', 'me'] });
    },
    onError: (error: any) => {
      const msg = error?.message || error?.error?.message || '';
      if (msg.includes('already') || msg.includes('confirmed')) {
        showModal('You already joined the waitlist or have a booking for this slot.', 'red');
      } else if (msg.includes('Waitlist for this time slot is full')) {
        showModal('Waitlist is full for this slot.', 'red');
      } else {
        toast.error(msg || 'Failed to join waitlist');
      }
    },
  });

  const handleConfirmBooking = () => {
    if (!selectedSlot || !user) return;

    const payload = {
      slot_id: selectedSlot.id,
      purpose: purpose.trim(),
    };

    const result = bookingSchema.safeParse(payload);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    bookingMutation.mutate(payload);
  };

  const handleJoinWaitlist = (slot: TimeSlot) => {
    if (!user) return;
    waitlistMutation.mutate(slot.id);
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">{lab?.lab_name}</h2>
      <p><strong>Capacity:</strong> {lab?.lab_capacity}</p>
      <p><strong>Status:</strong> {lab?.status}</p>
      <p className="mt-4"><strong>Description:</strong> {lab?.description}</p>

      {/* Date & Filter */}
      <div className="mt-6">
        <label className="block font-semibold mb-2">Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border px-3 py-2 rounded w-full max-w-xs"
        />
      </div>

      <div className="mt-4">
        <label className="font-semibold mr-2">Filter by Time:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="border px-2 py-1 rounded"
        >
          <option value="all">All</option>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
        </select>
      </div>

      {/* Time Slots */}
      <div className="mt-6">
        <h3 className="text-2xl font-semibold mb-3">Time Slots</h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filteredSlots?.map((slot: TimeSlot) => (
            <li key={slot.id} className="p-4 border rounded shadow bg-white hover:shadow-md transition">
              <p className="font-semibold text-lg">
                {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                {new Date(slot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-sm text-gray-600">Date: {slot.date}</p>
              <p className="text-sm text-gray-600">
                {slot.seatsLeft && slot.seatsLeft > 0 ? `${slot.seatsLeft} seat(s) left` : 'Fully booked'}
              </p>
              {slot.seatsLeft && slot.seatsLeft > 0 ? (
                <button
                  onClick={() => {
                    setSelectedSlot(slot);
                    setIsModalOpen(true);
                  }}
                  className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Book Now
                </button>
              ) : (
                <button
                  onClick={() => handleJoinWaitlist(slot)}
                  className="w-full mt-3 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Join Waitlist
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Booking Modal */}
      {isModalOpen && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Booking</h2>
            <label className="block font-semibold mb-1">Purpose</label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="border px-3 py-2 rounded w-full mb-4"
              placeholder="e.g. Lab practice, assignment"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-1 border rounded hover:bg-gray-100">Cancel</button>
              <button
                onClick={handleConfirmBooking}
                className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={bookingMutation.isLoading || !purpose.trim()}
              >
                {bookingMutation.isLoading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Central Modal */}
      {modal && (
        <Modal message={modal.message} color={modal.color} onClose={() => setModal(null)} />
      )}
    </div>
  );
};

const Modal = ({ message, color, onClose }: { message: string; color: string; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className={`bg-white p-6 rounded-lg shadow-md w-full max-w-sm text-center border-t-4 border-${color}-500`}>
      <h2 className={`text-xl font-bold text-${color}-600 mb-3`}>{message}</h2>
      <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Close
      </button>
    </div>
  </div>
);

export default LabDetailsPage;
