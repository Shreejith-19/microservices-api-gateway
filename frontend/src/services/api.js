import axios from 'axios';
import { sanitizePayload, sanitizeHeaders } from '../utils/sanitizer';

/**
 * Base URL strictly points to the API Gateway.
 * Configurable via VITE_API_BASE_URL (defaults to http://localhost:3000).
 * Never directly targets internal service ports (5001, 5002, 5003, 50053).
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10-second request timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Telemetry event subscribers (e.g. RequestContext)
const telemetryListeners = new Set();
let requestCounter = 0;

/**
 * Subscribe a callback to receive captured telemetry records
 * @param {Function} listener
 * @returns {Function} Unsubscribe function
 */
export const subscribeTelemetry = (listener) => {
  telemetryListeners.add(listener);
  return () => telemetryListeners.delete(listener);
};

const notifyTelemetry = (entry) => {
  telemetryListeners.forEach((listener) => {
    try {
      listener(entry);
    } catch (err) {
      console.error('[Telemetry Listener Error]:', err);
    }
  });
};

// ============================================================================
// 1. REQUEST INTERCEPTOR
// ============================================================================
api.interceptors.request.use(
  (config) => {
    requestCounter += 1;
    // Monotonic high-resolution start time and ISO timestamp
    config.metadata = {
      requestNumber: requestCounter,
      startTime: performance.now(),
      timestamp: new Date().toISOString(),
    };

    // Edge Identity: Attach Bearer JWT from localStorage if authenticated
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// 2. RESPONSE INTERCEPTOR (SUCCESS & ERROR)
// ============================================================================
api.interceptors.response.use(
  (response) => {
    const { config } = response;
    const endTime = performance.now();
    const durationMs = config.metadata?.startTime
      ? Number((endTime - config.metadata.startTime).toFixed(2))
      : 0;

    // Capture clean telemetry record
    const requestNumber = config.metadata?.requestNumber || ++requestCounter;
    const telemetryEntry = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      requestNumber,
      timestamp: config.metadata?.timestamp || new Date().toISOString(),
      timeFormatted: new Date(config.metadata?.timestamp || Date.now()).toLocaleTimeString(),
      method: (config.method || 'GET').toUpperCase(),
      url: config.url || '',
      fullUrl: `${config.baseURL || ''}${config.url || ''}`,
      status: response.status,
      statusText: response.statusText || 'OK',
      durationMs,
      responseHeaders: response.headers || {},
      requestHeaders: sanitizeHeaders(config.headers),
      requestPayload: sanitizePayload(config.data),
      responseBody: sanitizePayload(response.data),
      isError: false,
    };

    notifyTelemetry(telemetryEntry);
    return response;
  },
  (error) => {
    const config = error.config || {};
    const endTime = performance.now();
    const durationMs = config.metadata?.startTime
      ? Number((endTime - config.metadata.startTime).toFixed(2))
      : 0;

    const response = error.response;
    const status = response ? response.status : 0;
    const responseHeaders = response ? response.headers || {} : {};

    // Determine specific error categories
    let errorCategory = 'UNKNOWN';
    let errorMessage = error.message || 'An unexpected error occurred.';

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorCategory = 'TIMEOUT';
      errorMessage = 'Gateway request timed out after 10 seconds.';
    } else if (!response) {
      errorCategory = 'NETWORK_ERROR';
      errorMessage = 'Failed to reach API Gateway (network offline or connection refused).';
    } else if (status === 401) {
      errorCategory = 'UNAUTHORIZED';
      errorMessage = response.data?.message || 'Authentication required or token expired.';
    } else if (status === 429) {
      errorCategory = 'RATE_LIMITED';
      const retryAfter =
        responseHeaders['retry-after'] ||
        response.data?.retryAfter ||
        'Wait a moment before retrying.';
      errorMessage = `Rate limit exceeded (HTTP 429). Retry after: ${retryAfter}`;
    } else if (status === 502) {
      errorCategory = 'BAD_GATEWAY';
      errorMessage = response.data?.message || 'Downstream microservice unavailable.';
    }

    const requestNumber = config.metadata?.requestNumber || ++requestCounter;
    const telemetryEntry = {
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      requestNumber,
      timestamp: config.metadata?.timestamp || new Date().toISOString(),
      timeFormatted: new Date(config.metadata?.timestamp || Date.now()).toLocaleTimeString(),
      method: (config.method || 'GET').toUpperCase(),
      url: config.url || '',
      fullUrl: `${config.baseURL || ''}${config.url || ''}`,
      status: status || 0,
      statusText: response?.statusText || (errorCategory === 'NETWORK_ERROR' ? 'Network Error' : 'Error'),
      durationMs,
      responseHeaders,
      requestHeaders: sanitizeHeaders(config.headers),
      requestPayload: sanitizePayload(config.data),
      responseBody: sanitizePayload(response?.data || null),
      isError: true,
      errorCategory,
      errorMessage,
    };

    notifyTelemetry(telemetryEntry);
    return Promise.reject(error);
  }
);

export default api;
