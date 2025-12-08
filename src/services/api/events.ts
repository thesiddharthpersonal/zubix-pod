import apiClient, { handleApiError } from './config';
import { PodEvent, User } from '@/types';

export interface CreateEventRequest {
  podId: string;
  name: string;
  type: 'ONLINE' | 'OFFLINE';
  date: string; // ISO date string
  time: string;
  location?: string;
  description: string;
  helpline?: string;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {}

export const eventsApi = {
  // Get all events for a specific pod
  getPodEvents: async (podId: string): Promise<PodEvent[]> => {
    try {
      const response = await apiClient.get<{ events: PodEvent[] }>(`/api/events/pod/${podId}`);
      return response.data.events;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get events feed (from all joined pods)
  getEventsFeed: async (): Promise<PodEvent[]> => {
    try {
      const response = await apiClient.get<{ events: PodEvent[] }>('/api/events/feed');
      return response.data.events;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get single event by ID
  getEventById: async (eventId: string): Promise<PodEvent> => {
    try {
      const response = await apiClient.get<{ event: PodEvent }>(`/api/events/${eventId}`);
      return response.data.event;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create a new event (pod owner only)
  createEvent: async (data: CreateEventRequest): Promise<PodEvent> => {
    try {
      const response = await apiClient.post<{ event: PodEvent }>('/api/events', data);
      return response.data.event;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update an event (pod owner only)
  updateEvent: async (eventId: string, data: UpdateEventRequest): Promise<PodEvent> => {
    try {
      const response = await apiClient.put<{ event: PodEvent }>(`/api/events/${eventId}`, data);
      return response.data.event;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete an event (pod owner only)
  deleteEvent: async (eventId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/events/${eventId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Join/register for an event
  joinEvent: async (eventId: string): Promise<void> => {
    try {
      await apiClient.post(`/api/events/${eventId}/join`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Leave an event
  leaveEvent: async (eventId: string): Promise<void> => {
    try {
      await apiClient.post(`/api/events/${eventId}/leave`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get event participants
  getEventParticipants: async (eventId: string): Promise<User[]> => {
    try {
      const response = await apiClient.get<{ participants: User[] }>(`/api/events/${eventId}/participants`);
      return response.data.participants;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};