import { useAuthStore } from '../state/authStore';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  isAxiosError as axiosIsAxiosError,
} from 'axios';

// TypeScript declaration for Vite env
declare global {
  interface ImportMetaEnv {
    VITE_API_BASE_URL: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const DEFAULT_TIMEOUT = 15000;

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// ✅ Create Axios instance
const createApiClient = (): AxiosInstance => {
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: DEFAULT_TIMEOUT,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // ✅ Request Interceptor - Inject Bearer token from Zustand or localStorage
  apiClient.interceptors.request.use(
    config => {
      const token = useAuthStore.getState().token || localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // ✅ Response Interceptor - Refresh token on 401
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as ExtendedAxiosRequestConfig;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            {},
            { withCredentials: true }
          );

          const { accessToken: newToken, user: newUser } = refreshResponse.data.data;


          if (newToken && newUser) {
            localStorage.setItem('accessToken', newToken);
            localStorage.setItem('user', JSON.stringify(newUser));

            useAuthStore.getState().setAuth(newUser, newToken);

            // Retry original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }

            return apiClient(originalRequest);
          }

          throw new Error('Invalid refresh response: missing token or user');
        } catch (refreshError) {
          console.error('Refresh token failed:', refreshError);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          useAuthStore.getState().clearAuth();

          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return apiClient;
};

const apiClient = createApiClient();
export default apiClient;

// ✅ Common API response type
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// ✅ Unified error message extractor
export const handleApiError = (error: unknown): string => {
  if (axiosIsAxiosError(error)) {
    const response = error.response;
    return (
      response?.data?.message ??
      response?.statusText ??
      error.message ??
      'Unknown error occurred'
    );
  }
  return error instanceof Error ? error.message : 'Unknown error occurred';
};
