import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../state/authStore';
import { getUserBookings } from '../api/bookings';
import MyBookingsList from '../components/organisms/MyBookingsList';
import { Calendar, Clock, Filter, BookOpen, Shield } from 'lucide-react';

const MyBookingsPage = () => {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('all');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings', user?.id, filter],
    queryFn: () => getUserBookings(filter),
    enabled: !!user?.id,
  });

  const getFilterCount = (filterType: string) => {
    // Mock count - replace with actual logic
    return filterType === 'all' ? bookings.length : Math.floor(bookings.length / 2);
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
        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Filter className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-800">
                फिल्टर | Filter:
              </h2>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'सभी | All', icon: BookOpen },
                { value: 'upcoming', label: 'आगामी | Upcoming', icon: Calendar },
                { value: 'past', label: 'पिछली | Past', icon: Clock }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition duration-300 ${
                    filter === value
                      ? 'bg-gradient-to-r from-orange-500 to-green-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                    filter === value ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {getFilterCount(value)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
              <p className="text-gray-600 text-lg">लोड हो रहा है... | Loading...</p>
            </div>
          ) : bookings.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  बुकिंग्स की सूची | Bookings List
                </h2>
                <div className="text-sm text-gray-500">
                  कुल {bookings.length} बुकिंग्स | Total {bookings.length} bookings
                </div>
              </div>
              <MyBookingsList bookings={bookings} />
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                कोई बुकिंग नहीं मिली | No Bookings Found
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? 'आपकी कोई बुकिंग नहीं है | You have no bookings yet'
                  : `कोई ${filter === 'upcoming' ? 'आगामी' : 'पिछली'} बुकिंग नहीं मिली | No ${filter} bookings found`
                }
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
              <div className="text-3xl font-bold mb-2">{bookings.length}</div>
              <div className="text-sm opacity-90">कुल बुकिंग्स | Total Bookings</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">{getFilterCount('upcoming')}</div>
              <div className="text-sm opacity-90">आगामी | Upcoming</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">{getFilterCount('past')}</div>
              <div className="text-sm opacity-90">पूर्ण | Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-sm opacity-90">निःशुल्क | Free</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage;