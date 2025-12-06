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
      const response = await apiClient.get<{ pitches: Pitch[] }>(`/api/pods/${podId}/pitches`);
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
      const response = await apiClient.get<{ pitches: Pitch[] }>(`/api/users/${userId}/pitches`);
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
      const response = await apiClient.put<{ pitch: Pitch }>(`/api/pitches/${data.pitchId}/status`, {
        status: data.status,
      });
      return response.data.pitch;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  uploadPitchDeck: async (pitchId: string, file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('pitchDeck', file);
      const response = await apiClient.post<{ url: string }>(
        `/api/pitches/${pitchId}/pitch-deck`,
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

  getPitchesByStatus: async (podId: string, status: PitchStatus): Promise<Pitch[]> => {
    try {
      const response = await apiClient.get<{ pitches: Pitch[] }>(`/api/pods/${podId}/pitches`, {
        params: { status },
      });
      return response.data.pitches;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
