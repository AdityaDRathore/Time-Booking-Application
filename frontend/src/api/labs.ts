import { Lab } from '../types/lab';

import apiClient, { ApiResponse, handleApiError } from './index';

/**
 * Get all available labs
 */
export const getAllLabs = async (): Promise<Lab[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Lab[]>>('/labs');
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get lab by ID
 */
export const getLabById = async (labId: string): Promise<Lab> => {
  try {
    const response = await apiClient.get<ApiResponse<Lab>>(`/labs/${labId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Admin functions

/**
 * Create new lab (Admin only)
 */
export const createLab = async (
  labData: Omit<Lab, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Lab> => {
  try {
    const response = await apiClient.post<ApiResponse<Lab>>('/admin/labs', labData);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update lab (Admin only)
 */
export const updateLab = async (labId: string, labData: Partial<Lab>): Promise<Lab> => {
  try {
    const response = await apiClient.put<ApiResponse<Lab>>(`/admin/labs/${labId}`, labData);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Delete lab (Admin only)
 */
export const deleteLab = async (labId: string): Promise<void> => {
  try {
    await apiClient.delete(`/admin/labs/${labId}`);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};


