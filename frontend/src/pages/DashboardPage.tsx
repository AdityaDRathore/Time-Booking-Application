import React, { useState } from 'react';
import { useAuthStore } from '../state/authStore';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserBookings } from '../api/bookings';
import { getUserWaitlists, leaveWaitlist } from '../api/waitlists';
import { Booking } from '../types/booking';
import { Waitlist } from '../types/waitlist';
import { Calendar, Clock, Users, Monitor, BookOpen, User, Mail, Shield, CheckCircle, AlertCircle, History, Award } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelBooking } from '../api/bookings';
import { toast } from 'react-toastify';

type Tab = 'upcoming' | 'waitlist' | 'history';

const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');

  const {
    data: bookings = [],
    isLoading: isBookingsLoading,
    error: bookingsError,
  } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: () => getUserBookings('all'),
    enabled: !!user,
  });

  const {
    data: waitlists = [],
    isLoading: isWaitlistsLoading,
    error: waitlistsError,
  } = useQuery({
    queryKey: ['waitlists', 'me'],
    queryFn: getUserWaitlists,
    enabled: !!user,
  });

  const now = new Date();

  const confirmedOrPending = bookings.filter(
    (b: Booking) =>
      (b.booking_status === 'CONFIRMED' || b.booking_status === 'PENDING') &&
      b.timeSlot !== undefined
  );

  const upcomingBookings = confirmedOrPending.filter(
    (b: { timeSlot: any; }) => new Date(b.timeSlot!.start_time) > now
  );

  const pastBookings = confirmedOrPending.filter(
    (b: { timeSlot: any; }) => new Date(b.timeSlot!.end_time) <= now
  );

  const historicalBookings = bookings.filter(
    (b: Booking) =>
      b.booking_status === 'CANCELLED' ||
      (b.booking_status === 'CONFIRMED' && new Date(b.timeSlot!.end_time) <= now)
  );

  const historicalWaitlists = waitlists.filter(
    (w: Waitlist) =>
      w.waitlist_status !== 'ACTIVE' && new Date(w.timeSlot!.end_time) <= now
  );

  const queryClient = useQueryClient();

  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: string) => cancelBooking(bookingId),
    onSuccess: () => {
      toast.success('Booking cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['bookings'] }); // ✅ correct
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to cancel booking');
    },
  });

  const leaveWaitlistMutation = useMutation({
    mutationFn: (waitlistId: string) => leaveWaitlist(waitlistId),
    onSuccess: () => {
      toast.success('Exited waitlist successfully');
      queryClient.invalidateQueries({ queryKey: ['waitlists'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to exit waitlist');
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'text-green-600 bg-green-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full mb-6">
            <Shield className="w-5 h-5 text-orange-600 mr-2" />
            <span className="text-orange-800 font-semibold">डैशबोर्ड | Dashboard</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            <span className="text-orange-600">नमस्ते</span>
            <br />
            <span className="text-green-600">{user?.user_name}</span>
          </h1>

          <p className="text-xl text-gray-700 mb-4 max-w-3xl mx-auto">
            आपकी लैब बुकिंग और सत्र प्रबंधन
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Your Lab Booking and Session Management Hub
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <button
              onClick={() => navigate('/labs')}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg shadow-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition duration-300 flex items-center justify-center"
            >
              <Monitor className="w-5 h-5 mr-2" />
              लैब बुक करें | Book Lab
            </button>
            <div className="px-8 py-4 bg-white text-orange-600 border-2 border-orange-600 font-bold rounded-lg shadow-lg flex items-center justify-center">
              <Mail className="w-5 h-5 mr-2" />
              {user?.user_email}
            </div>
            <div className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg shadow-lg flex items-center justify-center">
              <User className="w-5 h-5 mr-2" />
              {user?.user_role}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center border-t-4 border-orange-500 hover:shadow-xl transition duration-300">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">आगामी सत्र</h3>
            <p className="text-4xl font-bold text-orange-600 mb-2">{upcomingBookings.length}</p>
            <p className="text-gray-600">Upcoming Sessions</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center border-t-4 border-green-500 hover:shadow-xl transition duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">प्रतीक्षा सूची</h3>
            <p className="text-4xl font-bold text-green-600 mb-2">{waitlists.length}</p>
            <p className="text-gray-600">Waitlist Position</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center border-t-4 border-blue-500 hover:shadow-xl transition duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">पूर्ण सत्र</h3>
            <p className="text-4xl font-bold text-blue-600 mb-2">{pastBookings.length}</p>
            <p className="text-gray-600">Completed Sessions</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-12">आपके सत्र | Your Sessions</h2>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-8 py-4 font-bold rounded-lg shadow-lg transform hover:scale-105 transition duration-300 flex items-center justify-center ${activeTab === 'upcoming'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                : 'bg-white text-orange-600 border-2 border-orange-600 hover:bg-orange-50'
                }`}
            >
              <Calendar className="w-5 h-5 mr-2" />
              आगामी | Upcoming
            </button>
            <button
              onClick={() => setActiveTab('waitlist')}
              className={`px-8 py-4 font-bold rounded-lg shadow-lg transform hover:scale-105 transition duration-300 flex items-center justify-center ${activeTab === 'waitlist'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                : 'bg-white text-green-600 border-2 border-green-600 hover:bg-green-50'
                }`}
            >
              <Users className="w-5 h-5 mr-2" />
              प्रतीक्षा | Waitlist
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-8 py-4 font-bold rounded-lg shadow-lg transform hover:scale-105 transition duration-300 flex items-center justify-center ${activeTab === 'history'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
                }`}
            >
              <History className="w-5 h-5 mr-2" />
              इतिहास | History
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {activeTab === 'upcoming' && (
            <div>
              {isBookingsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-xl text-gray-700 mb-2">लोड हो रहा है...</p>
                  <p className="text-gray-600">Loading your upcoming sessions...</p>
                </div>
              ) : bookingsError ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <p className="text-xl text-red-600 font-bold mb-2">त्रुटि | Error</p>
                  <p className="text-gray-600">Error loading bookings. Please try refreshing the page</p>
                </div>
              ) : upcomingBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-10 h-10 text-orange-600" />
                  </div>
                  <p className="text-xl text-gray-700 font-bold mb-2">कोई आगामी सत्र नहीं</p>
                  <p className="text-gray-600 mb-6">No upcoming sessions. Book a lab session to get started</p>
                  <button
                    onClick={() => navigate('/labs')}
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg shadow-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition duration-300"
                  >
                    अभी बुक करें | Book Now
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {upcomingBookings.map((b: any) => (
                    <div key={b.id} className="bg-gradient-to-r from-orange-50 to-green-50 rounded-xl p-6 border-l-4 border-orange-500 hover:shadow-lg transition duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                            <Monitor className="w-8 h-8 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="text-2xl font-bold text-gray-800">{b.timeSlot?.lab?.lab_name ?? 'N/A'}</h4>
                            <p className="text-gray-600 text-lg">{b.purpose || 'General Lab Session'}</p>
                          </div>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center ${getStatusColor(b.booking_status)}`}>
                          {getStatusIcon(b.booking_status)}
                          <span className="ml-2">{b.booking_status}</span>
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center text-gray-700">
                          <Calendar className="w-5 h-5 mr-3" />
                          <span className="text-lg">{new Date(b.timeSlot!.start_time).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Clock className="w-5 h-5 mr-3" />
                          <span className="text-lg">{new Date(b.timeSlot!.start_time).toLocaleTimeString()} – {new Date(b.timeSlot!.end_time).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      {b.booking_status !== 'CANCELLED' && (
                        <div className="mt-4 text-right">
                          <button
                            onClick={() => {
                              const confirmCancel = window.confirm('Are you sure you want to cancel this booking?');
                              if (confirmCancel) {
                                cancelBookingMutation.mutate(b.id);
                              }
                            }}
                            className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white transition duration-200"
                          >
                            Cancel Booking
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'waitlist' && (
            <div>
              {isWaitlistsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
                  <p className="text-xl text-gray-700 mb-2">लोड हो रहा है...</p>
                  <p className="text-gray-600">Loading your waitlist status...</p>
                </div>
              ) : waitlistsError ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <p className="text-xl text-red-600 font-bold mb-2">त्रुटि | Error</p>
                  <p className="text-gray-600">Error loading waitlists. Please try refreshing the page</p>
                </div>
              ) : waitlists.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-green-600" />
                  </div>
                  <p className="text-xl text-gray-700 font-bold mb-2">कोई सक्रिय प्रतीक्षा सूची नहीं</p>
                  <p className="text-gray-600">No active waitlists. You're not currently on any waitlists</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {waitlists.map((w: any) => (
                    <div key={w.id} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-l-4 border-green-500 hover:shadow-lg transition duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4">
                            <Monitor className="w-8 h-8 text-green-600" />
                          </div>
                          <div>
                            <h4 className="text-2xl font-bold text-gray-800">{w.timeSlot?.lab?.lab_name ?? 'N/A'}</h4>
                            <p className="text-gray-600 text-lg">प्रतीक्षा सूची स्थिति | Waitlist Position</p>
                          </div>
                        </div>
                        <span className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full text-2xl font-bold">
                          #{w.waitlist_position ?? 'N/A'}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center text-gray-700">
                          <Calendar className="w-5 h-5 mr-3" />
                          <span className="text-lg">{new Date(w.timeSlot!.start_time).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Clock className="w-5 h-5 mr-3" />
                          <span className="text-lg">{w.timeSlot?.start_time && w.timeSlot?.end_time
                            ? `${new Date(w.timeSlot.start_time).toLocaleTimeString()} – ${new Date(w.timeSlot.end_time).toLocaleTimeString()}`
                            : 'N/A'}</span>
                        </div>
                      </div>
                      <div className="mt-4 text-right">
                        <button
                          onClick={() => {
                            const confirmExit = window.confirm('Are you sure you want to exit this waitlist?');
                            if (confirmExit) {
                              leaveWaitlistMutation.mutate(w.id);
                            }
                          }}
                          className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white transition duration-200"
                        >
                          Exit Waitlist
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {historicalBookings.length === 0 && historicalWaitlists.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <History className="w-10 h-10 text-blue-600" />
                  </div>
                  <p className="text-xl text-gray-700 font-bold mb-2">कोई सत्र इतिहास नहीं</p>
                  <p className="text-gray-600">No session history. Your completed and cancelled sessions will appear here</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {historicalBookings.map((b: any) => (
                    <div key={b.id} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-l-4 border-blue-500 hover:shadow-lg transition duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                            <Monitor className="w-8 h-8 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-2xl font-bold text-gray-800">{b.timeSlot?.lab?.lab_name ?? 'N/A'}</h4>
                            <p className="text-gray-600 text-lg">
                              {b.booking_status === 'CANCELLED' ? 'रद्द किया गया | Cancelled' : 'पूर्ण सत्र | Completed'}
                            </p>
                          </div>
                        </div>
                        <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                          {b.booking_status}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center text-gray-700">
                          <Calendar className="w-5 h-5 mr-3" />
                          <span className="text-lg">{new Date(b.timeSlot!.start_time).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Clock className="w-5 h-5 mr-3" />
                          <span className="text-lg">{new Date(b.timeSlot!.start_time).toLocaleTimeString()} – {new Date(b.timeSlot!.end_time).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {historicalWaitlists.map((w: any) => (
                    <div key={w.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-l-4 border-blue-500 hover:shadow-lg transition duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                            <Users className="w-8 h-8 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-2xl font-bold text-gray-800">{w.timeSlot?.lab?.lab_name ?? 'N/A'}</h4>
                            <p className="text-gray-600 text-lg">प्रतीक्षा सूची इतिहास | Waitlist History</p>
                          </div>
                        </div>
                        <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                          {w.waitlist_status}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center text-gray-700">
                          <Calendar className="w-5 h-5 mr-3" />
                          <span className="text-lg">{new Date(w.timeSlot!.start_time).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Clock className="w-5 h-5 mr-3" />
                          <span className="text-lg">{w.timeSlot?.start_time && w.timeSlot?.end_time
                            ? `${new Date(w.timeSlot.start_time).toLocaleTimeString()} – ${new Date(w.timeSlot.end_time).toLocaleTimeString()}`
                            : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;