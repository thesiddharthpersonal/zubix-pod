import apiClient, { handleApiError } from './config';
import { Pod, PodSubcategory, SocialLinks } from '@/types';

export interface CreatePodRequest {
  name: string;
  logo?: string;
  subcategory: PodSubcategory;
  focusAreas: string[];
  organisationName: string;
  organisationType: 'GOVERNMENT' | 'PRIVATE';
  operatingCity: string;
  totalInvestmentSize?: string;
  numberOfInvestments?: number;
  briefAboutOrganisation?: string;
  socialLinks: SocialLinks;
  coOwnerUsernames?: string[];
}

export interface UpdatePodRequest extends Partial<CreatePodRequest> {}

export const podsApi = {
  getAllPods: async (): Promise<Pod[]> => {
    try {
      const response = await apiClient.get<{ pods: Pod[] }>('/api/pods');
      return response.data.pods;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getPodById: async (podId: string): Promise<Pod> => {
    try {
      const response = await apiClient.get<{ pod: Pod }>(`/api/pods/${podId}`);
      return response.data.pod;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getPodsBySubcategory: async (subcategory: PodSubcategory): Promise<Pod[]> => {
    try {
      const response = await apiClient.get<{ pods: Pod[] }>('/api/pods/subcategory', {
        params: { subcategory },
      });
      return response.data.pods;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createPod: async (data: CreatePodRequest): Promise<Pod> => {
    try {
      const response = await apiClient.post<{ pod: Pod }>('/api/pods', data);
      return response.data.pod;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updatePod: async (podId: string, data: UpdatePodRequest): Promise<Pod> => {
    try {
      const response = await apiClient.put<{ pod: Pod }>(`/api/pods/${podId}`, data);
      return response.data.pod;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deletePod: async (podId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/pods/${podId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  joinPod: async (podId: string, userId: string): Promise<void> => {
    try {
      await apiClient.post(`/api/pods/${podId}/join`, { userId });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  leavePod: async (podId: string, userId: string): Promise<void> => {
    try {
      await apiClient.post(`/api/pods/${podId}/leave`, { userId });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getPodMembers: async (podId: string): Promise<string[]> => {
    try {
      const response = await apiClient.get<{ members: string[] }>(`/api/pods/${podId}/members`);
      return response.data.members;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  addCoOwner: async (podId: string, username: string): Promise<void> => {
    try {
      await apiClient.post(`/api/pods/${podId}/co-owners`, { username });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  removeCoOwner: async (podId: string, userId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/pods/${podId}/co-owners/${userId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  uploadPodLogo: async (podId: string, file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const response = await apiClient.post<{ url: string }>(
        `/api/pods/${podId}/logo`,
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

  searchPods: async (query: string): Promise<Pod[]> => {
    try {
      const response = await apiClient.get<{ pods: Pod[] }>('/api/pods/search', {
        params: { q: query },
      });
      return response.data.pods;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getJoinedPods: async (userId: string): Promise<Pod[]> => {
    try {
      const response = await apiClient.get<{ pods: Pod[] }>(`/api/users/${userId}/pods`);
      return response.data.pods;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
