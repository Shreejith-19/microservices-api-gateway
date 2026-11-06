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

// 8. Probe rate-limited Gateway route to capture live rate-limit headers
export const probeRateLimit = async () => {
  const token = localStorage.getItem('token');
  if (token) {
    // If authenticated, probe user profile
    const response = await api.get('/api/users/profile');
    return response.data;
  } else {
    // If unauthenticated, probe auth route which has rateLimiter attached at the Gateway layer
    // Even on auth rejection, the Gateway rateLimiter executes and sets response headers
    const response = await api.post('/api/auth/login', {
      email: 'rate-limit-probe@gateway.internal',
      password: 'probe',
    });
    return response.data;
  }
};

// 9. Send a single lightweight request subject to Gateway rate limiting
export const executeStressTestRequest = async (index) => {
  const startTime = performance.now();
  try {
    const response = await api.get('/api/auth/health', {
      params: { _burst: index, _t: Date.now() },
    });
    const durationMs = Math.round(performance.now() - startTime);
    return {
      index,
      status: response.status,
      statusText: response.statusText || 'OK',
      isSuccess: response.status >= 200 && response.status < 300,
      is429: response.status === 429,
      durationMs,
      error: null,
    };
  } catch (error) {
    const durationMs = Math.round(performance.now() - startTime);
    const status = error.response ? error.response.status : 0;
    const is429 = status === 429;
    return {
      index,
      status,
      statusText:
        error.response?.statusText || (status === 0 ? 'Network Error' : 'Error'),
      isSuccess: false,
      is429,
      durationMs,
      error: error.response?.data?.message || error.message || 'Request failed',
    };
  }
};
