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
import { 
  Calendar, 
  Clock, 
  Monitor, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Filter,
  MapPin,
  Info,
  BookOpen,
  X,
  UserPlus
} from 'lucide-react';

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

  const getFilterIcon = (filterType: string) => {
    switch (filterType) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌙';
      default: return '🕐';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
              <Monitor className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{lab?.lab_name}</h1>
              <p className="text-white/90 text-lg">Digital Coding Lab</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Users className="w-5 h-5 mr-2" />
                <span className="font-semibold">Capacity</span>
              </div>
              <p className="text-2xl font-bold">{lab?.lab_capacity}</p>
            </div>
            
            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-semibold">Status</span>
              </div>
              <p className="text-2xl font-bold">{lab?.status}</p>
            </div>
            
            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="font-semibold">Location</span>
              </div>
              <p className="text-lg font-semibold">{lab?.location}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Lab Description */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <Info className="w-6 h-6 text-orange-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-800">Lab Description</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">{lab?.description}</p>
        </div>

        {/* Date and Filter Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <Calendar className="w-6 h-6 text-green-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-800">Select Date & Time</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Filter by Time:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">🕐 All Times</option>
                <option value="morning">🌅 Morning (6 AM - 12 PM)</option>
                <option value="afternoon">☀️ Afternoon (12 PM - 5 PM)</option>
                <option value="evening">🌙 Evening (5 PM - 10 PM)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Time Slots */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-800">Available Time Slots</h2>
            </div>
            <div className="flex items-center text-gray-600">
              <Filter className="w-5 h-5 mr-2" />
              <span className="text-sm">
                {getFilterIcon(filter)} {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </span>
            </div>
          </div>

          {!filteredSlots || filteredSlots.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg font-semibold">No time slots available</p>
              <p className="text-gray-500">Try selecting a different date or time filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSlots.map((slot: TimeSlot) => (
                <div key={slot.id} className="bg-gradient-to-br from-orange-50 to-green-50 rounded-lg p-6 border border-gray-200 hover:shadow-lg transition duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-orange-600 mr-2" />
                      <span className="font-bold text-lg text-gray-800">
                        {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center text-gray-600 mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">{slot.date}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {slot.seatsLeft && slot.seatsLeft > 0 ? (
                          <span className="text-green-600 font-semibold">
                            {slot.seatsLeft} seat{slot.seatsLeft > 1 ? 's' : ''} available
                          </span>
                        ) : (
                          <span className="text-red-600 font-semibold">Fully booked</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {slot.seatsLeft && slot.seatsLeft > 0 ? (
                    <button
                      onClick={() => {
                        setSelectedSlot(slot);
                        setIsModalOpen(true);
                      }}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition duration-300 flex items-center justify-center"
                    >
                      <BookOpen className="w-5 h-5 mr-2" />
                      Book Now
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinWaitlist(slot)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transform hover:scale-105 transition duration-300 flex items-center justify-center"
                    >
                      <UserPlus className="w-5 h-5 mr-2" />
                      Join Waitlist
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {isModalOpen && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Confirm Booking</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center text-gray-600 mb-2">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    {new Date(selectedSlot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedSlot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">{selectedSlot.date}</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block font-semibold mb-2 text-gray-700">Purpose of Visit:</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Lab practice, assignment work, coding practice"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBooking}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-green-600 text-white rounded-lg hover:from-orange-600 hover:to-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={bookingMutation.isLoading || !purpose.trim()}
                >
                  {bookingMutation.isLoading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {modal && (
        <StatusModal 
          message={modal.message} 
          color={modal.color} 
          onClose={() => setModal(null)} 
        />
      )}
    </div>
  );
};

const StatusModal = ({ message, color, onClose }: { message: string; color: string; onClose: () => void }) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return 'border-green-500 text-green-600';
      case 'red':
        return 'border-red-500 text-red-600';
      case 'yellow':
        return 'border-yellow-500 text-yellow-600';
      default:
        return 'border-blue-500 text-blue-600';
    }
  };

  const getIcon = (color: string) => {
    switch (color) {
      case 'green':
        return <CheckCircle className="w-8 h-8" />;
      case 'red':
        return <AlertCircle className="w-8 h-8" />;
      case 'yellow':
        return <Clock className="w-8 h-8" />;
      default:
        return <Info className="w-8 h-8" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl w-full max-w-sm text-center border-t-4 ${getColorClasses(color)}`}>
        <div className="p-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${color === 'green' ? 'bg-green-100' : color === 'red' ? 'bg-red-100' : color === 'yellow' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
            {getIcon(color)}
          </div>
          <h2 className={`text-xl font-bold mb-4 ${getColorClasses(color)}`}>{message}</h2>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-green-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-green-700 transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LabDetailsPage;