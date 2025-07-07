import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { useState, useMemo, useEffect } from 'react';
import { getLabById } from '../api/labs';
import { getAvailableTimeSlots } from '../api/timeSlots';
import { createBooking, getUserBookings } from '../api/bookings';
import { getUserWaitlists, joinWaitlist, getWaitlistPosition } from '../api/waitlists';
import { Lab } from '../types/lab';
import { TimeSlot } from '../types/timeSlot';
import { toast } from 'react-toastify';
import { bookingSchema } from '../schemas/bookingSchema';
import { useAuthStore } from '../state/authStore';
import { isSameWeek } from '../utils/dateUtils';
import { Booking } from '../types/booking';
import { Waitlist } from '../types/waitlist';

const LabDetailsPage = () => {
  const { id: labId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { data: lab, isLoading: isLabLoading, error: labError } = useQuery({
    queryKey: ['lab', labId],
    queryFn: () => {
      if (!labId) throw new Error('No lab ID');
      return getLabById(labId);
    },
    enabled: !!labId,
  });

  const { data: timeSlots, isLoading: isSlotsLoading, error: slotsError } = useQuery({
    queryKey: ['timeSlots', labId, selectedDate],
    queryFn: () => getAvailableTimeSlots(labId!, selectedDate),
    enabled: !!labId && !!selectedDate,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: getUserBookings,
    enabled: !!user,
  }) as { data: Booking[] | undefined };

  const { data: userWaitlists = [] } = useQuery({
    queryKey: ['waitlists', 'me'],
    queryFn: getUserWaitlists,
    enabled: !!user,
  });

  const waitlistedSlotIds = useMemo(() => userWaitlists.map((w: Waitlist) => w.slotId), [userWaitlists]);

  const waitlistQueries = useQueries({
    queries: (timeSlots ?? []).map((slot: { id: string }) => ({
      queryKey: ['waitlistPosition', slot.id],
      queryFn: () => getWaitlistPosition(slot.id, user?.id),
      enabled: !!user && waitlistedSlotIds.includes(slot.id),
    })),
  });

  const waitlistPositionMap = useMemo(() => {
    const map: Record<string, number> = {};
    waitlistQueries.forEach((q: { data: number | undefined }, i: number) => {
      const slotId = timeSlots?.[i]?.id;
      if (q.data !== undefined && slotId) {
        map[slotId] = q.data;
      }
    });
    return map;
  }, [waitlistQueries, timeSlots]);

  const isPositionLoading = waitlistQueries.some((q: { isLoading: any }) => q.isLoading);

  const filteredSlots = timeSlots?.filter((slot: TimeSlot) => {
    if (!slot?.startTime) return false;
    const hour = new Date(slot.startTime).getHours();
    if (filter === 'morning') return hour >= 6 && hour < 12;
    if (filter === 'afternoon') return hour >= 12 && hour < 17;
    if (filter === 'evening') return hour >= 17 && hour < 22;
    return true;
  });

  const openModal = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedSlot(null);
    setPurpose('');
    setIsModalOpen(false);
  };

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeSlots', labId, selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] });
      closeModal();
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Booking failed');
    },
  });

  const joinWaitlistMutation = useMutation({
    mutationFn: joinWaitlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlists', 'me'] });
      toast.success('Joined waitlist!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to join waitlist');
    },
  });

  const handleConfirmBooking = () => {
    if (!selectedSlot || !user) return;

    const userBookingsThisWeek = bookings.filter((b) => isSameWeek(b.date, selectedSlot.date)).length;
    const isSlotAlreadyBookedByUser = bookings.some(
      (b) => b.date === selectedSlot.date && b.startTime === selectedSlot.startTime
    );

    const result = bookingSchema.safeParse({
      userId: user.id,
      slotId: selectedSlot.id,
      userBookingsThisWeek,
      isSlotAlreadyBookedByUser,
    });

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    if (!purpose.trim()) {
      toast.error('Purpose is required');
      return;
    }

    bookingMutation.mutate({
      timeSlotId: selectedSlot.id,
      purpose: purpose.trim(),
    });
  };

  if (isLabLoading) return <p className="p-6">Loading lab details...</p>;
  if (labError) return <p className="p-6 text-red-600">Error: {labError.message}</p>;
  if (!lab) return <p className="p-6">Lab not found.</p>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">{lab.lab_name}</h2>
      <p><strong>Capacity:</strong> {lab.lab_capacity}</p>
      <p><strong>Status:</strong> {lab.status}</p>
      <p className="mt-4"><strong>Description:</strong> {lab.description}</p>

      <div className="mt-6">
        <label htmlFor="date" className="block font-semibold mb-2">Select Date:</label>
        <input
          id="date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border px-3 py-2 rounded w-full max-w-xs"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="filter" className="font-semibold mr-2">Filter by Time:</label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="border px-2 py-1 rounded"
        >
          <option value="all">All</option>
          <option value="morning">Morning (6AM–12PM)</option>
          <option value="afternoon">Afternoon (12PM–5PM)</option>
          <option value="evening">Evening (5PM–10PM)</option>
        </select>
      </div>

      <div className="mt-6">
        <h3 className="text-2xl font-semibold mb-3">Available Time Slots</h3>

        {isSlotsLoading && <p>Loading time slots...</p>}
        {slotsError && <p className="text-red-600">Error loading slots: {slotsError.message}</p>}
        {!isSlotsLoading && filteredSlots?.length === 0 && (
          <p>No time slots available for selected date and filter.</p>
        )}

        <ul className="space-y-4 mt-4">
          {filteredSlots?.map((slot: TimeSlot) => {
            const waitlistEntry = userWaitlists.find((w: { slotId: string }) => w.slotId === slot.id);
            const showWaitlistButton = slot.isBooked && !waitlistEntry;
            const position = waitlistPositionMap?.[slot.id];

            return (
              <li
                key={slot.id}
                className={`p-4 border rounded shadow flex flex-col md:flex-row md:items-center md:justify-between ${slot.isBooked ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'
                  }`}
              >
                <div>
                  <p className="font-semibold text-lg">
                    {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                    {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-sm text-gray-600">
                    Date: {new Date(slot.startTime).toISOString().split('T')[0]}
                  </p>

                  {waitlistEntry && (
                    <p className="text-sm text-blue-600 mt-1">
                      {isPositionLoading ? 'Checking position...' : `Your position: ${position ?? 'N/A'}`}
                    </p>
                  )}
                </div>

                {slot.isBooked ? (
                  showWaitlistButton ? (
                    <button
                      onClick={() => joinWaitlistMutation.mutate(slot.id)}
                      className="mt-2 md:mt-0 px-4 py-1 rounded-full bg-yellow-500 text-white hover:bg-yellow-600"
                    >
                      Join Waitlist
                    </button>
                  ) : (
                    <span className="mt-2 md:mt-0 px-4 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                      Already on waitlist
                    </span>
                  )
                ) : (
                  <button
                    onClick={() => openModal(slot)}
                    className="mt-2 md:mt-0 px-4 py-1 rounded-full bg-green-600 text-white hover:bg-green-700"
                  >
                    Book Now
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Booking Confirmation Modal */}
      {isModalOpen && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Booking</h2>
            <p className="mb-2"><strong>Slot:</strong> {selectedSlot.startTime} - {selectedSlot.endTime}</p>
            <p className="mb-4"><strong>Date:</strong> {new Date(selectedSlot.startTime).toISOString().split('T')[0]}</p>

            <label className="block font-semibold mb-1" htmlFor="purpose">Purpose</label>
            <input
              id="purpose"
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="border px-3 py-2 rounded w-full mb-4"
              placeholder="e.g. Lab practice, assignment, etc."
            />

            <div className="flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-1 border rounded hover:bg-gray-100">Cancel</button>
              <button
                onClick={handleConfirmBooking}
                disabled={bookingMutation.isLoading || !purpose.trim()}
                className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingMutation.isLoading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm text-center animate-fadeIn">
            <h2 className="text-xl font-bold text-green-600 mb-3">Booking Successful!</h2>
            <p className="mb-4">Your lab slot has been booked successfully.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabDetailsPage;
