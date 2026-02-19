import axios, { AxiosError } from 'axios';
import type { ErrorResponse } from '../types/api.types';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const AUTH_HEADER_EXCLUDE_PATHS = [
  '/v1/auth/login',
  '/v1/auth/register',
  '/v1/auth/check-email',
  '/v1/auth/send-verification',
  '/v1/auth/verify-email',
  '/v1/auth/refresh',
];

const normalizeRequestPath = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      return new URL(url).pathname;
    } catch {
      return '';
    }
  }
  return url.startsWith('/') ? url : `/${url}`;
};

const shouldAttachAuthHeader = (url?: string): boolean => {
  if (!url) return false;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // External absolute URLs (e.g. Azure Blob SAS) must not carry bearer token.
    return false;
  }

  const path = normalizeRequestPath(url);
  // axios instance uses BASE_URL=/api and relative url like /v1/auth/login.
  const apiNormalizedPath = path.startsWith('/api/') ? path.substring(4) : path;
  return !AUTH_HEADER_EXCLUDE_PATHS.includes(apiNormalizedPath);
};

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && shouldAttachAuthHeader(config.url)) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - A002 auto refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (token) prom.resolve(token);
    else prom.reject(error);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status === 401 && error.response.data?.code === 'A002') {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      const { refreshToken, setTokens, logout } = useAuthStore.getState();

      if (!refreshToken) {
        logout();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${BASE_URL}/v1/auth/refresh`, { refreshToken });
        const { accessToken: newAccess, refreshToken: newRefresh } = res.data.data;
        setTokens(newAccess, newRefresh);
        processQueue(null, newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const loginErrorCodes = ['A003', 'A005', 'A006'];
    if (
      error.response?.status === 401 &&
      !loginErrorCodes.includes(error.response.data?.code ?? '')
    ) {
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
