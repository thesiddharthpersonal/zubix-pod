import apiClient, { handleApiError } from './config';
import { Chat, Message } from '@/types';

export interface CreateChatRequest {
  participantIds: string[];
}

export interface SendDMRequest {
  chatId: string;
  content: string;
}

export const chatApi = {
  getUserChats: async (userId: string): Promise<Chat[]> => {
    try {
      const response = await apiClient.get<{ chats: Chat[] }>(`/api/users/${userId}/chats`);
      return response.data.chats;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getChatById: async (chatId: string): Promise<Chat> => {
    try {
      const response = await apiClient.get<{ chat: Chat }>(`/api/chats/${chatId}`);
      return response.data.chat;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getChatByParticipants: async (participantIds: string[]): Promise<Chat | null> => {
    try {
      const response = await apiClient.get<{ chat: Chat | null }>('/api/chats/find', {
        params: { participantIds: participantIds.join(',') },
      });
      return response.data.chat;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createChat: async (data: CreateChatRequest): Promise<Chat> => {
    try {
      const response = await apiClient.post<{ chat: Chat }>('/api/chats', data);
      return response.data.chat;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getChatMessages: async (chatId: string): Promise<Message[]> => {
    try {
      const response = await apiClient.get<{ messages: Message[] }>(`/api/chats/${chatId}/messages`);
      return response.data.messages;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  sendMessage: async (data: SendDMRequest): Promise<Message> => {
    try {
      const response = await apiClient.post<{ message: Message }>('/api/chats/messages', data);
      return response.data.message;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/chats/messages/${messageId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  markAsRead: async (chatId: string, userId: string): Promise<void> => {
    try {
      await apiClient.post(`/api/chats/${chatId}/read`, { userId });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getOrCreateChat: async (currentUserId: string, targetUserId: string): Promise<Chat> => {
    try {
      const response = await apiClient.post<{ chat: Chat }>('/api/chats/get-or-create', {
        currentUserId,
        targetUserId,
      });
      return response.data.chat;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
