import axios from 'axios';

/**
 * Centralized Axios client for the Microservices Platform.
 * All requests route exclusively through the API Gateway (port 3000).
 * Never send direct HTTP requests to internal service ports (5001, 5002, 5003).
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Extract rate-limit headers & pass errors cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;

