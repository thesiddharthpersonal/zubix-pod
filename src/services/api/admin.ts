import apiClient, { handleApiError } from './config';

export interface AdminStats {
  users: { total: number; recent: number };
  pods: { total: number };
  posts: { total: number; recent: number };
  events: { total: number };
  rooms: { total: number };
  chats: { total: number };
}

export interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  mobile: string;
  role: string;
  avatar: string | null;
  createdAt: Date;
  _count: {
    posts: number;
    ownedPods: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const adminApi = {
  // Dashboard Stats
  getStats: async (): Promise<AdminStats> => {
    try {
      const response = await apiClient.get<{ stats: AdminStats }>('/api/admin/stats');
      return response.data.stats;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // User Management
  getUsers: async (params?: { page?: number; limit?: number; search?: string; role?: string }) => {
    try {
      const response = await apiClient.get('/api/admin/users', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateUserRole: async (userId: string, role: string) => {
    try {
      const response = await apiClient.patch(`/api/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteUser: async (userId: string) => {
    try {
      const response = await apiClient.delete(`/api/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Pod Management
  getPods: async (params?: { page?: number; limit?: number; search?: string }) => {
    try {
      const response = await apiClient.get('/api/admin/pods', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deletePod: async (podId: string) => {
    try {
      const response = await apiClient.delete(`/api/admin/pods/${podId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Post Management
  getPosts: async (params?: { page?: number; limit?: number; search?: string }) => {
    try {
      const response = await apiClient.get('/api/admin/posts', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deletePost: async (postId: string) => {
    try {
      const response = await apiClient.delete(`/api/admin/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Event Management
  getEvents: async (params?: { page?: number; limit?: number; search?: string }) => {
    try {
      const response = await apiClient.get('/api/admin/events', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteEvent: async (eventId: string) => {
    try {
      const response = await apiClient.delete(`/api/admin/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Room Management
  getRooms: async (params?: { page?: number; limit?: number; search?: string }) => {
    try {
      const response = await apiClient.get('/api/admin/rooms', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteRoom: async (roomId: string) => {
    try {
      const response = await apiClient.delete(`/api/admin/rooms/${roomId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
