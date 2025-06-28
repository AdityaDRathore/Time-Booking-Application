import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1', // 👈 ensures it goes through Vite proxy
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default api;
