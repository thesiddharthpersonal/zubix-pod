import apiClient, { handleApiError } from './config';
import { Post, Comment } from '@/types';

export interface CreatePostRequest {
  podId: string;
  content: string;
  mediaUrls?: string[];
  mediaType?: 'image' | 'video';
}

export interface CreateCommentRequest {
  postId: string;
  content: string;
}

export const postsApi = {
  getFeedPosts: async (podIds: string[], filter?: 'all' | 'owner' | 'members'): Promise<Post[]> => {
    try {
      const response = await apiClient.get<{ posts: Post[] }>('/api/posts/feed', {
        params: { podIds: podIds.join(','), filter },
      });
      return response.data.posts;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getPodPosts: async (podId: string, filter?: 'all' | 'owner' | 'members'): Promise<Post[]> => {
    try {
      const response = await apiClient.get<{ posts: Post[] }>(`/api/pods/${podId}/posts`, {
        params: { filter },
      });
      return response.data.posts;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getPostById: async (postId: string): Promise<Post> => {
    try {
      const response = await apiClient.get<{ post: Post }>(`/api/posts/${postId}`);
      return response.data.post;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createPost: async (data: CreatePostRequest): Promise<Post> => {
    try {
      const response = await apiClient.post<{ post: Post }>('/api/posts', data);
      return response.data.post;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updatePost: async (postId: string, content: string): Promise<Post> => {
    try {
      const response = await apiClient.put<{ post: Post }>(`/api/posts/${postId}`, { content });
      return response.data.post;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deletePost: async (postId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/posts/${postId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  likePost: async (postId: string, userId: string): Promise<void> => {
    try {
      await apiClient.post(`/api/posts/${postId}/like`, { userId });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  unlikePost: async (postId: string, userId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/posts/${postId}/like`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getComments: async (postId: string): Promise<Comment[]> => {
    try {
      const response = await apiClient.get<{ comments: Comment[] }>(`/api/posts/${postId}/comments`);
      return response.data.comments;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  addComment: async (data: CreateCommentRequest): Promise<Comment> => {
    try {
      const response = await apiClient.post<{ comment: Comment }>('/api/posts/comments', data);
      return response.data.comment;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteComment: async (commentId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/posts/comments/${commentId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  uploadMedia: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('media', file);
      const response = await apiClient.post<{ url: string }>('/api/posts/upload-media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.url;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
