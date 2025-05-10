import apiClient, { ApiResponse, handleApiError } from './index';
import { User } from '../types/user';

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  try {
    const response = await apiClient.put<ApiResponse<User>>('/users/me', userData);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Change user password
 */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    await apiClient.put('/users/me/password', { currentPassword, newPassword });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Admin functions

/**
 * Get all users (Admin only)
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get<ApiResponse<User[]>>('/admin/users');
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get user by ID (Admin only)
 */
export const getUserById = async (userId: string): Promise<User> => {
  try {
    const response = await apiClient.get<ApiResponse<User>>(`/admin/users/${userId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};