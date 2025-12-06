import apiClient, { handleApiError } from './config';

export type ReactionType = 'like' | 'love' | 'celebrate' | 'support' | 'insightful';

export interface Reaction {
  id: string;
  userId: string;
  entityId: string;
  entityType: 'post' | 'comment';
  type: ReactionType;
  createdAt: Date;
}

export interface AddReactionRequest {
  entityId: string;
  entityType: 'post' | 'comment';
  type: ReactionType;
}

export const reactionsApi = {
  addReaction: async (data: AddReactionRequest): Promise<Reaction> => {
    try {
      // Map entityId to postId or commentId based on entityType
      const payload = data.entityType === 'post' 
        ? { postId: data.entityId, type: data.type }
        : { commentId: data.entityId, type: data.type };
      
      const response = await apiClient.post<{ reaction: Reaction }>('/api/reactions', payload);
      return response.data.reaction;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  removeReaction: async (reactionId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/reactions/${reactionId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getEntityReactions: async (entityId: string, entityType: 'post' | 'comment'): Promise<Reaction[]> => {
    try {
      const response = await apiClient.get<{ reactions: Reaction[] }>('/api/reactions', {
        params: { entityId, entityType },
      });
      return response.data.reactions;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getUserReaction: async (entityId: string, entityType: 'post' | 'comment', userId: string): Promise<Reaction | null> => {
    try {
      const response = await apiClient.get<{ reaction: Reaction | null }>('/api/reactions/user', {
        params: { entityId, entityType, userId },
      });
      return response.data.reaction;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
