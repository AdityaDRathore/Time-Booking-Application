import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '../../api/admin/users';
import { User } from '../../types/user';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Eye,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Shield,
  Calendar,
} from 'lucide-react';
import React from 'react';

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: getAllUsers,
  }) as {
    data: User[];
    isLoading: boolean;
    isError: boolean;
  };

  const filteredUsers = data.filter((user) =>
    user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (userId: string) => {
    setExpandedUserId((prev) => (prev === userId ? null : userId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-4">
            <Shield className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-semibold">व्यवस्थापक पैनल | Admin Panel</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            <span className="text-blue-600">उपयोगकर्ता</span> <span className="text-green-600">प्रबंधन</span>
          </h1>
          <p className="text-lg text-gray-600">User Management</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">खोजें | Search Users</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="नाम या ईमेल से खोजें | Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">उपयोगकर्ता सूची | User List</h2>
              <div className="flex items-center px-3 py-1 bg-gray-100 rounded-full">
                <Users className="w-4 h-4 text-gray-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">{filteredUsers.length} Users</span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading users...</div>
          ) : isError ? (
            <div className="text-center py-12 text-red-600">Error loading users</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-600">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <React.Fragment key={user.id}>
                      <tr className="hover:bg-gray-50 transition duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-600 rounded-full flex items-center justify-center mr-3">
                              <UserCheck className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-sm font-medium text-gray-900">{user.user_name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{user.user_email}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user.user_role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 items-center">
                            <Link
                              to={`/admin/users/${user.id}`}
                              className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-green-600 text-white rounded-lg hover:from-blue-600 hover:to-green-700 transition duration-200 group"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">Details</span>
                            </Link>
                            <button
                              onClick={() => toggleExpand(user.id)}
                              className="flex items-center text-sm text-blue-600 hover:underline"
                            >
                              {expandedUserId === user.id ? (
                                <>
                                  Hide Bookings <ChevronUp className="ml-1 w-4 h-4" />
                                </>
                              ) : (
                                <>
                                  Show Bookings <ChevronDown className="ml-1 w-4 h-4" />
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expandedUserId === user.id && (
                        <tr>
                          <td colSpan={4} className="bg-gray-50 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                              Bookings for {user.user_name}
                            </h3>
                            {user.bookings?.length === 0 ? (
                              <p className="text-sm text-gray-500">No bookings found.</p>
                            ) : (
                              <ul className="space-y-2">
                                {user.bookings?.map((b) => (
                                  <li key={b.id} className="flex items-center justify-between bg-white border rounded p-3">
                                    <div>
                                      <p className="text-sm text-gray-800 font-medium">
                                        Lab: {b.timeSlot?.lab?.lab_name || 'N/A'}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {b.timeSlot?.start_time && b.timeSlot?.end_time
                                          ? `${new Date(b.timeSlot.start_time).toLocaleDateString()} | ${new Date(b.timeSlot.start_time).toLocaleTimeString()} – ${new Date(b.timeSlot.end_time).toLocaleTimeString()}`
                                          : 'N/A'}
                                      </p>
                                    </div>
                                    <span
                                      className={`text-xs font-semibold px-3 py-1 rounded-full ${b.booking_status === 'CONFIRMED'
                                        ? 'bg-green-100 text-green-700'
                                        : b.booking_status === 'PENDING'
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : 'bg-red-100 text-red-700'
                                        }`}
                                    >
                                      {b.booking_status}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
