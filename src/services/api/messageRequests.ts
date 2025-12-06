import apiClient, { handleApiError } from './config';
import { MessageRequest, MessageRequestStatus } from '@/types';

export interface SendMessageRequestData {
  receiverId: string;
  initialMessage: string;
}

export const messageRequestApi = {
  // Get all pending message requests received by the user
  getReceivedRequests: async (userId: string): Promise<MessageRequest[]> => {
    try {
      const response = await apiClient.get<{ requests: MessageRequest[] }>('/api/message-requests/received');
      return response.data.requests;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get all message requests sent by the user
  getSentRequests: async (userId: string): Promise<MessageRequest[]> => {
    try {
      const response = await apiClient.get<{ requests: MessageRequest[] }>('/api/message-requests/sent');
      return response.data.requests;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Send a new message request to another user
  sendRequest: async (senderId: string, data: SendMessageRequestData): Promise<MessageRequest> => {
    try {
      const response = await apiClient.post<{ request: MessageRequest }>('/api/message-requests', data);
      return response.data.request;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Accept a message request (creates a chat between the two users)
  acceptRequest: async (requestId: string): Promise<{ request: MessageRequest; chatId: string }> => {
    try {
      const response = await apiClient.post<{ request: MessageRequest; chatId: string }>(
        `/api/message-requests/${requestId}/accept`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Reject a message request
  rejectRequest: async (requestId: string): Promise<MessageRequest> => {
    try {
      const response = await apiClient.post<{ request: MessageRequest }>(
        `/api/message-requests/${requestId}/reject`
      );
      return response.data.request;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Check if a request already exists between two users
  checkExistingRequest: async (userId1: string, userId2: string): Promise<MessageRequest | null> => {
    try {
      const response = await apiClient.get<{ request: MessageRequest | null }>(
        '/api/message-requests/check',
        {
          params: { userId1, userId2 },
        }
      );
      return response.data.request;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get count of pending requests for badge display
  getPendingCount: async (userId: string): Promise<number> => {
    try {
      const response = await apiClient.get<{ count: number }>('/api/message-requests/pending-count');
      return response.data.count;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
