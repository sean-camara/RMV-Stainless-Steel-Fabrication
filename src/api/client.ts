/// <reference types="vite/client" />
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Normalize VITE_API_URL: accept either `http://host:port` or `http://host:port/api`
const rawUrl = (import.meta as any).env?.VITE_API_URL;
let API_URL: string;
if (rawUrl) {
  const trimmed = rawUrl.replace(/\/+$/, '');
  API_URL = trimmed.includes('/api') ? trimmed : `${trimmed}/api`;
} else {
  API_URL = 'http://localhost:5000/api';
}

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Don't retry for login/register/refresh endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                           originalRequest.url?.includes('/auth/register') ||
                           originalRequest.url?.includes('/auth/refresh');

    // If error is 401 and we haven't retried yet and it's not an auth endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      const refreshToken = sessionStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          sessionStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear tokens
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          sessionStorage.removeItem('user');
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// Helper to create an abortable request wrapper
export const withAbort = <T>(request: (signal: AbortSignal) => Promise<T>) => {
  const controller = new AbortController();
  const promise = request(controller.signal);
  return { promise, cancel: () => controller.abort() };
};

export default api;
