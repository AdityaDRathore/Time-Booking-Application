import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWaitlistByLabId,
  removeWaitlistEntry,
  promoteWaitlistEntry,
} from '../../api/admin/waitlists';
import { Waitlist } from '../../types/waitlist';

export default function AdminLabWaitlistPage() {
  const { labId } = useParams();
  const queryClient = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin', 'waitlist', labId],
    queryFn: () => getWaitlistByLabId(labId!),
    enabled: !!labId,
  });

  const removeMutation = useMutation({
    mutationFn: removeWaitlistEntry,
    onSuccess: () => queryClient.invalidateQueries(['admin', 'waitlist', labId]),
  });

  const promoteMutation = useMutation({
    mutationFn: promoteWaitlistEntry,
    onSuccess: () => queryClient.invalidateQueries(['admin', 'waitlist', labId]),
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Waitlist for Lab #{labId}</h2>

      {isLoading ? (
        <p>Loading waitlist...</p>
      ) : data.length === 0 ? (
        <p>No users on the waitlist.</p>
      ) : (
        <table className="min-w-full border border-gray-300 bg-white shadow-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold">
              <th className="p-2 border-b">#</th>
              <th className="p-2 border-b">User</th>
              <th className="p-2 border-b">Email</th>
              <th className="p-2 border-b">Time Slot</th>
              <th className="p-2 border-b">Position</th>
              <th className="p-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry: Waitlist, i: number) => (
              <tr key={entry.id} className="text-sm">
                <td className="p-2 border-b">{i + 1}</td>
                <td className="p-2 border-b">{entry.user?.user_name ?? '—'}</td>
                <td className="p-2 border-b">{entry.user?.user_email ?? '—'}</td>
                <td className="p-2 border-b">
                  {entry.timeSlot?.start_time || entry.timeSlot?.start_time
                    ? new Date(entry.timeSlot.start_time ?? entry.timeSlot.start_time).toLocaleString()
                    : '—'}
                </td>
                <td className="p-2 border-b">{entry.waitlist_position}</td>
                <td className="p-2 border-b space-x-2">
                  <button
                    onClick={() => handlePromote(entry.slot_id)}
                    className="text-blue-600 hover:underline"
                    disabled={promoteMutation.isLoading}
                  >
                    Promote
                  </button>
                  <button
                    onClick={() => handleRemove(entry.id)}
                    className="text-red-600 hover:underline"
                    disabled={removeMutation.isLoading}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
