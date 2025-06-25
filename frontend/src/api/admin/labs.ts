// src/api/admin/labs.ts
import api from '../../services/apiClient';
import { Lab } from '../../types/lab';

/**
 * Fetch all labs (Admin View)
 */
export const getAllLabsAdmin = async (): Promise<Lab[]> => {
  const response = await api.get('/admin/labs');
  return response.data;
};

/**
 * Create a new lab
 */
export const createLab = async (labData: Partial<Lab>): Promise<Lab> => {
  const response = await api.post('/admin/labs', labData);
  return response.data;
};

/**
 * Update an existing lab
 */
export const updateLab = async (id: string, payload: { lab_name: string; location: string }) => {
  const res = await api.put(`/admin/labs/${id}`, payload);
  return res.data;
};


/**
 * Delete a lab
 */
export const deleteLab = async (labId: string): Promise<void> => {
  await api.delete(`/admin/labs/${labId}`);
};
