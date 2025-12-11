import apiClient from './config';
import { StartupIdea } from '@/types';

export const startupIdeasApi = {
  // Get all startup ideas
  getAll: async (): Promise<StartupIdea[]> => {
    const response = await apiClient.get<{ ideas: StartupIdea[] }>('/api/startup-ideas');
    return response.data.ideas;
  },

  // Get a single startup idea
  getById: async (ideaId: string): Promise<StartupIdea> => {
    const response = await apiClient.get<{ idea: StartupIdea }>(`/api/startup-ideas/${ideaId}`);
    return response.data.idea;
  },

  // Create a new startup idea
  create: async (data: {
    title: string;
    description: string;
    category?: string;
    tags?: string[];
  }): Promise<StartupIdea> => {
    const response = await apiClient.post<{ idea: StartupIdea }>('/api/startup-ideas', data);
    return response.data.idea;
  },

  // Update a startup idea
  update: async (ideaId: string, data: {
    title?: string;
    description?: string;
    category?: string;
    tags?: string[];
  }): Promise<StartupIdea> => {
    const response = await apiClient.put<{ idea: StartupIdea }>(`/api/startup-ideas/${ideaId}`, data);
    return response.data.idea;
  },

  // Delete a startup idea
  delete: async (ideaId: string): Promise<void> => {
    await apiClient.delete(`/api/startup-ideas/${ideaId}`);
  },
};
