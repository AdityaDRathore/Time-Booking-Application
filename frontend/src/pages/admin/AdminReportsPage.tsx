import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLabUsageReport, getUserActivityReport } from '../../api/reports';
import { LabUsageReport, UserActivityReport } from '../../types/reports';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { BarChart3, Calendar, Monitor, Users, TrendingUp, FileText, Download } from 'lucide-react';

export default function AdminReportsPage() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const { data: labUsage = [], isLoading: loadingLab } = useQuery({
    queryKey: ['report', 'labUsage', start, end],
    queryFn: () => getLabUsageReport(start, end),
    enabled: !!start && !!end,
  });

  const { data: userActivity = [], isLoading: loadingUser } = useQuery({
    queryKey: ['report', 'userActivity', start, end],
    queryFn: () => getUserActivityReport(start, end),
    enabled: !!start && !!end,
  });

  const isLoading = loadingLab || loadingUser;
  const hasData = labUsage.length > 0 || userActivity.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full mb-4">
            <BarChart3 className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-purple-800 font-semibold">रिपोर्ट्स | Reports</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            <span className="text-purple-600">डेटा</span> <span className="text-green-600">विश्लेषण</span>
          </h1>
          <p className="text-lg text-gray-600">Data Analysis & Reports</p>
        </div>

        {/* Date Range Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">तारीख चुनें | Select Date Range</h2>
              <p className="text-sm text-gray-600">Choose the time period for your reports</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                प्रारंभ तिथि | Start Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                समाप्ति तिथि | End Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>

          {!start || !end ? (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                <p className="text-blue-800 font-medium">
                  कृपया रिपोर्ट देखने के लिए दोनों तारीखें चुनें | Please select both dates to view reports
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">रिपोर्ट्स लोड हो रही हैं | Loading reports...</p>
          </div>
        )}

        {/* Reports Section */}
        {!isLoading && hasData && (
          <div className="space-y-8">
            {/* Lab Usage Report */}
            {labUsage.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Monitor className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">लैब उपयोग रिपोर्ट | Lab Usage Report</h3>
                      <p className="text-sm text-gray-600">Total bookings per laboratory</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center px-3 py-1 bg-gray-100 rounded-full">
                      <TrendingUp className="w-4 h-4 text-gray-600 mr-1" />
                      <span className="text-sm font-medium text-gray-700">{labUsage.length} Labs</span>
                    </div>
                    <button className="flex items-center px-3 py-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition duration-200">
                      <Download className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">Export</span>
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={labUsage}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="labName" 
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Bar 
                        dataKey="totalBookings" 
                        fill="#3b82f6"
                        name="Total Bookings"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* User Activity Report */}
            {userActivity.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">उपयोगकर्ता गतिविधि रिपोर्ट | User Activity Report</h3>
                      <p className="text-sm text-gray-600">Booking activity per user</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center px-3 py-1 bg-gray-100 rounded-full">
                      <Users className="w-4 h-4 text-gray-600 mr-1" />
                      <span className="text-sm font-medium text-gray-700">{userActivity.length} Users</span>
                    </div>
                    <button className="flex items-center px-3 py-1 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition duration-200">
                      <Download className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">Export</span>
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={userActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="userName" 
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="bookingsCount" 
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        name="Bookings Count"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Data State */}
        {!isLoading && !hasData && start && end && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">कोई डेटा नहीं मिला | No Data Found</h3>
            <p className="text-gray-600 mb-4">
              चुनी गई तारीख सीमा के लिए कोई रिपोर्ट डेटा उपलब्ध नहीं है।
            </p>
            <p className="text-sm text-gray-500">
              No report data available for the selected date range.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}