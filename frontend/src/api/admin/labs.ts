// src/api/admin/labs.ts
import api from '../../services/apiClient';
import { Lab } from '../../types/lab';

/**
 * Fetch all labs (Admin View)
 */
export const getAllLabsAdmin = async (): Promise<Lab[]> => {
  const response = await api.get('/admin/labs');
  return response.data.data; // ✅ Fix: extract labs from success wrapper
};

/**
 * Create a new lab
 */
export const createLab = async (labData: Partial<Lab>): Promise<Lab> => {
  const response = await api.post('/admin/labs', labData);
  return response.data.data; // ✅ Fix: extract created lab
};

/**
 * Update an existing lab
 */
export const updateLab = async (
  id: string,
  payload: { lab_name: string; location: string }
): Promise<Lab> => {
  const res = await api.put(`/admin/labs/${id}`, payload);
  return res.data.data; // ✅ Fix: extract updated lab
};

/**
 * Delete a lab
 */
export const deleteLab = async (labId: string): Promise<void> => {
  await api.delete(`/admin/labs/${labId}`);
};
