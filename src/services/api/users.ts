import apiClient, { handleApiError } from './config';
import { UserProfile, SocialLinks } from '@/types';

export interface UpdateProfileRequest {
  fullName?: string;
  profilePhoto?: string;
  professionCategory?: string;
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
  // Student fields
  collegeName?: string;
  currentCourse?: string;
  yearSemester?: string;
  interestDomain?: string;
  // Startup field
  startupFoundedYear?: string;
  // Working professional field
  workingDomain?: string;
  socialLinks?: SocialLinks;
}

export const usersApi = {
  getProfile: async (userId: string): Promise<UserProfile> => {
    try {
      const response = await apiClient.get<{ user: any }>(`/api/users/${userId}`);
      const userData = response.data.user;
      
      // Map backend URLs to socialLinks object
      return {
        ...userData,
        socialLinks: {
          linkedin: userData.linkedinUrl,
          instagram: userData.instagramUrl,
          facebook: userData.facebookUrl,
          twitter: userData.twitterUrl,
          youtube: userData.youtubeUrl,
          github: userData.githubUrl,
          portfolio: userData.portfolioUrl,
          others: userData.othersUrl,
        }
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateProfile: async (userId: string, data: UpdateProfileRequest): Promise<UserProfile> => {
    try {
      console.log('Updating profile with data:', data);
      const response = await apiClient.put<{ user: any }>(`/api/users/${userId}`, data);
      const userData = response.data.user;
      console.log('Backend returned user data:', userData);
      
      // Map backend URLs to socialLinks object
      const mappedUser = {
        ...userData,
        socialLinks: {
          linkedin: userData.linkedinUrl,
          instagram: userData.instagramUrl,
          facebook: userData.facebookUrl,
          twitter: userData.twitterUrl,
          youtube: userData.youtubeUrl,
          github: userData.githubUrl,
          portfolio: userData.portfolioUrl,
          others: userData.othersUrl,
        }
      };
      console.log('Mapped user data with social links:', mappedUser);
      return mappedUser;
    } catch (error) {
      console.error('Update profile error:', error);
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
      console.log('Fetching user by username:', username);
      const response = await apiClient.get<{ user: UserProfile }>(`/api/users/username/${username}`);
      console.log('User API response:', response.data);
      return response.data.user;
    } catch (error: any) {
      console.error('getUserByUsername error:', error.response?.data || error.message);
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
