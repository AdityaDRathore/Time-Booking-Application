import axios from 'axios';
import { useAuthStore } from '../state/authStore'; // ✅ Zustand store

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ✅ Inject Authorization token from Zustand (with fallback)
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token || localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
