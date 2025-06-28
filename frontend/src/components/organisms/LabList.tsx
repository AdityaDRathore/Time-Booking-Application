import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllLabs } from '../../api/labs'; // ✅ your existing API call
import { Lab } from '../../types/lab';
import { Link } from 'react-router-dom';

const LabList: React.FC = () => {
  const { data: labs, isLoading, error } = useQuery(['labs'], getAllLabs);

  if (isLoading) return <p className="text-center mt-10">Loading labs...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">Failed to fetch labs.</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-[#0f3e6c] border-b-2 border-blue-500 pb-2 mb-6">
        प्रयोगशाला सूची (List of Labs)
      </h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {labs?.map((lab: Lab) => (
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
