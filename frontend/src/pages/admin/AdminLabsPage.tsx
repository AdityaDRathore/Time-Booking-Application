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
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Monitor, MapPin, Users, Plus, Edit, Trash2, Clock, AlertCircle, CheckCircle } from 'lucide-react';

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
  const [successMessage, setSuccessMessage] = useState('');

  const { data: labs = [], isLoading } = useQuery({
    queryKey: ['admin', 'labs'],
    queryFn: getAllLabsAdmin,
  });

  const createMutation = useMutation({
    mutationFn: createLab,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'labs']);
      setIsAdding(false);
      setSuccessMessage('Lab created successfully!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: LabFormData }) =>
      updateLab(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'labs']);
      setEditingLab(null);
      setSuccessMessage('Lab updated successfully!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLab,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'labs']);
      setSuccessMessage('Lab deleted successfully!');
    },
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
    setIsAdding(false);
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

  const handleCancel = () => {
    setEditingLab(null);
    setIsAdding(false);
    reset();
  };

  useEffect(() => {
    if (successMessage) {
      const timeout = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timeout);
    }
  }, [successMessage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full mb-4">
            <Shield className="w-5 h-5 text-orange-600 mr-2" />
            <span className="text-orange-800 font-semibold">व्यवस्थापक पैनल | Admin Panel</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            <span className="text-orange-600">लैब</span> <span className="text-green-600">प्रबंधन</span>
          </h1>
          <p className="text-lg text-gray-600">Lab Management System</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {successMessage}
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">लैब कार्य | Lab Actions</h2>
            <button
              onClick={handleAdd}
              className="bg-gradient-to-r from-orange-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-green-700 transition duration-300 flex items-center font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              नई लैब जोड़ें | Add New Lab
            </button>
          </div>
        </div>

        {/* Form */}
        {(editingLab || isAdding) && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Monitor className="w-6 h-6 mr-2 text-orange-600" />
              {editingLab ? 'लैब संपादित करें | Edit Lab' : 'नई लैब जोड़ें | Add Lab'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    लैब नाम | Lab Name
                  </label>
                  <input
                    {...register('lab_name')}
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter lab name"
                  />
                  {errors.lab_name && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.lab_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    स्थान | Location
                  </label>
                  <input
                    {...register('location')}
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter location"
                  />
                  {errors.location && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.location.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="md:w-1/2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  क्षमता | Lab Capacity
                </label>
                <input
                  type="number"
                  {...register('lab_capacity')}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter capacity"
                />
                {errors.lab_capacity && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.lab_capacity.message}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-semibold"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                >
                  {editingLab ? 'अपडेट करें | Update' : 'बनाएं | Create'}
                </button>
                <button
                  type="button"
                  className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition duration-300 font-semibold"
                  onClick={handleCancel}
                >
                  रद्द करें | Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Labs Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">लैब्स लोड हो रही हैं | Loading labs...</p>
            </div>
          ) : labs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg font-semibold">कोई लैब नहीं मिली | No labs found</p>
              <p className="text-gray-500">Click "Add New Lab" to create your first lab</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-orange-500 to-green-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">लैब नाम | Lab Name</th>
                    <th className="px-6 py-4 text-left font-semibold">स्थान | Location</th>
                    <th className="px-6 py-4 text-left font-semibold">क्षमता | Capacity</th>
                    <th className="px-6 py-4 text-left font-semibold">कार्य | Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {labs.map((lab: any, index:number) => (
                    <tr key={lab.id} className={`border-b hover:bg-gray-50 transition duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                            <Monitor className="w-5 h-5 text-orange-600" />
                          </div>
                          <span className="font-semibold text-gray-800">{lab.lab_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-gray-700">{lab.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-gray-700 font-medium">{lab.lab_capacity}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleEdit(lab)}
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition duration-200"
                            title="Edit Lab"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              window.confirm('Are you sure you want to delete this lab?') && deleteMutation.mutate(lab.id)
                            }
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition duration-200"
                            title="Delete Lab"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/admin/labs/${lab.id}/time-slots`}
                            className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition duration-200"
                            title="Manage Time Slots"
                          >
                            <Clock className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}