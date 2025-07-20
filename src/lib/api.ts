import { useAuthStore } from '@/store/auth.store';
import axios from 'axios';
import { toast } from 'sonner';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 403) {
      toast.error('Unauthorized');
      useAuthStore.getState().logout();
    }
    const apiError = error as ApiError;
    return Promise.reject(apiError.response?.data || {message: 'An error occurred'});
  }
);

export default api; 