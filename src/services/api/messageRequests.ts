// Message Request API Service - Placeholder functions for backend integration

import { MessageRequest, MessageRequestStatus } from '@/types';

export interface SendMessageRequestData {
  receiverId: string;
  initialMessage: string;
}

export const messageRequestApi = {
  // Get all pending message requests received by the user
  getReceivedRequests: async (userId: string): Promise<MessageRequest[]> => {
    // TODO: Implement backend integration
    throw new Error('Not implemented');
  },

  // Get all message requests sent by the user
  getSentRequests: async (userId: string): Promise<MessageRequest[]> => {
    // TODO: Implement backend integration
    throw new Error('Not implemented');
  },

  // Send a new message request to another user
  sendRequest: async (senderId: string, data: SendMessageRequestData): Promise<MessageRequest> => {
    // TODO: Implement backend integration
    throw new Error('Not implemented');
  },

  // Accept a message request (creates a chat between the two users)
  acceptRequest: async (requestId: string): Promise<{ request: MessageRequest; chatId: string }> => {
    // TODO: Implement backend integration
    throw new Error('Not implemented');
  },

  // Reject a message request
  rejectRequest: async (requestId: string): Promise<MessageRequest> => {
    // TODO: Implement backend integration
    throw new Error('Not implemented');
  },

  // Check if a request already exists between two users
  checkExistingRequest: async (userId1: string, userId2: string): Promise<MessageRequest | null> => {
    // TODO: Implement backend integration
    throw new Error('Not implemented');
  },

  // Get count of pending requests for badge display
  getPendingCount: async (userId: string): Promise<number> => {
    // TODO: Implement backend integration
    throw new Error('Not implemented');
  },
};
