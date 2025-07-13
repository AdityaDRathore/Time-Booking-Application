// src/api/admin/users.ts
import api from '../../services/apiClient';
import { User } from '../../types/user';

/**
 * Get all users in admin's organization
 */
export const getAllUsers = async (): Promise<User[]> => {
  const res = await api.get('/admin/users');
  return res.data.data; // ✅ extract from { success, data }
};

/**
 * Get details of a specific user
 */
export const getUserDetails = async (userId: string): Promise<User> => {
  const res = await api.get(`/admin/users/${userId}`);
  return res.data.data; // ✅ extract from { success, data }
};
