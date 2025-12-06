import apiClient, { handleApiError } from './config';

export interface Notification {
  id: string;
  userId: string;
  type: 'pod_invite' | 'event_reminder' | 'pitch_update' | 'message_request' | 'call_booking' | 'post_like' | 'post_comment' | 'room_message';
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export const notificationsApi = {
  getUserNotifications: async (userId: string): Promise<Notification[]> => {
    try {
      const response = await apiClient.get<{ notifications: Notification[] }>('/api/notifications');
      return response.data.notifications;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getUnreadCount: async (userId: string): Promise<number> => {
    try {
      const response = await apiClient.get<{ count: number }>('/api/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    try {
      await apiClient.put(`/api/notifications/${notificationId}/read`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  markAllAsRead: async (userId: string): Promise<void> => {
    try {
      await apiClient.put('/api/notifications/read-all');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/notifications/${notificationId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
