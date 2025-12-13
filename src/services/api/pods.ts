import apiClient, { handleApiError } from './config';
import { Pod, PodSubcategory, SocialLinks } from '@/types';

export interface CreatePodRequest {
  name: string;
  logo?: string;
  subcategory: PodSubcategory;
  focusAreas: string[];
  organisationName: string;
  organisationType: 'GOVERNMENT' | 'PRIVATE';
  organisationEmail?: string;
  operatingCity: string;
  website?: string;
  totalInvestmentSize?: string;
  numberOfInvestments?: number;
  briefAboutOrganisation?: string;
  socialLinks: SocialLinks;
  coOwnerUsernames?: string[];
  // Advanced fields
  supportedDomains?: string[];
  supportedStages?: string[];
  communityType?: string;
  investmentAreas?: string[];
  investmentStages?: string[];
  chequeSize?: string;
  investmentThesis?: string;
  serviceType?: string;
  programmeDuration?: string;
  numberOfStartups?: number;
  focusedSectors?: string[];
  benefits?: string;
  innovationFocusArea?: string;
  collaborationModel?: string;
  fundingGrantSupport?: string;
  schemeName?: string;
  programmeObjectives?: string;
  benefitsOffered?: string;
  eligibilityCriteria?: string;
  eventsConducted?: string[];
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

  getPodMembers: async (podId: string): Promise<import('@/types').User[]> => {
    try {
      const response = await apiClient.get<{ members: import('@/types').User[] }>(`/api/pods/${podId}/members`);
      return response.data.members;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  promoteToCoOwner: async (podId: string, userId: string): Promise<void> => {
    try {
      await apiClient.post(`/api/pods/${podId}/members/${userId}/promote`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  demoteCoOwner: async (podId: string, userId: string): Promise<void> => {
    try {
      await apiClient.post(`/api/pods/${podId}/members/${userId}/demote`);
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

  getJoinedPods: async (): Promise<Pod[]> => {
    try {
      const response = await apiClient.get<{ pods: Pod[] }>('/api/pods/joined');
      return response.data.pods;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  toggleAcceptingPitches: async (podId: string, acceptingPitches: boolean): Promise<{ pod: Pod; message: string }> => {
    try {
      const response = await apiClient.patch<{ pod: Pod; message: string }>(
        `/api/pods/${podId}/accepting-pitches`,
        { acceptingPitches }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Team Member Management
  assignTeamMember: async (podId: string, userId: string): Promise<{ message: string; member: any }> => {
    try {
      const response = await apiClient.post<{ message: string; member: any }>(
        `/api/pods/${podId}/members/${userId}/assign-team-member`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  removeTeamMember: async (podId: string, userId: string): Promise<{ message: string; member: any }> => {
    try {
      const response = await apiClient.delete<{ message: string; member: any }>(
        `/api/pods/${podId}/members/${userId}/remove-team-member`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getTeamMembers: async (podId: string): Promise<any[]> => {
    try {
      const response = await apiClient.get<{ teamMembers: any[] }>(`/api/pods/${podId}/team-members`);
      return response.data.teamMembers;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
