import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscribeTelemetry } from '../services/api';

const RequestContext = createContext(null);

export const RequestProvider = ({ children }) => {
  const [requestLogs, setRequestLogs] = useState([]);
  
  // Real-time rate limit telemetry parsed from response headers
  const [rateLimitInfo, setRateLimitInfo] = useState({
    limit: 100,
    remaining: 100,
    reset: 60,
    isLimited: false,
    retryAfter: null,
    hasLiveTelemetry: false,
    lastUpdated: null,
  });

  const [authNotice, setAuthNotice] = useState(null);

  useEffect(() => {
    // Listen to all telemetry emitted from Axios interceptors
    const unsubscribe = subscribeTelemetry((entry) => {
      // 1. Prepend to live request log history (limit to 50 items)
      setRequestLogs((prev) => [entry, ...prev.slice(0, 49)]);

      // 2. Extract rate-limit telemetry from headers (case-insensitive)
      const headers = entry.responseHeaders || {};
      const limitHeader = headers['x-ratelimit-limit'];
      const remainingHeader = headers['x-ratelimit-remaining'];
      const resetHeader = headers['x-ratelimit-reset'];
      const retryAfterHeader = headers['retry-after'];

      if (remainingHeader !== undefined) {
        setRateLimitInfo({
          limit: Number(limitHeader) || 100,
          remaining: Number(remainingHeader),
          reset: Number(resetHeader) || 60,
          isLimited: entry.status === 429,
          retryAfter: retryAfterHeader || null,
          hasLiveTelemetry: true,
          lastUpdated: new Date().toLocaleTimeString(),
        });
      } else if (entry.status === 429) {
        setRateLimitInfo((prev) => ({
          ...prev,
          remaining: 0,
          isLimited: true,
          retryAfter: retryAfterHeader || entry.errorMessage,
          hasLiveTelemetry: true,
          lastUpdated: new Date().toLocaleTimeString(),
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

