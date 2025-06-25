import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLabUsageReport, getUserActivityReport } from '../../api/reports';
import { LabUsageReport, UserActivityReport } from '../../types/reports';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

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

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Admin Reports</h2>

      <div className="flex space-x-4">
        <input
          type="date"
          className="border px-3 py-1 rounded"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <input
          type="date"
          className="border px-3 py-1 rounded"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
      </div>

      {(loadingLab || loadingUser) && <p>Loading reports...</p>}

      {!!labUsage.length && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Lab Usage Report</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={labUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="labName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalBookings" fill="#4f46e5" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {!!userActivity.length && (
        <div>
          <h3 className="text-xl font-semibold mt-6 mb-2">User Activity Report</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="userName" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="bookingsCount" stroke="#10b981" name="Bookings" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
