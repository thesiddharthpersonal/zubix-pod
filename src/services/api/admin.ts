import axios from 'axios';
import { API_BASE_URL, handleApiError } from './config';

// Admin token management (separate from user token)
const getAdminToken = (): string | null => {
  return localStorage.getItem('adminToken');
};

// Create separate axios instance for admin API
const adminApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add admin token to requests
adminApiClient.interceptors.request.use(
  (config) => {
    const token = getAdminToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for admin-specific error handling
adminApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Unauthorized/Forbidden - clear admin token and redirect to admin login
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export interface AdminStats {
  users: { total: number; recent: number };
  pods: { total: number; pending: number };
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
      const response = await adminApiClient.get<{ stats: AdminStats }>('/api/admin/stats');
      return response.data.stats;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // User Management
  getUsers: async (params?: { page?: number; limit?: number; search?: string; role?: string }) => {
    try {
      const response = await adminApiClient.get('/api/admin/users', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateUserRole: async (userId: string, role: string) => {
    try {
      const response = await adminApiClient.patch(`/api/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteUser: async (userId: string) => {
    try {
      const response = await adminApiClient.delete(`/api/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Pod Management
  getPods: async (params?: { page?: number; limit?: number; search?: string }) => {
    try {
      const response = await adminApiClient.get('/api/admin/pods', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deletePod: async (podId: string) => {
    try {
      const response = await adminApiClient.delete(`/api/admin/pods/${podId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getPendingPods: async (params?: { page?: number; limit?: number }) => {
    try {
      const response = await adminApiClient.get('/api/admin/pods/pending', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  approvePod: async (podId: string) => {
    try {
      const response = await adminApiClient.patch(`/api/admin/pods/${podId}/approve`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  rejectPod: async (podId: string, reason?: string) => {
    try {
      const response = await adminApiClient.patch(`/api/admin/pods/${podId}/reject`, { reason });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Post Management
  getPosts: async (params?: { page?: number; limit?: number; search?: string }) => {
    try {
      const response = await adminApiClient.get('/api/admin/posts', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deletePost: async (postId: string) => {
    try {
      const response = await adminApiClient.delete(`/api/admin/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Event Management
  getEvents: async (params?: { page?: number; limit?: number; search?: string }) => {
    try {
      const response = await adminApiClient.get('/api/admin/events', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteEvent: async (eventId: string) => {
    try {
      const response = await adminApiClient.delete(`/api/admin/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Room Management
  getRooms: async (params?: { page?: number; limit?: number; search?: string }) => {
    try {
      const response = await adminApiClient.get('/api/admin/rooms', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteRoom: async (roomId: string) => {
    try {
      const response = await adminApiClient.delete(`/api/admin/rooms/${roomId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Notification Management
  getAllUsers: async () => {
    try {
      const response = await adminApiClient.get('/api/admin/users/all');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  sendNotification: async (data: {
    recipientType: 'all' | 'specific' | 'role';
    recipientId?: string;
    role?: string;
    title: string;
    message: string;
    type?: string;
  }) => {
    try {
      const response = await adminApiClient.post('/api/admin/notifications/send', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
