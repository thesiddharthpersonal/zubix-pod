import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Configuration
const APP_ENV = import.meta.env.VITE_APP_ENV || 'development';
console.log(`App Environment: ${APP_ENV}`);
const PRODUCTION_API_URL = 'https://podapi.zoobalo.com';

// Auto-detect if accessing from mobile device (not localhost)
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const NETWORK_API_URL = 'http://192.168.1.4:3000';
const LOCALHOST_API_URL = 'http://localhost:3000';
const DEVELOPMENT_API_URL = isLocalhost ? LOCALHOST_API_URL : NETWORK_API_URL;

// Automatically set API URL based on environment
export const API_BASE_URL = APP_ENV === 'production' 
  ? PRODUCTION_API_URL 
  : (import.meta.env.VITE_API_BASE_URL || DEVELOPMENT_API_URL);

export const WS_URL = APP_ENV === 'production'
  ? PRODUCTION_API_URL
  : (import.meta.env.VITE_WS_URL || DEVELOPMENT_API_URL);

console.log(`API Base URL: ${API_BASE_URL}`);
console.log(`WebSocket URL: ${WS_URL}`);

// Token management
const TOKEN_KEY = 'zubix_auth_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Handle specific error codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          removeAuthToken();
          window.location.href = '/login';
          break;
        case 403:
          console.error('Forbidden - You do not have permission');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error - Please try again later');
          break;
        default:
          console.error('API Error:', JSON.stringify(error.response.data, null, 2));
      }
    } else if (error.request) {
      console.error('Network error - Please check your connection');
    } else {
      console.error('Error:', error.message);
    }
    
    // Log full error details for debugging
    if (error.response?.data) {
      console.error('Full error response:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// Helper function to handle API errors
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ 
      message?: string; 
      error?: string; 
      errors?: Array<{ msg: string; path?: string }>;
    }>;
    
    const response = axiosError.response;
    
    // Handle no response (network error)
    if (!response) {
      if (axiosError.code === 'ERR_NETWORK') {
        return 'Unable to connect to the server. Please check your internet connection and try again.';
      }
      if (axiosError.code === 'ECONNABORTED') {
        return 'Request timed out. Please try again.';
      }
      return 'Network error. Please check your connection and try again.';
    }
    
    // Handle validation errors (400 with errors array)
    if (response.status === 400 && response.data?.errors) {
      const validationErrors = response.data.errors
        .map(err => err.msg)
        .join(', ');
      return validationErrors || 'Please check your input and try again.';
    }
    
    // Handle specific status codes
    switch (response.status) {
      case 400:
        return response.data?.message || response.data?.error || 'Invalid request. Please check your input.';
      case 401:
        return response.data?.message || response.data?.error || 'You need to be logged in to perform this action.';
      case 403:
        return response.data?.message || response.data?.error || 'You do not have permission to perform this action.';
      case 404:
        return response.data?.message || response.data?.error || 'The requested resource was not found.';
      case 409:
        return response.data?.message || response.data?.error || 'This item already exists.';
      case 413:
        return 'File size is too large. Please upload a smaller file.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return response.data?.message || response.data?.error || 'Server error. Please try again later.';
      case 502:
      case 503:
        return 'Service temporarily unavailable. Please try again in a few moments.';
      default:
        return response.data?.message || response.data?.error || 'An error occurred. Please try again.';
    }
  }
  
  // Handle non-Axios errors
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};
