import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserDetails } from '../../api/admin/users';
import { User } from '../../types/user';

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => getUserDetails(id!),
  }) as {
    data: User | undefined;
    isLoading: boolean;
    isError: boolean;
  };


  if (isLoading) return <p>Loading user details...</p>;
  if (isError || !user) return <p>Error loading user.</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{user.user_name}'s Details</h2>
      <p><strong>Email:</strong> {user.user_email}</p>
      <p><strong>Role:</strong> {user.user_role}</p>
      <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
    </div>
  );
}
