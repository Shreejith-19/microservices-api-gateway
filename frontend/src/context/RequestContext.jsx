import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscribeTelemetry } from '../services/api';

const RequestContext = createContext(null);

export const RequestProvider = ({ children }) => {
  const [requestLogs, setRequestLogs] = useState([]);
  
  // Real-time rate limit telemetry parsed from response headers
  const [rateLimitInfo, setRateLimitInfo] = useState({
    status: 'INITIAL', // 'INITIAL' | 'MEASURED' | 'UNAVAILABLE' | 'RATE_LIMITED'
    limit: null,
    remaining: null,
    reset: null,
    consumed: null,
    percentageConsumed: null,
    percentageRemaining: null,
    isLimited: false,
    retryAfter: null,
    lastEndpoint: null,
    lastMethod: null,
    lastHttpStatus: null,
    lastUpdated: null,
    diagnosticNote: 'Awaiting ingress API response to inspect rate-limit headers.',
    rawHeaders: {
      limit: null,
      remaining: null,
      reset: null,
      retryAfter: null,
    },
    lastValidMeasurement: null,
  });

  const [authNotice, setAuthNotice] = useState(null);

  useEffect(() => {
    // Listen to all telemetry emitted from Axios interceptors
    const unsubscribe = subscribeTelemetry((entry) => {
      // 1. Prepend to live request log history (limit to 100 items) - kept separate from rate limit state
      setRequestLogs((prev) => [entry, ...prev.slice(0, 99)]);

      // 2. Extract rate-limit telemetry from headers (case-insensitive lookup)
      const headers = entry.responseHeaders || {};
      const getHeader = (name) => {
        const target = name.toLowerCase();
        for (const key of Object.keys(headers)) {
          if (key.toLowerCase() === target) {
            return headers[key];
          }
        }
        return undefined;
      };

      const rawLimit = getHeader('x-ratelimit-limit');
      const rawRemaining = getHeader('x-ratelimit-remaining');
      const rawReset = getHeader('x-ratelimit-reset');
      const rawRetryAfter =
        getHeader('retry-after') ||
        (entry.responseBody && entry.responseBody.retryAfter);

      const endpointLabel = `${entry.method} ${entry.url || '/'}`;
      const now = new Date().toLocaleTimeString();

      // CASE A: HTTP 429 Too Many Requests (Rate limit exhausted)
      if (entry.status === 429) {
        const limit = rawLimit !== undefined ? Number(rawLimit) : 100;
        const remaining = 0;
        const reset =
          rawReset !== undefined
            ? Number(rawReset)
            : typeof rawRetryAfter === 'number'
            ? rawRetryAfter
            : 60;
        const consumed = limit;
        const percentageConsumed = 100;
        const percentageRemaining = 0;
        const retryAfter = rawRetryAfter || `${reset}s`;

        setRateLimitInfo((prev) => ({
          status: 'RATE_LIMITED',
          limit,
          remaining,
          reset,
          consumed,
          percentageConsumed,
          percentageRemaining,
          isLimited: true,
          retryAfter,
          lastEndpoint: endpointLabel,
          lastMethod: entry.method,
          lastHttpStatus: 429,
          lastUpdated: now,
          diagnosticNote: `HTTP 429 Too Many Requests received from ${endpointLabel}. Distributed quota threshold exceeded on Redis.`,
          rawHeaders: {
            limit: rawLimit ?? String(limit),
            remaining: rawRemaining ?? '0',
            reset: rawReset ?? String(reset),
            retryAfter: String(retryAfter),
          },
          lastValidMeasurement: {
            limit,
            remaining: 0,
            reset,
            percentageConsumed: 100,
            timestamp: now,
            endpoint: endpointLabel,
          },
        }));
      }
      // CASE B: Real Rate-Limit Measurement (Gateway headers present)
      else if (rawRemaining !== undefined && rawRemaining !== null) {
        const limit = Number(rawLimit) || 100;
        const remaining = Math.max(0, Number(rawRemaining));
        const reset = rawReset !== undefined ? Number(rawReset) : 60;
        const consumed = Math.max(0, limit - remaining);
        const percentageConsumed = Math.min(
          100,
          Math.max(0, Math.round((consumed / limit) * 100))
        );
        const percentageRemaining = Math.min(
          100,
          Math.max(0, Math.round((remaining / limit) * 100))
        );

        setRateLimitInfo((prev) => ({
          status: 'MEASURED',
          limit,
          remaining,
          reset,
          consumed,
          percentageConsumed,
          percentageRemaining,
          isLimited: false,
          retryAfter: null,
          lastEndpoint: endpointLabel,
          lastMethod: entry.method,
          lastHttpStatus: entry.status,
          lastUpdated: now,
          diagnosticNote: `Real rate-limit measurement received from ${endpointLabel}. Atomic Redis counter synchronized.`,
          rawHeaders: {
            limit: rawLimit ?? String(limit),
            remaining: String(remaining),
            reset: rawReset ?? String(reset),
            retryAfter: null,
          },
          lastValidMeasurement: {
            limit,
            remaining,
            reset,
            percentageConsumed,
            timestamp: now,
            endpoint: endpointLabel,
          },
        }));
      }
      // CASE C: Unavailable Measurement (Headers missing on response)
      else {
        setRateLimitInfo((prev) => ({
          status: 'UNAVAILABLE',
          limit: null,
          remaining: null,
          reset: null,
          consumed: null,
          percentageConsumed: null,
          percentageRemaining: null,
          isLimited: false,
          retryAfter: null,
          lastEndpoint: endpointLabel,
          lastMethod: entry.method,
          lastHttpStatus: entry.status,
          lastUpdated: now,
          diagnosticNote: `Endpoint ${endpointLabel} (HTTP ${entry.status}) did not return X-RateLimit headers. Rate limiting may not be mounted on this route or headers were omitted. No values fabricated.`,
          rawHeaders: {
            limit: null,
            remaining: null,
            reset: null,
            retryAfter: null,
          },
          lastValidMeasurement: prev.lastValidMeasurement || null,
        }));
      }

      // 3. Handle 401 Unauthorized distinctly
      if (entry.status === 401) {
        setAuthNotice({
          timestamp: entry.timestamp,
          message: entry.errorMessage || 'Session expired or invalid token.',
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const clearLogs = useCallback(() => {
    setRequestLogs([]);
  }, []);

  const clearAuthNotice = useCallback(() => {
    setAuthNotice(null);
  }, []);

  return (
    <RequestContext.Provider
      value={{
        requestLogs,
        rateLimitInfo,
        authNotice,
        clearLogs,
        clearAuthNotice,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useRequestTelemetry = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequestTelemetry must be used within a RequestProvider');
  }
  return context;
};

export default RequestContext;

