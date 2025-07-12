import axios from 'axios';
import { useAuthStore } from '../state/authStore';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ required to send refresh token cookie
});

// ✅ Add access token to all requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token || localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔁 Refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Call backend to refresh access token using cookie
        const res = await api.post('/auth/refresh-token');
        const newToken = res.data.data.accessToken;
        const user = res.data.data.user;

        // ✅ Update Zustand store
        useAuthStore.getState().setAuth(user, newToken);

        // ✅ Retry the original failed request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('🔁 Token refresh failed:', refreshError);
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
