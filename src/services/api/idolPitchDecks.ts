import api from './config';
import { IdolPitchDeck } from '@/types';

export const idolPitchDecksApi = {
  getAll: async (): Promise<IdolPitchDeck[]> => {
    const response = await api.get('/api/idol-pitch-decks');
    return response.data.data;
  },

  getById: async (deckId: string): Promise<IdolPitchDeck> => {
    const response = await api.get(`/api/idol-pitch-decks/${deckId}`);
    return response.data.data;
  },

  create: async (data: {
    title: string;
    companyName: string;
    pdfUrl: string;
    description?: string;
    thumbnailUrl?: string;
  }): Promise<IdolPitchDeck> => {
    const response = await api.post('/api/idol-pitch-decks', data);
    return response.data.data;
  },

  update: async (
    deckId: string,
    data: Partial<{
      title: string;
      companyName: string;
      pdfUrl: string;
      description: string;
      thumbnailUrl: string;
      isActive: boolean;
    }>
  ): Promise<IdolPitchDeck> => {
    const response = await api.put(`/api/idol-pitch-decks/${deckId}`, data);
    return response.data.data;
  },

  delete: async (deckId: string): Promise<void> => {
    await api.delete(`/api/idol-pitch-decks/${deckId}`);
  },
};
