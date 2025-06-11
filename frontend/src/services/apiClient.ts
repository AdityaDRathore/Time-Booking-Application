// src/services/apiClient.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // ✅ update baseURL to match your backend
  withCredentials: true,
});

export default api;
