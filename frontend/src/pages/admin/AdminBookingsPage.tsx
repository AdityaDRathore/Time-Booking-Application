import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllBookings, updateBookingStatus } from '../../api/admin/bookings';
import { Booking, BookingStatus } from '../../types/booking';
import { useState } from 'react';
import { Shield, BookOpen, Calendar, Clock, User, Monitor, CheckCircle, AlertCircle, XCircle, Award } from 'lucide-react';

const statusOptions = ['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as const;
type StatusFilter = typeof statusOptions[number];

export default function AdminBookingsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>('ALL');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'bookings'],
    queryFn: getAllBookings,
  });

  const bookings = Array.isArray(data) ? data : [];

  const updateStatusMutation = useMutation({
    mutationFn: updateBookingStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'bookings']);
    },
  });

  const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    if (confirm(`Change status to ${newStatus}?`)) {
      updateStatusMutation.mutate({ bookingId, status: newStatus });
    }
  };

  const filteredBookings =
    filter === 'ALL'
      ? bookings
      : bookings.filter((b) => b.booking_status?.toUpperCase() === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING':
        return <AlertCircle className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      case 'COMPLETED':
        return <Award className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getButtonColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-600 hover:bg-green-700';
      case 'CANCELLED':
        return 'bg-red-600 hover:bg-red-700';
      case 'COMPLETED':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  // Calculate statistics
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.booking_status === 'PENDING').length,
    confirmed: bookings.filter(b => b.booking_status === 'CONFIRMED').length,
    completed: bookings.filter(b => b.booking_status === 'COMPLETED').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full mb-4">
            <Shield className="w-5 h-5 text-orange-600 mr-2" />
            <span className="text-orange-800 font-semibold">व्यवस्थापक पैनल | Admin Panel</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            <span className="text-orange-600">बुकिंग</span> <span className="text-green-600">प्रबंधन</span>
          </h1>
          <p className="text-lg text-gray-600">Booking Management System</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500 hover:shadow-xl transition duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-600">कुल | Total</h3>
                <p className="text-2xl font-bold text-orange-600">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500 hover:shadow-xl transition duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-600">प्रतीक्षित | Pending</h3>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500 hover:shadow-xl transition duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-600">पुष्ट | Confirmed</h3>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-600">पूर्ण | Completed</h3>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">फ़िल्टर | Filter Bookings</h2>
            <div className="flex items-center space-x-4">
              <label className="font-medium text-gray-700">स्थिति | Status:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as StatusFilter)}
                className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">लोड हो रहा है | Loading bookings...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-600 text-lg font-semibold">त्रुटि | Error loading bookings</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg font-semibold">कोई बुकिंग नहीं मिली | No bookings found</p>
              <p className="text-gray-500">Selected filter returned no results</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-orange-500 to-green-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">उपयोगकर्ता | User</th>
                    <th className="px-6 py-4 text-left font-semibold">लैब | Lab</th>
                    <th className="px-6 py-4 text-left font-semibold">तारीख | Date</th>
                    <th className="px-6 py-4 text-left font-semibold">समय | Time</th>
                    <th className="px-6 py-4 text-left font-semibold">स्थिति | Status</th>
                    <th className="px-6 py-4 text-left font-semibold">कार्य | Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b, index) => (
                    <tr key={b.id} className={`border-b hover:bg-gray-50 transition duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-orange-600" />
                          </div>
                          <span className="font-medium">{b.user?.user_name ?? 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <Monitor className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="font-medium">{b.timeSlot?.lab?.lab_name ?? 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                          <span>
                            {b.timeSlot?.date
                              ? new Date(b.timeSlot.date).toLocaleDateString()
                              : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-sm">
                            {b.timeSlot?.start_time
                              ? new Date(b.timeSlot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'N/A'}{' '}
                            -{' '}
                            {b.timeSlot?.end_time
                              ? new Date(b.timeSlot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center w-fit ${getStatusColor(b.booking_status)}`}>
                          {getStatusIcon(b.booking_status)}
                          <span className="ml-1">{b.booking_status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {[BookingStatus.CONFIRMED, BookingStatus.CANCELLED, BookingStatus.COMPLETED].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(b.id, status)}
                              className={`text-xs text-white px-3 py-1 rounded-md font-medium transition duration-200 ${getButtonColor(status)}`}
                              disabled={updateStatusMutation.isLoading}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
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