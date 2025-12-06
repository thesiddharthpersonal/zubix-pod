import apiClient, { setAuthToken, removeAuthToken, handleApiError } from './config';

export interface LoginRequest {
  emailOrMobile: string;
  password: string;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    mobile: string;
    username: string;
    role: 'user' | 'pod_owner';
    profilePhoto?: string;
    createdAt: string;
  };
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
      if (response.data.token) {
        setAuthToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/signup', data);
      if (response.data.token) {
        setAuthToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/auth/logout');
      removeAuthToken();
    } catch (error) {
      // Even if the server request fails, clear local token
      removeAuthToken();
      throw new Error(handleApiError(error));
    }
  },

  refreshToken: async (): Promise<{ token: string }> => {
    try {
      const response = await apiClient.post<{ token: string }>('/api/auth/refresh');
      if (response.data.token) {
        setAuthToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    try {
      await apiClient.post('/api/auth/forgot-password', { email });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    try {
      await apiClient.post('/api/auth/reset-password', { token, newPassword });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  verifyEmail: async (token: string): Promise<void> => {
    try {
      await apiClient.post('/api/auth/verify-email', { token });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    try {
      const response = await apiClient.get<{ user: AuthResponse['user'] }>('/api/auth/me');
      return response.data.user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateRoleToPodOwner: async (): Promise<AuthResponse> => {
    try {
      const response = await apiClient.put<AuthResponse>('/api/auth/role/pod-owner');
      if (response.data.token) {
        setAuthToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
