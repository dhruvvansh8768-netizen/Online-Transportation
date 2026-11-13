import axios from 'axios';

/**
 * Axios instance with base URL and interceptors
 * Automatically attaches auth token and handles common errors
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'demo-token') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && localStorage.getItem('token') !== 'demo-token') {
      const { status } = error.response;

      // Token expired or unauthorized
      if (status === 401) {
        localStorage.removeItem('token');
        // Only redirect if not already on auth page
        if (!window.location.pathname.startsWith('/login') &&
            !window.location.pathname.startsWith('/signup') &&
            !window.location.pathname.startsWith('/forgot-password')) {
          window.location.href = '/login';
        }
      }

      // Forbidden
      if (status === 403) {
        console.error('Access forbidden');
      }

      // Server error
      if (status >= 500) {
        console.error('Server error:', error.response.data?.message);
      }
    } else if (error.request) {
      console.error('Network error — no response received');
    }

    return Promise.reject(error);
  }
);

export default api;
