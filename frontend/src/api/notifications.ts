import apiClient, { ApiResponse, handleApiError } from './index';
import { Notification } from '../types/notification';

/**
 * Fetch user notifications from query key
 */
export const getUserNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await apiClient.get<ApiResponse<any[]>>('/notifications');

    // Transform backend structure into frontend `Notification` type
    return response.data.data.map((n) => ({
      id: n.id,
      type: n.notification_type,
      message: n.notification_message,
      isRead: n.read,
      userId: n.user_id,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
      metadata: n.metadata || {},
    }));
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
    const response = await apiClient.patch<ApiResponse<any>>(
      `/notifications/${notificationId}/read`
    );

    const n = response.data.data;
    return {
      id: n.id,
      type: n.notification_type,
      message: n.notification_message,
      isRead: n.read,
      userId: n.user_id,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
      metadata: n.metadata || {},
    };
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
