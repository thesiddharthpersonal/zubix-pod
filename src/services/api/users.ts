import apiClient, { handleApiError } from './config';
import { UserProfile, SocialLinks } from '@/types';

export interface UpdateProfileRequest {
  fullName?: string;
  profilePhoto?: string;
  organisationName?: string;
  brandName?: string;
  designation?: string;
  workingExperienceFrom?: Date;
  workingExperienceTo?: Date;
  startupSubcategory?: string;
  businessType?: string;
  briefAboutOrganisation?: string;
  operatingCity?: string;
  website?: string;
  socialLinks?: SocialLinks;
}

export const usersApi = {
  getProfile: async (userId: string): Promise<UserProfile> => {
    try {
      const response = await apiClient.get<{ user: UserProfile }>(`/api/users/${userId}`);
      return response.data.user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateProfile: async (userId: string, data: UpdateProfileRequest): Promise<UserProfile> => {
    try {
      const response = await apiClient.put<{ user: UserProfile }>(`/api/users/${userId}`, data);
      return response.data.user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  uploadProfilePhoto: async (userId: string, file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const response = await apiClient.post<{ url: string }>(
        `/api/users/${userId}/profile-photo`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data.url;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  searchUsers: async (query: string): Promise<UserProfile[]> => {
    try {
      const response = await apiClient.get<{ users: UserProfile[] }>('/api/users/search', {
        params: { q: query },
      });
      return response.data.users;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getUserByUsername: async (username: string): Promise<UserProfile> => {
    try {
      const response = await apiClient.get<{ user: UserProfile }>(`/api/users/username/${username}`);
      return response.data.user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  completeUserRegistration: async (
    userId: string,
    data: UpdateProfileRequest
  ): Promise<UserProfile> => {
    try {
      const response = await apiClient.post<{ user: UserProfile }>(
        `/api/users/${userId}/complete-registration`,
        data
      );
      return response.data.user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
