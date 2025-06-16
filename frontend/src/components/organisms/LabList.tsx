import { useQuery } from '@tanstack/react-query';
import { getAllLabs } from '../../api/labs';
import { Lab } from '../../types/lab';
import { Link } from 'react-router-dom';

const LabList = () => {
  const { data: labs, isLoading, error } = useQuery(['labs'], getAllLabs);

  if (isLoading) return <p>Loading labs...</p>;
  if (error) return <p>Error fetching labs.</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Available Labs</h2>
      <ul className="space-y-4">
        {labs?.map((lab: Lab) => (
          <li key={lab.id} className="border p-4 rounded shadow">
            <h3 className="text-xl font-semibold">{lab.name}</h3>
            <p>Capacity: {lab.capacity}</p>
            <p>Status: {lab.status}</p>
            <Link
              to={`/labs/${lab.id}`}
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              View Details
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LabList;
