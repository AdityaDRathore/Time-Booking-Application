// src/pages/admin/AdminDashboard.tsx

import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const sections = [
    { name: 'Manage Labs', path: '/admin/labs' },
    { name: 'Manage Time Slots', path: '/admin/labs/time-slots' },
    { name: 'Manage Bookings', path: '/admin/bookings' },
    { name: 'Manage Users', path: '/admin/users' },
    { name: 'Reports', path: '/admin/reports' },
  ];

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}
