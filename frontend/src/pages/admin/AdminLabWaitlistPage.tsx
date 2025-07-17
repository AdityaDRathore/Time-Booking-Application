// pages/admin/AdminLabWaitlistPage.tsx
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWaitlistByLabId,
  removeWaitlistEntry,
  promoteWaitlistEntry,
} from '../../api/admin/waitlists';
import { getLabById } from '../../api/labs';
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from 'react';
import {
  Shield,
  User,
  Clock,
  ArrowUpCircle,
  Trash2,
} from 'lucide-react';

export default function AdminLabWaitlistPage() {
  const { labId } = useParams();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'ACTIVE' | 'FULFILLED'>('ACTIVE');

  const { data: lab } = useQuery({
    queryKey: ['admin', 'lab', labId],
    queryFn: () => getLabById(labId!),
    enabled: !!labId,
  });

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin', 'waitlist', labId, tab],
    queryFn: () => getWaitlistByLabId(labId!, tab),
    enabled: !!labId,
  });

  const removeMutation = useMutation({
    mutationFn: removeWaitlistEntry,
    onSuccess: () => queryClient.invalidateQueries(['admin', 'waitlist', labId, tab]),
  });

  const promoteMutation = useMutation({
    mutationFn: promoteWaitlistEntry,
    onSuccess: () => queryClient.invalidateQueries(['admin', 'waitlist', labId, tab]),
  });

  const handleRemove = (id: string) => {
    if (confirm('Remove this user from the waitlist?')) {
      removeMutation.mutate(id);
    }
  };

  const handlePromote = (slotId: string) => {
    if (confirm('Promote the first user in this slot’s waitlist?')) {
      promoteMutation.mutate(slotId);
    }
  };

  const stats = {
    total: data.length,
    active: data.filter((e: { waitlist_status: string; }) => e.waitlist_status === 'ACTIVE').length,
    fulfilled: data.filter((e: { waitlist_status: string; }) => e.waitlist_status === 'FULFILLED').length,
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
            <span className="text-orange-600">वेटलिस्ट</span> <span className="text-green-600">प्रबंधन</span>
          </h1>
          <p className="text-lg text-gray-600">
            Waitlist for Lab {lab?.lab_name ?? `#${labId}`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
            <h3 className="text-sm font-semibold text-gray-600">कुल | Total</h3>
            <p className="text-2xl font-bold text-orange-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
            <h3 className="text-sm font-semibold text-gray-600">सक्रिय | Active</h3>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
            <h3 className="text-sm font-semibold text-gray-600">पूर्ण | Fulfilled</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.fulfilled}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setTab('ACTIVE')}
            className={`px-4 py-2 rounded-lg font-medium ${tab === 'ACTIVE'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Active Waitlist
          </button>
          <button
            onClick={() => setTab('FULFILLED')}
            className={`px-4 py-2 rounded-lg font-medium ${tab === 'FULFILLED'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Fulfilled
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-gray-600">लोड हो रहा है | Loading waitlist...</div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-gray-500">कोई प्रविष्टि नहीं मिली | No entries found</div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-orange-500 to-green-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">#</th>
                  <th className="px-6 py-4 text-left font-semibold">उपयोगकर्ता | User</th>
                  <th className="px-6 py-4 text-left font-semibold">ईमेल | Email</th>
                  <th className="px-6 py-4 text-left font-semibold">समय स्लॉट | Time Slot</th>
                  <th className="px-6 py-4 text-left font-semibold">स्थिति | Status</th>
                  <th className="px-6 py-4 text-left font-semibold">स्थान | Position</th>
                  {tab === 'ACTIVE' && (
                    <th className="px-6 py-4 text-left font-semibold">कार्य | Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.map((entry: { id: Key | null | undefined; user: { user_name: any; user_email: any; }; timeSlot: { start_time: string | number | Date; }; waitlist_status: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined; waitlist_position: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; slot_id: string; }, i: number) => (
                  <tr key={entry.id} className={`border-b ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4">{i + 1}</td>
                    <td className="px-6 py-4 flex items-center">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-2">
                        <User className="w-4 h-4 text-orange-600" />
                      </div>
                      <span>{entry.user?.user_name ?? '—'}</span>
                    </td>
                    <td className="px-6 py-4">{entry.user?.user_email ?? '—'}</td>
                    <td className="px-6 py-4 flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      {entry.timeSlot?.start_time
                        ? new Date(entry.timeSlot.start_time).toLocaleString()
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${entry.waitlist_status === 'FULFILLED'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'}`}>
                        {entry.waitlist_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {entry.waitlist_status === 'FULFILLED' ? '—' : entry.waitlist_position}
                    </td>
                    {tab === 'ACTIVE' && (
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => handlePromote(entry.slot_id)}
                          className="text-sm font-medium text-blue-600 hover:underline flex items-center"
                          disabled={promoteMutation.isLoading}
                        >
                          <ArrowUpCircle className="w-4 h-4 mr-1" /> Promote
                        </button>
                        <button
                          key={String(entry.id)}
                          onClick={() => handleRemove(String(entry.id))}
                          className="text-sm font-medium text-red-600 hover:underline flex items-center"
                          disabled={removeMutation.isLoading}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Remove
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
