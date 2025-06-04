import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  isAxiosError as axiosIsAxiosError,
} from 'axios';
import { useAuthStore } from '../state/authStore'; // Adjust path if needed

// TypeScript declaration for Vite env
declare global {
  interface ImportMetaEnv {
    VITE_API_BASE_URL: string;
    // Add other env variables as needed
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// API base URL - should match your backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Default timeout in milliseconds
const DEFAULT_TIMEOUT = 15000;

// Extend AxiosRequestConfig to add _retry flag for token refresh logic
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Creates and configures the Axios instance for API requests
 */
const createApiClient = (): AxiosInstance => {
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: DEFAULT_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // Request interceptor - adds auth token to requests
  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // Response interceptor - handle 401 errors and token refresh
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as ExtendedAxiosRequestConfig;

      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Attempt to refresh token
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            {},
            { withCredentials: true }
          );

          const newToken = refreshResponse.data.token;
          localStorage.setItem('accessToken', newToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh token failed - logout user
          localStorage.removeItem('accessToken');
          const store = useAuthStore.getState();
          store.logout();

          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }

          if (refreshError instanceof Error) {
            return Promise.reject(refreshError);
          } else if (typeof refreshError === 'string') {
            return Promise.reject(new Error(refreshError));
          } else {
            return Promise.reject(
              new Error(
                `An unknown error occurred during token refresh: ${JSON.stringify(refreshError)}`
              )
            );
          }
        }
      } else if (error.response?.status === 401) {
        // Other 401 errors after retry or no retry - logout user
        localStorage.removeItem('accessToken');
        const store = useAuthStore.getState();
        store.logout();

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }

      return Promise.reject(error);
    }
  );

  return apiClient;
};

// Create and export the API client instance
const apiClient = createApiClient();

export default apiClient;

// Common API response type
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// Common error handler function
export const handleApiError = (error: unknown): string => {
  if (axiosIsAxiosError(error)) {
    const response = error.response;
    return (
      response?.data?.message ?? response?.statusText ?? error.message ?? 'Unknown error occurred'
    );
  }
  return error instanceof Error ? error.message : 'Unknown error occurred';
};
