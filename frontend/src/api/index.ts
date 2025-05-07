import axios from 'axios';

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
  (config) => {
    // Get token from localStorage or memory
    const token = localStorage.getItem('accessToken');

    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;