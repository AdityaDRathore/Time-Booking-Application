import React from 'react';
import { Waitlist } from '../../types/waitlist';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveWaitlist } from '../../api/waitlists';
import { toast } from 'react-toastify';
import { Clock, Monitor, ListOrdered, XCircle, Calendar } from 'lucide-react';

interface Props {
  waitlists: Waitlist[];
}

const MyWaitlistsList: React.FC<Props> = ({ waitlists }) => {
  const queryClient = useQueryClient();

  const leaveWaitlistMutation = useMutation({
    mutationFn: (id: string) => leaveWaitlist(id),
    onSuccess: () => {
      toast.success('Left the waitlist successfully.');
      queryClient.invalidateQueries({ queryKey: ['waitlists', 'me'] });
    },
    onError: () => {
      toast.error('Failed to leave the waitlist.');
    },
  });

  if (waitlists.length === 0) {
    return <p className="text-center text-gray-600">You are not on any waitlist currently.</p>;
  }

  return (
    <div className="space-y-6">
      {waitlists.map((entry) => {
        const slot = entry.timeSlot;
        const startTime = slot?.start_time
          ? new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'N/A';
        const endTime = slot?.end_time
          ? new Date(slot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'N/A';
        const date = slot?.start_time
          ? new Date(slot.start_time).toLocaleDateString()
          : 'N/A';

        return (
          <div
            key={entry.id}
            className="bg-gradient-to-br from-orange-50 to-green-50 border border-orange-100 rounded-xl shadow-md hover:shadow-lg transition duration-300 p-6"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-xl font-bold text-orange-800 mb-2 flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  {slot?.lab?.lab_name || 'Lab Not Available'}
                </h3>

                <p className="text-sm text-gray-700 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {date}
                </p>

                <p className="text-sm text-gray-700 mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {startTime} – {endTime}
                </p>

                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <ListOrdered className="w-4 h-4" />
                  <span className="font-medium">Position:</span>{' '}
                  {entry.waitlist_position ?? 'N/A'}
                </p>
              </div>

              <div className="flex items-start md:items-center justify-end">
                <button
                  onClick={() => leaveWaitlistMutation.mutate(entry.id)}
                  disabled={leaveWaitlistMutation.isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-4 h-4" />
                  {leaveWaitlistMutation.isLoading ? 'Leaving...' : 'Leave Waitlist'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyWaitlistsList;
