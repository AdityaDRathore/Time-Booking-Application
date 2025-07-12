import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  getAllLabsAdmin,
  createLab,
  updateLab,
  deleteLab,
} from '../../api/admin/labs';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const labSchema = z.object({
  lab_name: z.string().min(1, 'Lab name is required'),
  location: z.string().min(1, 'Location is required'),
  lab_capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
});

type LabFormData = z.infer<typeof labSchema>;

export default function AdminLabsPage() {
  const queryClient = useQueryClient();
  const [editingLab, setEditingLab] = useState<null | any>(null);
  const [isAdding, setIsAdding] = useState(false);

  const { data: labs = [], isLoading } = useQuery({
    queryKey: ['admin', 'labs'],
    queryFn: getAllLabsAdmin,
  });

  const createMutation = useMutation({
    mutationFn: createLab,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'labs']);
      setIsAdding(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: LabFormData }) =>
      updateLab(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'labs']);
      setEditingLab(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLab,
    onSuccess: () => queryClient.invalidateQueries(['admin', 'labs']),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LabFormData>({
    resolver: zodResolver(labSchema),
  });

  const onSubmit = (data: LabFormData) => {
    if (editingLab) {
      updateMutation.mutate({ id: editingLab.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (lab: any) => {
    setEditingLab(lab);
    reset({
      lab_name: lab.lab_name,
      location: lab.location,
      lab_capacity: lab.lab_capacity,
    });
  };

  const handleAdd = () => {
    setEditingLab(null);
    setIsAdding(true);
    reset({
      lab_name: '',
      location: '',
      lab_capacity: 1,
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Labs</h2>
      <button
        onClick={handleAdd}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700"
      >
        Add New Lab
      </button>

      {isLoading ? (
        <p>Loading labs...</p>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border p-2">Lab Name</th>
              <th className="border p-2">Location</th>
              <th className="border p-2">Capacity</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {labs.map((lab: any) => (
              <tr key={lab.id}>
                <td className="border p-2">{lab.lab_name}</td>
                <td className="border p-2">{lab.location}</td>
                <td className="border p-2">{lab.lab_capacity}</td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => handleEdit(lab)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      window.confirm('Delete lab?') && deleteMutation.mutate(lab.id)
                    }
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                  <Link to={`/admin/labs/${lab.id}/time-slots`} className="text-green-600 hover:underline">
                    Manage Time Slots
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {(editingLab || isAdding) && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="text-xl font-semibold mb-4">
            {editingLab ? 'Edit Lab' : 'Add Lab'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block font-medium">Lab Name</label>
              <input
                {...register('lab_name')}
                className="w-full border px-3 py-2 rounded"
              />
              {errors.lab_name && (
                <p className="text-red-600 text-sm">{errors.lab_name.message}</p>
              )}
            </div>
            <div>
              <label className="block font-medium">Location</label>
              <input
                {...register('location')}
                className="w-full border px-3 py-2 rounded"
              />
              {errors.location && (
                <p className="text-red-600 text-sm">{errors.location.message}</p>
              )}
            </div>
            <div>
              <label className="block font-medium">Lab Capacity</label>
              <input
                type="number"
                {...register('lab_capacity')}
                className="w-full border px-3 py-2 rounded"
              />
              {errors.lab_capacity && (
                <p className="text-red-600 text-sm">{errors.lab_capacity.message}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {editingLab ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => {
                  setEditingLab(null);
                  setIsAdding(false);
                  reset();
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
