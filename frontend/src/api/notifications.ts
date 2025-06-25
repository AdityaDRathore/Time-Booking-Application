import apiClient, { ApiResponse, handleApiError } from './index';
import { Notification } from '../types/notification';

/**
 * Fetch user notifications (with optional filter)
 */
export const getUserNotifications = async (
  filter?: string
): Promise<Notification[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Notification[]>>('/notifications', {
      params: filter ? { filter } : undefined,
    });
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string
): Promise<Notification> => {
  try {
    const response = await apiClient.patch<ApiResponse<Notification>>(
      `/notifications/${notificationId}/read`
    );
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<{ updatedCount: number }> => {
  try {
    const response = await apiClient.patch<ApiResponse<{ updatedCount: number }>>(
      '/notifications/read-all'
    );
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};


