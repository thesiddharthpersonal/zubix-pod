import apiClient, { handleApiError } from './config';
import { Room, Message, Question, Answer } from '@/types';

export interface CreateRoomRequest {
  podId: string;
  name: string;
  description?: string;
  privacy: 'PUBLIC' | 'PRIVATE';
  type: 'GENERAL' | 'QA';
}

export interface SendMessageRequest {
  roomId: string;
  content: string;
}

export interface CreateQuestionRequest {
  roomId: string;
  content: string;
}

export interface CreateAnswerRequest {
  questionId: string;
  content: string;
}

export const roomsApi = {
  // Get all rooms for a pod
  getPodRooms: async (podId: string): Promise<Room[]> => {
    try {
      const response = await apiClient.get<{ rooms: Room[] }>(`/api/rooms/pod/${podId}`);
      return response.data.rooms;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get single room details
  getRoomById: async (roomId: string): Promise<Room> => {
    try {
      const response = await apiClient.get<{ room: Room }>(`/api/rooms/${roomId}`);
      return response.data.room;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create a new room (pod owner only)
  createRoom: async (data: CreateRoomRequest): Promise<Room> => {
    try {
      const response = await apiClient.post<{ room: Room }>('/api/rooms', data);
      return response.data.room;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update room
  updateRoom: async (roomId: string, data: Partial<CreateRoomRequest>): Promise<Room> => {
    try {
      const response = await apiClient.put<{ room: Room }>(`/api/rooms/${roomId}`, data);
      return response.data.room;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete room (pod owner only)
  deleteRoom: async (roomId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/rooms/${roomId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Add member to room (pod owner only)
  addMember: async (roomId: string, userId: string): Promise<void> => {
    try {
      await apiClient.post(`/api/rooms/${roomId}/members`, { userId });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Remove member from room (pod owner only)
  removeMember: async (roomId: string, userId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/rooms/${roomId}/members/${userId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get room messages (GENERAL rooms)
  getRoomMessages: async (roomId: string, limit?: number, before?: string): Promise<Message[]> => {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (before) params.append('before', before);
      
      const response = await apiClient.get<{ messages: Message[] }>(
        `/api/rooms/${roomId}/messages${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data.messages;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Q&A Room - Get questions
  getRoomQuestions: async (roomId: string): Promise<Question[]> => {
    try {
      const response = await apiClient.get<{ questions: Question[] }>(`/api/rooms/${roomId}/questions`);
      return response.data.questions;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Q&A Room - Create question
  createQuestion: async (roomId: string, content: string): Promise<Question> => {
    try {
      const response = await apiClient.post<{ question: Question }>(`/api/rooms/${roomId}/questions`, { content });
      return response.data.question;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Q&A Room - Delete question
  deleteQuestion: async (roomId: string, questionId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/rooms/${roomId}/questions/${questionId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Q&A Room - Get answers for a question
  getQuestionAnswers: async (roomId: string, questionId: string): Promise<Answer[]> => {
    try {
      const response = await apiClient.get<{ answers: Answer[] }>(`/api/rooms/${roomId}/questions/${questionId}/answers`);
      return response.data.answers;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Q&A Room - Create answer
  createAnswer: async (roomId: string, questionId: string, content: string): Promise<Answer> => {
    try {
      const response = await apiClient.post<{ answer: Answer }>(`/api/rooms/${roomId}/questions/${questionId}/answers`, { content });
      return response.data.answer;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Q&A Room - Delete answer
  deleteAnswer: async (roomId: string, questionId: string, answerId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/rooms/${roomId}/questions/${questionId}/answers/${answerId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
