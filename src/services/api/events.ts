import apiClient, { handleApiError } from './config';
import { PodEvent } from '@/types';

export interface CreateEventRequest {
  podId: string;
  name: string;
  type: 'online' | 'offline';
  date: Date;
  time: string;
  location?: string;
  description: string;
  helpline?: string;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {}

export const eventsApi = {
  getPodEvents: async (podId: string): Promise<PodEvent[]> => {
    try {
      const response = await apiClient.get<{ events: PodEvent[] }>(`/api/pods/${podId}/events`);
      return response.data.events;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getAllEvents: async (podIds: string[]): Promise<PodEvent[]> => {
    try {
      const response = await apiClient.get<{ events: PodEvent[] }>('/api/events', {
        params: { podIds: podIds.join(',') },
      });
      return response.data.events;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getUpcomingEvents: async (podIds: string[]): Promise<PodEvent[]> => {
    try {
      const response = await apiClient.get<{ events: PodEvent[] }>('/api/events/upcoming', {
        params: { podIds: podIds.join(',') },
      });
      return response.data.events;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getEventById: async (eventId: string): Promise<PodEvent> => {
    try {
      const response = await apiClient.get<{ event: PodEvent }>(`/api/events/${eventId}`);
      return response.data.event;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createEvent: async (data: CreateEventRequest): Promise<PodEvent> => {
    try {
      const response = await apiClient.post<{ event: PodEvent }>('/api/events', data);
      return response.data.event;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateEvent: async (eventId: string, data: UpdateEventRequest): Promise<PodEvent> => {
    try {
      const response = await apiClient.put<{ event: PodEvent }>(`/api/events/${eventId}`, data);
      return response.data.event;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/events/${eventId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  registerForEvent: async (eventId: string, userId: string): Promise<void> => {
    try {
      await apiClient.post(`/api/events/${eventId}/register`, { userId });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  unregisterFromEvent: async (eventId: string, userId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/events/${eventId}/register`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getEventRegistrations: async (eventId: string): Promise<string[]> => {
    try {
      const response = await apiClient.get<{ registrations: string[] }>(`/api/events/${eventId}/registrations`);
      return response.data.registrations;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
