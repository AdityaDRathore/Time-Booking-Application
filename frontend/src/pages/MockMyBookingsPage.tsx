import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelBooking } from '../api/bookings';
import { toast } from 'react-toastify';
import { Calendar, Clock, MapPin, X, CheckCircle, AlertCircle, Shield, Trash2 } from 'lucide-react';

// Mock booking data
const mockBookings = [
  {
    id: 'booking1',
    slot: {
      id: 'slot1',
      startTime: '10:00',
      endTime: '11:00',
      date: '2025-07-20',
    },
    lab: {
      name: 'भोपाल मुख्य लैब | Bhopal Main Lab',
      location: 'भोपाल | Bhopal'
    },
    status: 'upcoming'
  },
  {
    id: 'booking2',
    slot: {
      id: 'slot2',
      startTime: '14:00',
      endTime: '15:00',
      date: '2025-07-21',
    },
    lab: {
      name: 'इंदौर टेक सेंटर | Indore Tech Center',
      location: 'इंदौर | Indore'
    },
    status: 'upcoming'
  },
  {
    id: 'booking3',
    slot: {
      id: 'slot3',
      startTime: '09:00',
      endTime: '10:00',
      date: '2025-07-10',
    },
    lab: {
      name: 'जबलपुर डिजिटल हब | Jabalpur Digital Hub',
      location: 'जबलपुर | Jabalpur'
    },
    status: 'completed'
  },
];

const MockMyBookingsPage = () => {
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => cancelBooking(bookingId),
    onSuccess: () => {
      toast.success('बुकिंग रद्द हो गई | Booking cancelled');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setSelectedBookingId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'रद्दीकरण असफल | Cancellation failed');
    },
  });

  const handleCancel = (bookingId: string) => {
    setSelectedBookingId(bookingId);
  };

  const handleConfirmCancel = () => {
    if (selectedBookingId) {
      cancelMutation.mutate(selectedBookingId);
    }
  };

  const closeModal = () => {
    setSelectedBookingId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'आगामी | Upcoming';
      case 'completed':
        return 'पूर्ण | Completed';
      case 'cancelled':
        return 'रद्द | Cancelled';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full mb-6">
              <Shield className="w-5 h-5 text-white mr-2" />
              <span className="text-white font-semibold">आपकी बुकिंग्स | Your Bookings</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              <span className="text-orange-100">मेरी बुकिंग्स</span>
              <br />
              <span className="text-green-100">My Bookings</span>
            </h1>
            
            <p className="text-xl opacity-90 mb-2">
              अपनी सभी लैब बुकिंग्स को देखें और प्रबंधित करें
            </p>
            <p className="text-lg opacity-80">
              View and manage all your lab bookings
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Bookings List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              बुकिंग्स की सूची | Bookings List
            </h2>
            <div className="text-sm text-gray-500">
              कुल {mockBookings.length} बुकिंग्स | Total {mockBookings.length} bookings
            </div>
          </div>

          <div className="space-y-4">
            {mockBookings.map((booking) => (
              <div
                key={booking.id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition duration-300 bg-gradient-to-r from-gray-50 to-white"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {booking.lab.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {booking.lab.location}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center text-gray-700">
                        <Calendar className="w-5 h-5 text-orange-600 mr-2" />
                        <span className="font-medium">दिनांक | Date:</span>
                        <span className="ml-2">{booking.slot.date}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Clock className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-medium">समय | Time:</span>
                        <span className="ml-2">{booking.slot.startTime} - {booking.slot.endTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  {booking.status === 'upcoming' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        रद्द करें | Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {mockBookings.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                कोई बुकिंग नहीं मिली | No Bookings Found
              </h3>
              <p className="text-gray-600 mb-6">
                आपकी कोई बुकिंग नहीं है | You have no bookings yet
              </p>
              <button
                onClick={() => window.location.href = '/booking'}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-green-600 text-white font-bold rounded-lg shadow-lg hover:from-orange-600 hover:to-green-700 transform hover:scale-105 transition duration-300"
              >
                नई बुकिंग करें | Make New Booking
              </button>
            </div>
          )}
        </div>

        {/* Statistics Section */}
        <div className="bg-gradient-to-r from-orange-500 to-green-600 rounded-2xl p-8 text-white mt-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">आपकी गतिविधि | Your Activity</h2>
            <p className="text-lg opacity-90">Digital lab usage summary</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">{mockBookings.length}</div>
              <div className="text-sm opacity-90">कुल बुकिंग्स | Total Bookings</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">
                {mockBookings.filter(b => b.status === 'upcoming').length}
              </div>
              <div className="text-sm opacity-90">आगामी | Upcoming</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">
                {mockBookings.filter(b => b.status === 'completed').length}
              </div>
              <div className="text-sm opacity-90">पूर्ण | Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-sm opacity-90">निःशुल्क | Free</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {selectedBookingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                बुकिंग रद्द करें | Cancel Booking
              </h2>
              <p className="text-gray-600 mb-6">
                क्या आप वाकई इस बुकिंग को रद्द करना चाहते हैं?
                <br />
                Are you sure you want to cancel this booking?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={closeModal}
                  className="flex-1 py-3 px-6 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition duration-300"
                >
                  नहीं | No
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={cancelMutation.isLoading}
                  className="flex-1 py-3 px-6 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition duration-300 disabled:opacity-50"
                >
                  {cancelMutation.isLoading ? 'रद्द कर रहे हैं... | Cancelling...' : 'हाँ, रद्द करें | Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockMyBookingsPage;