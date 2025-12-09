import apiClient, { handleApiError } from './config';
import { CallBooking, CallBookingStatus } from '@/types';

export interface CreateCallBookingData {
  podId: string;
  targetUserId: string;
  targetRole: 'owner' | 'co-owner';
  purpose: string;
  preferredDate?: Date;
  preferredTime?: string;
}

export interface RespondToBookingData {
  bookingId: string;
  status: 'accepted' | 'rejected';
  remark?: string;
}

export const callBookingApi = {
  // Get all call booking requests made by a user
  getUserBookings: async (userId: string): Promise<CallBooking[]> => {
    try {
      const response = await apiClient.get<{ bookings: CallBooking[] }>('/api/call-bookings/requested');
      return response.data.bookings;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get all call booking requests received by a pod owner/co-owner
  getReceivedBookings: async (userId: string): Promise<CallBooking[]> => {
    try {
      const response = await apiClient.get<{ bookings: CallBooking[] }>('/api/call-bookings/received');
      return response.data.bookings;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create a new call booking request
  createBooking: async (requesterId: string, data: CreateCallBookingData): Promise<CallBooking> => {
    try {
      const response = await apiClient.post<{ booking: CallBooking }>('/api/call-bookings', data);
      return response.data.booking;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Accept or reject a booking request with optional remark
  respondToBooking: async (data: RespondToBookingData): Promise<CallBooking> => {
    try {
      const response = await apiClient.post<{ booking: CallBooking }>(
        `/api/call-bookings/${data.bookingId}/respond`,
        { status: data.status, remark: data.remark }
      );
      return response.data.booking;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Cancel a pending booking request
  cancelBooking: async (bookingId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/call-bookings/${bookingId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get count of pending bookings for badge display
  getPendingCount: async (userId: string): Promise<number> => {
    try {
      const response = await apiClient.get<{ count: number }>('/api/call-bookings/pending/count');
      return response.data.count;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
