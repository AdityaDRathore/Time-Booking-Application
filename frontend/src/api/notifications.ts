import apiClient, { ApiResponse, handleApiError } from './index';
import { Notification } from '../types/notification';

/**
 * Fetch user notifications from query key
 */
export const getUserNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Notification[]>>('/notifications');
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
