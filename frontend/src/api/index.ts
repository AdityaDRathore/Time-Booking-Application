/**
 * Ensures all Promise rejections use proper Error objects
 *
 * This fix addresses a TypeScript error where Promise rejections were not
 * guaranteed to be Error objects. The code now checks if the rejection reason
 * is an Error instance and, if not, converts it to an Error object.
 *
 * Fixed in:
 * - Request interceptor error handler
 * - Response interceptor error handler
 *
 * This ensures type safety and better error handling throughout the application.
 */
/**
 * TypeScript type declarations for Vite's import.meta.env
 *
 * These declarations extend the ImportMeta interface to include Vite-specific
 * environment variables, resolving the TypeScript error:
 * "Property 'env' does not exist on type 'ImportMeta'"
 *
 * @see https://vitejs.dev/guide/env-and-mode.html#env-files
 */
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig, // Import AxiosRequestConfig
  AxiosResponse,
  isAxiosError as axiosIsAxiosError,
} from 'axios';

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

// Define an interface for the request config with retry flag
// by extending the original AxiosRequestConfig
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
    config => {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // Response interceptor - handle common errors
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      // Cast error.config to the extended interface
      const originalRequest = error.config as ExtendedAxiosRequestConfig;

      // Handle 401 Unauthorized errors (expired token)
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Call refresh token endpoint
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            {},
            {
              withCredentials: true, // Needed for cookies
            }
          );

          const newToken = refreshResponse.data.token;
          localStorage.setItem('accessToken', newToken);

          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        } catch (refreshError) {
          // If refresh token fails, redirect to login
          localStorage.removeItem('accessToken');
          // Ensure window is defined (for SSR or test environments)
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }

          // Ensure we reject with an Error object
          if (refreshError instanceof Error) {
            return Promise.reject(refreshError);
          } else if (typeof refreshError === 'string') {
            return Promise.reject(new Error(refreshError));
          } else {
            // For other types, you might want to serialize or provide a generic message
            return Promise.reject(
              new Error(
                `An unknown error occurred during token refresh: ${JSON.stringify(refreshError)}`
              )
            );
          }
        }
      }

      return Promise.reject(error); // error here is AxiosError, which is an Error instance
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

// Common error handler
export const handleApiError = (error: unknown): string => {
  if (axiosIsAxiosError(error)) {
    const response = error.response;
    return (
      response?.data?.message ?? response?.statusText ?? error.message ?? 'Unknown error occurred'
    );
  }
  return error instanceof Error ? error.message : 'Unknown error occurred';
};
