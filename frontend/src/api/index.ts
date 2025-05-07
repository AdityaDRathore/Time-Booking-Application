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
import axios from 'axios';

// TypeScript declaration for Vite env
declare global {
  interface ImportMetaEnv {
    VITE_API_URL: string;
    // Add other env variables as needed
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// Base URL from environment variables or default to localhost
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Create an Axios instance with default configuration
const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  config => {
    // Get token from localStorage or memory
    const token = localStorage.getItem('accessToken');

    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error instanceof Error ? error : new Error(String(error)))
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  response => response,
  async error => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }

    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

export default apiClient;
