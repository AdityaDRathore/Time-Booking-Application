import api from '../../services/apiClient';
import { User } from '../../types/user';

export const getAllUsers = async (): Promise<User[]> => {
  const res = await api.get('/admin/users');
  return res.data;
};

export const getUserDetails = async (userId: string): Promise<User> => {
  const res = await api.get(`/admin/users/${userId}`);
  return res.data;
};
