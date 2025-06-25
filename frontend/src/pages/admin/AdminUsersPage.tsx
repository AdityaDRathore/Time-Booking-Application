import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '../../api/admin/users';
import { User } from '../../types/user';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
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
    user.user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>

      <input
        type="text"
        placeholder="Search by name or email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 px-4 py-2 border rounded w-full max-w-md"
      />

      {isLoading ? (
        <p>Loading users...</p>
      ) : isError ? (
        <p className="text-red-600">Error loading users</p>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="border p-2">{user.user_name}</td>
                <td className="border p-2">{user.user_email}</td>
                <td className="border p-2">
                  <Link
                    to={`/admin/users/${user.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
