import { useQuery } from '@tanstack/react-query';
import { getAllLabsAdmin } from '../../api/admin/labs';
import { Lab } from '../../types/lab';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { data: labs = [], isLoading } = useQuery({
    queryKey: ['admin', 'labs'],
    queryFn: getAllLabsAdmin,
  });

  const sections = [
    { name: 'Manage Labs', path: '/admin/labs' },
    { name: 'Manage Bookings', path: '/admin/bookings' },
    { name: 'Manage Users', path: '/admin/users' },
    { name: 'Reports', path: '/admin/reports' },
  ];

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {sections.map((section) => (
          <Link
            to={section.path}
            key={section.name}
            className="border rounded-md p-6 bg-white shadow hover:shadow-md transition"
          >
            <h3 className="text-xl font-semibold">{section.name}</h3>
          </Link>
        ))}
      </div>

      <h3 className="text-xl font-bold mb-3">Labs</h3>

      {isLoading ? (
        <p>Loading labs...</p>
      ) : labs.length === 0 ? (
        <p>No labs found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {labs.map((lab: Lab) => (
            <div key={lab.id} className="border rounded-md p-4 bg-white shadow-sm hover:shadow-md transition">
              <h4 className="font-semibold text-lg mb-1">{lab.lab_name}</h4>
              <p className="text-sm text-gray-600 mb-3">{lab.location}</p>
              <Link
                to={`/admin/labs/${lab.id}/time-slots`}
                className="text-sm text-blue-600 hover:underline"
              >
                Manage Time Slots →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
