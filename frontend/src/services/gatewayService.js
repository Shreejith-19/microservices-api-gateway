import api from './api';

/**
 * Service methods for interacting with the API Gateway.
 * All traffic routes strictly through the Gateway on port 3000.
 */

// 1. Gateway Health Check (Local Gateway + Redis check)
export const fetchGatewayHealth = async (options = {}) => {
  try {
    const response = await api.get('/health', options);
    return {
      isGatewayUp: true,
      httpStatus: response.status,
      data: response.data,
      isNetworkError: false,
    };
  } catch (error) {
    // If the Gateway responded with HTTP 503 (e.g. Redis disconnected),
    // the Gateway process itself is UP and responding with diagnostic JSON!
    if (error.response?.data) {
      return {
        isGatewayUp: true,
        httpStatus: error.response.status,
        data: error.response.data,
        isNetworkError: false,
      };
    }

    // Genuine network error / offline / connection refused
    return {
      isGatewayUp: false,
      httpStatus: 0,
      data: null,
      isNetworkError: true,
      errorMessage: error.message || 'Connection refused or Gateway offline',
    };
  }
};

// 2. Auth Service: Login
export const login = async (credentials) => {
  const response = await api.post('/api/auth/login', credentials);
  return response.data;
};

// 3. Auth Service: Register
export const register = async (userData) => {
  const response = await api.post('/api/auth/register', userData);
  return response.data;
};

// 4. User Service: Get Profile
export const fetchProfile = async () => {
  const response = await api.get('/api/users/profile');
  return response.data;
};

// 5. User Service: Update Profile
export const updateProfile = async (profileData) => {
  const response = await api.put('/api/users/profile', profileData);
  return response.data;
};

// 6. User Service -> Notification Service: Trigger gRPC Email
export const triggerGrpcNotification = async (payload) => {
  const response = await api.post('/api/users/test-notification', payload);
  return response.data;
};

// 7. Direct Notification REST (Protected Gateway endpoint)
export const triggerDirectNotification = async (payload) => {
  const response = await api.post('/api/notifications/send-email', payload);
  return response.data;
};
