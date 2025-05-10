import { Notification } from '../types/notification';

import apiClient, { ApiResponse, handleApiError } from './index';

/**
 * Get all notifications for current user
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
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await apiClient.put(`/notifications/${notificationId}/read`);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await apiClient.put('/notifications/read-all');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    await apiClient.delete(`/notifications/${notificationId}`);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
