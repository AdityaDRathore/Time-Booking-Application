import React from 'react';
import { Lab } from '../types/lab';
import { Link } from 'react-router-dom';

// Mock prop for now
const labs: Lab[] = [
  {
    id: '1',
    name: 'Physics Lab',
    description: 'Well-equipped lab with modern apparatus.',
    capacity: 30,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Chemistry Lab',
    description: 'Advanced instruments for research and learning.',
    capacity: 25,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const LabList: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-[#0f3e6c] border-b-2 border-blue-500 pb-2 mb-6">
        प्रयोगशाला सूची (List of Labs)
      </h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {labs.map((lab) => (
          <div
            key={lab.id}
            className="bg-white border border-gray-300 rounded-lg shadow hover:shadow-lg transition-all duration-200 p-6 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-xl font-semibold text-blue-800 mb-2">{lab.name}</h2>
              <p className="text-gray-700 text-sm">{lab.description}</p>
            </div>
            <Link
              to={`/labs/${lab.id}`}
              className="mt-4 inline-block bg-[#0f3e6c] text-white text-sm px-4 py-2 rounded hover:bg-blue-900 transition"
            >
              विवरण देखें (View Details)
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabList;
