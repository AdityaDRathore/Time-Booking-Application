import React from 'react';
import { Waitlist } from '../../types/waitlist';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveWaitlist } from '../../api/waitlists';
import { toast } from 'react-toastify';

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

  return (
    <ul className="space-y-4">
      {waitlists.map((entry) => {
        const slot = entry.timeSlot;
        const startTime = slot?.start_time ? new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
        const endTime = slot?.end_time ? new Date(slot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
        const date = slot?.start_time ? new Date(slot.start_time).toLocaleDateString() : 'N/A';

        return (
          <li
            key={entry.id}
            className="border p-4 rounded flex flex-col md:flex-row md:items-center md:justify-between shadow"
          >
            <div>
              <p className="text-lg font-semibold">
                Lab: {slot?.lab?.lab_name || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                Slot: {startTime} – {endTime} on {date}
              </p>
              <p className="text-sm text-gray-600">
                Position: {entry.waitlist_position ?? 'N/A'}
              </p>
            </div>
            <button
              onClick={() => leaveWaitlistMutation.mutate(entry.id)}
              disabled={leaveWaitlistMutation.isLoading}
              className="mt-3 md:mt-0 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {leaveWaitlistMutation.isLoading ? 'Leaving...' : 'Leave Waitlist'}
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default MyWaitlistsList;
