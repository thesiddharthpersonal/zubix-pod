import apiClient, { handleApiError } from './config';
import { Pitch, PitchStatus, StartupStage } from '@/types';

export interface CreatePitchRequest {
  podId: string;
  startupName: string;
  pitchDeckUrl?: string;
  summary: string;
  sector: string;
  stage: StartupStage;
  ask: string;
  operatingCity: string;
  website?: string;
  contactEmail: string;
  contactPhone: string;
}

export interface UpdatePitchStatusRequest {
  pitchId: string;
  status: PitchStatus;
}

export const pitchesApi = {
  getPodPitches: async (podId: string): Promise<Pitch[]> => {
    try {
      const response = await apiClient.get<{ pitches: Pitch[] }>(`/api/pitches/pod/${podId}`);
      return response.data.pitches;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getPitchById: async (pitchId: string): Promise<Pitch> => {
    try {
      const response = await apiClient.get<{ pitch: Pitch }>(`/api/pitches/${pitchId}`);
      return response.data.pitch;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getUserPitches: async (userId: string): Promise<Pitch[]> => {
    try {
      const response = await apiClient.get<{ pitches: Pitch[] }>(`/api/pitches/user/${userId}`);
      return response.data.pitches;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createPitch: async (data: CreatePitchRequest): Promise<Pitch> => {
    try {
      const response = await apiClient.post<{ pitch: Pitch }>('/api/pitches', data);
      return response.data.pitch;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updatePitch: async (pitchId: string, data: Partial<CreatePitchRequest>): Promise<Pitch> => {
    try {
      const response = await apiClient.put<{ pitch: Pitch }>(`/api/pitches/${pitchId}`, data);
      return response.data.pitch;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deletePitch: async (pitchId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/pitches/${pitchId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updatePitchStatus: async (data: UpdatePitchStatusRequest): Promise<Pitch> => {
    try {
      const response = await apiClient.patch<{ pitch: Pitch }>(`/api/pitches/${data.pitchId}/status`, {
        status: data.status,
      });
      return response.data.pitch;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  uploadPitchDeck: async (pitchId: string, file: File): Promise<string> => {
    try {
      // First, upload the file to S3 public folder and get the URL
      const uploadApi = (await import('./upload')).uploadApi;
      const fileUrl = await uploadApi.uploadFile(file, 'public');
      
      // Then, update the pitch with the pitch deck URL
      const response = await apiClient.post<{ pitch: Pitch }>(
        `/api/pitches/${pitchId}/pitch-deck`,
        { pitchDeckUrl: fileUrl }
      );
      
      return fileUrl;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getPitchesByStatus: async (podId: string, status: PitchStatus): Promise<Pitch[]> => {
    try {
      const response = await apiClient.get<{ pitches: Pitch[] }>(`/api/pitches/pod/${podId}`, {
        params: { status },
      });
      return response.data.pitches;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
