import apiClient from './config';

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: string;
  author: {
    id: string;
    fullName: string;
    username: string;
    profilePhoto?: string;
  };
}

export interface CreateCommentRequest {
  content: string;
}

export const commentsApi = {
  /**
   * Get comments for a post
   */
  async getComments(postId: string): Promise<Comment[]> {
    const response = await apiClient.get<{ comments: Comment[] }>(`/api/posts/${postId}/comments`);
    return response.data.comments;
  },

  /**
   * Add a comment to a post
   */
  async addComment(postId: string, data: CreateCommentRequest): Promise<Comment> {
    const response = await apiClient.post<{comment: Comment}>(`/api/posts/${postId}/comments`, data);
    return response.data.comment;
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<void> {
    await apiClient.delete(`/api/comments/${commentId}`);
  },
};
