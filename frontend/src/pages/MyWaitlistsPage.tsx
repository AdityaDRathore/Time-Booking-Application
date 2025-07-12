import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserWaitlists } from '../api/waitlists';
import { useAuthStore } from '../state/authStore';
import MyWaitlistsList from '../components/organisms/MyWaitlistsList';
import { Waitlist } from '../types/waitlist';

const MyWaitlistsPage = () => {
  const { user } = useAuthStore();

  const { data: waitlists, isLoading, error } = useQuery({
    queryKey: ['waitlists', 'me'],
    queryFn: getUserWaitlists,
    enabled: !!user,
  }) as {
    data: Waitlist[] | undefined;
    isLoading: boolean;
    error: unknown;
  };

  if (isLoading) return <p className="p-6">Loading waitlists...</p>;
  if (error) return <p className="p-6 text-red-600">Error fetching waitlists.</p>;
  if (!waitlists || waitlists.length === 0) return <p className="p-6">You are not on any waitlist.</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">My Waitlists</h2>
      <MyWaitlistsList waitlists={waitlists} />
    </div>
  );
};

export default MyWaitlistsPage;
