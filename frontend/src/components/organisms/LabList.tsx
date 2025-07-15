// components/organisms/LabList.tsx
import React from 'react';
import { Lab } from '../../types/lab';
import { Link } from 'react-router-dom';

interface Props {
  labs: Lab[];
}

const LabList: React.FC<Props> = ({ labs }) => {
  if (!labs || labs.length === 0) {
    return <p className="text-center text-gray-600">No labs available.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {labs.map((lab) => (
        <div
          key={lab.id}
          className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition duration-300 p-6 flex flex-col justify-between"
        >
          <div>
            <h2 className="text-xl font-bold text-orange-700 mb-1">{lab.lab_name}</h2>
            <p className="text-sm text-gray-600 mb-2">{lab.description}</p>
            <p className="text-xs text-gray-500 mb-1">📍 {lab.location}</p>
<p className="text-xs text-gray-500">👥 Capacity: {lab.lab_capacity ?? 'N/A'}</p>
          </div>

          <Link
            to={`/labs/${lab.id}`}
            className="mt-4 inline-block text-sm font-medium px-4 py-2 rounded bg-gradient-to-r from-orange-500 to-green-500 text-white hover:from-orange-600 hover:to-green-600 transition"
          >
            विवरण देखें (View Details)
          </Link>
        </div>
      ))}
    </div>
  );
};

export default LabList;
