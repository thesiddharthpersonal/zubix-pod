import apiClient, { handleApiError } from './config';
import { Room, Message, Question, Answer } from '@/types';

export interface CreateRoomRequest {
  podId: string;
  name: string;
  privacy: 'public' | 'private';
  type: 'general' | 'qa';
  memberIds?: string[];
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
  getPodRooms: async (podId: string): Promise<Room[]> => {
    try {
      const response = await apiClient.get<{ rooms: Room[] }>(`/api/pods/${podId}/rooms`);
      return response.data.rooms;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getRoomById: async (roomId: string): Promise<Room> => {
    try {
      const response = await apiClient.get<{ room: Room }>(`/api/rooms/${roomId}`);
      return response.data.room;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createRoom: async (data: CreateRoomRequest): Promise<Room> => {
    try {
      const response = await apiClient.post<{ room: Room }>('/api/rooms', data);
      return response.data.room;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateRoom: async (roomId: string, data: Partial<CreateRoomRequest>): Promise<Room> => {
    try {
      const response = await apiClient.put<{ room: Room }>(`/api/rooms/${roomId}`, data);
      return response.data.room;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteRoom: async (roomId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/rooms/${roomId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  addMember: async (roomId: string, userId: string): Promise<void> => {
    try {
      await apiClient.post(`/api/rooms/${roomId}/members`, { userId });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  removeMember: async (roomId: string, userId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/rooms/${roomId}/members/${userId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // General Room Messages
  getRoomMessages: async (roomId: string): Promise<Message[]> => {
    try {
      const response = await apiClient.get<{ messages: Message[] }>(`/api/rooms/${roomId}/messages`);
      return response.data.messages;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  sendMessage: async (data: SendMessageRequest): Promise<Message> => {
    try {
      const response = await apiClient.post<{ message: Message }>('/api/rooms/messages', data);
      return response.data.message;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/rooms/messages/${messageId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Q&A Room
  getRoomQuestions: async (roomId: string): Promise<Question[]> => {
    try {
      const response = await apiClient.get<{ questions: Question[] }>(`/api/rooms/${roomId}/questions`);
      return response.data.questions;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createQuestion: async (data: CreateQuestionRequest): Promise<Question> => {
    try {
      const response = await apiClient.post<{ question: Question }>('/api/rooms/questions', data);
      return response.data.question;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteQuestion: async (questionId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/rooms/questions/${questionId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getQuestionAnswers: async (questionId: string): Promise<Answer[]> => {
    try {
      const response = await apiClient.get<{ answers: Answer[] }>(`/api/rooms/questions/${questionId}/answers`);
      return response.data.answers;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createAnswer: async (data: CreateAnswerRequest): Promise<Answer> => {
    try {
      const response = await apiClient.post<{ answer: Answer }>('/api/rooms/answers', data);
      return response.data.answer;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteAnswer: async (answerId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/rooms/answers/${answerId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
