import apiClient from './config';
import { JobApplication, JobType } from '@/types';

export const jobsApi = {
  // Get all job applications
  getAll: async (filters?: { type?: JobType; domain?: string }): Promise<JobApplication[]> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.domain) params.append('domain', filters.domain);
    
    const url = `/api/jobs${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get<{ applications: JobApplication[] }>(url);
    return response.data.applications;
  },

  // Get a single job application
  getById: async (applicationId: string): Promise<JobApplication> => {
    const response = await apiClient.get<{ application: JobApplication }>(`/api/jobs/${applicationId}`);
    return response.data.application;
  },

  // Create a new job application
  create: async (data: {
    candidateName: string;
    type: JobType;
    domain: string;
    brief: string;
    resumeUrl: string;
    contactEmail?: string;
    contactPhone?: string;
  }): Promise<JobApplication> => {
    const response = await apiClient.post<{ application: JobApplication }>('/api/jobs', data);
    return response.data.application;
  },

  // Update a job application
  update: async (applicationId: string, data: {
    candidateName?: string;
    type?: JobType;
    domain?: string;
    brief?: string;
    resumeUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
  }): Promise<JobApplication> => {
    const response = await apiClient.put<{ application: JobApplication }>(`/api/jobs/${applicationId}`, data);
    return response.data.application;
  },

  // Delete a job application
  delete: async (applicationId: string): Promise<void> => {
    await apiClient.delete(`/api/jobs/${applicationId}`);
  },
};
