import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchGatewayHealth } from '../services/gatewayService';

/**
 * Custom hook to monitor API Gateway and infrastructure health in real time.
 * - Polls GET /health on the Gateway every 10 seconds.
 * - Cleans up intervals and aborts in-flight requests on unmount.
 * - Prevents overlapping requests if a probe takes longer than the interval.
 * - Accurately categorizes Fail-Open Redis state vs true Gateway network outages.
 * 
 * @param {number} intervalMs - Polling interval in ms (default: 10,000ms = 10s)
 */
export const useHealthMonitor = (intervalMs = 10000) => {
  const [healthData, setHealthData] = useState(null);
  const [isGatewayResponding, setIsGatewayResponding] = useState(null); // null = unknown/initial, true = UP, false = DOWN
  const [isLoading, setIsLoading] = useState(true); // Initial load
  const [isRefreshing, setIsRefreshing] = useState(false); // Background/manual poll in-progress
  const [lastChecked, setLastChecked] = useState(null);
  const [lastSuccessfulCheck, setLastSuccessfulCheck] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  // Guards against overlapping requests & unmounted state updates
  const isRequestInProgressRef = useRef(false);
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  const checkHealth = useCallback(async (isManual = false) => {
    // Avoid overlapping health requests
    if (isRequestInProgressRef.current) {
      return;
    }

    isRequestInProgressRef.current = true;
    if (isManual) {
      setIsRefreshing(true);
    }

    // Cancel any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const result = await fetchGatewayHealth({
        signal: abortControllerRef.current.signal,
      });

      if (!isMountedRef.current) return;

      const now = new Date();
      setLastChecked(now);

      if (result.isGatewayUp && result.data) {
        // Gateway responded (either 200 UP or 503 DEGRADED with valid JSON body)
        setHealthData(result.data);
        setIsGatewayResponding(true);
        setLastSuccessfulCheck(now);
        setConnectionError(null);
      } else {
        // Genuine network error, timeout, or connection refused
        setHealthData(null);
        setIsGatewayResponding(false);
        setConnectionError(result.errorMessage || 'Failed to connect to API Gateway (Connection refused)');
      }
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        // Request was deliberately canceled
        return;
      }
      if (!isMountedRef.current) return;
      setHealthData(null);
      setIsGatewayResponding(false);
      setConnectionError(err.message || 'Network error: API Gateway unreachable');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
      isRequestInProgressRef.current = false;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    // 1. Initial health-check call when dashboard loads
    checkHealth();

    // 2. Poll every 10 seconds
    const intervalId = setInterval(() => {
      checkHealth();
    }, intervalMs);

    // 3. Clean up timer and in-flight request on unmount
    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [checkHealth, intervalMs]);

  return {
    healthData,
    isGatewayResponding,
    isLoading,
    isRefreshing,
    lastChecked,
    lastSuccessfulCheck,
    connectionError,
    refetch: () => checkHealth(true),
  };
};

export default useHealthMonitor;

