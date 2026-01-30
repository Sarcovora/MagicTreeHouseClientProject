// src/services/apiClient.js
import axios from 'axios';
import { auth } from '../firebase';

// --- Configuration ---
const DEFAULT_API_BASE = 'http://localhost:3000';
const apiBaseFromEnv = (import.meta?.env?.VITE_API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, '');
const apiPrefix = import.meta?.env?.VITE_API_PREFIX ?? '/api';

console.log('API Configuration:', {
  envValue: import.meta?.env?.VITE_API_BASE_URL,
  finalBase: apiBaseFromEnv,
  fullURL: `${apiBaseFromEnv}${apiPrefix}`
});

export const apiClient = axios.create({
  baseURL: `${apiBaseFromEnv}${apiPrefix}`,
  timeout: 45000,
});

apiClient.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const token = await currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error("Unable to attach auth token:", error);
    }
  }
  return config;
});

export default apiClient;
