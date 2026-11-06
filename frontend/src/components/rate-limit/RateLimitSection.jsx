import React, { useState, useEffect } from 'react';
import { 
  Gauge, 
  Flame, 
  RotateCcw, 
  Database, 
  ShieldAlert,
  Zap,
  Activity,
  AlertTriangle,
  Clock,
  Terminal
} from 'lucide-react';
import { useRequestTelemetry } from '../../context/RequestContext';
import { fetchGatewayHealth, probeRateLimit } from '../../services/gatewayService';

export const RateLimitSection = () => {
  const { rateLimitInfo } = useRequestTelemetry();
  const [burstTesting, setBurstTesting] = useState(false);
  const [singleTesting, setSingleTesting] = useState(false);
  const [healthTesting, setHealthTesting] = useState(false);
  const [showRawHeaders, setShowRawHeaders] = useState(false);
  
  // Real-time countdown ticker for reset time (TTL)
  const [countdown, setCountdown] = useState(rateLimitInfo.reset || 60);

  useEffect(() => {
    if (rateLimitInfo.reset !== null && rateLimitInfo.reset !== undefined) {
      setCountdown(rateLimitInfo.reset);
    }
  }, [rateLimitInfo.reset, rateLimitInfo.lastUpdated]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Derived state values
  const status = rateLimitInfo.status; // 'INITIAL' | 'MEASURED' | 'UNAVAILABLE' | 'RATE_LIMITED'
  const isMeasured = status === 'MEASURED';
  const isUnavailable = status === 'UNAVAILABLE';
  const is429 = status === 'RATE_LIMITED' || rateLimitInfo.isLimited;
  const isInitial = status === 'INITIAL';

  const limit = rateLimitInfo.limit ?? 100;
  const remaining = rateLimitInfo.remaining ?? 0;
  const consumed = rateLimitInfo.consumed ?? (limit - remaining);
  const percentageConsumed = rateLimitInfo.percentageConsumed ?? 0;
  const percentageRemaining = rateLimitInfo.percentageRemaining ?? 100;

  // Color theme transitions based on quota remaining:
  // Green: plenty of requests remaining (> 40%)
  // Yellow: approaching limit (15% - 40%)
  // Red: limit nearly exhausted (<= 15%) or HTTP 429
  const getTheme = () => {
    if (is429) {
      return {
        barColor: 'bg-rose-500',
        textColor: 'text-rose-400',
        badgeBg: 'bg-rose-500/15',
        badgeBorder: 'border-rose-500/30',
        badgeText: 'text-rose-300',
        statusLabel: 'HTTP 429 RATE LIMITED',
        glow: 'shadow-[0_0_12px_rgba(244,63,94,0.35)]',
      };
    }
    if (isMeasured) {
      if (percentageRemaining > 40) {
        return {
          barColor: 'bg-emerald-500',
          textColor: 'text-emerald-400',
          badgeBg: 'bg-emerald-500/15',
          badgeBorder: 'border-emerald-500/30',
          badgeText: 'text-emerald-300',
          statusLabel: 'PLENTY REMAINING',
          glow: 'shadow-[0_0_12px_rgba(16,185,129,0.25)]',
        };
      } else if (percentageRemaining > 15) {
        return {
          barColor: 'bg-amber-500',
          textColor: 'text-amber-400',
          badgeBg: 'bg-amber-500/15',
          badgeBorder: 'border-amber-500/30',
          badgeText: 'text-amber-300',
          statusLabel: 'APPROACHING LIMIT',
          glow: 'shadow-[0_0_12px_rgba(245,158,11,0.3)]',
        };
      } else {
        return {
          barColor: 'bg-rose-500',
          textColor: 'text-rose-400',
          badgeBg: 'bg-rose-500/15',
          badgeBorder: 'border-rose-500/30',
          badgeText: 'text-rose-300',
          statusLabel: 'NEARLY EXHAUSTED',
          glow: 'shadow-[0_0_12px_rgba(244,63,94,0.35)]',
        };
      }
    }
    if (isUnavailable) {
      return {
        barColor: 'bg-slate-700',
        textColor: 'text-amber-400',
        badgeBg: 'bg-amber-500/10',
        badgeBorder: 'border-amber-500/30',
        badgeText: 'text-amber-300',
        statusLabel: 'MEASUREMENT UNAVAILABLE',
        glow: '',
      };
    }
    // Initial state
    return {
      barColor: 'bg-slate-800',
      textColor: 'text-slate-400',
      badgeBg: 'bg-slate-800',
      badgeBorder: 'border-slate-700',
      badgeText: 'text-slate-400',
      statusLabel: 'AWAITING INGRESS RESPONSE',
      glow: '',
    };
  };

  const theme = getTheme();

  // Trigger a single rate-limited request through Gateway
  const handleSingleProbe = async () => {
    setSingleTesting(true);
    try {
      await probeRateLimit();
    } catch {
      // Telemetry interceptor captures both success and error responses
    } finally {
      setSingleTesting(false);
    }
  };

  // Trigger an unmonitored request (/health) to demonstrate graceful missing-header handling
  const handleHealthProbe = async () => {
    setHealthTesting(true);
    try {
      await fetchGatewayHealth();
    } catch {
      // Telemetry captures automatically
    } finally {
      setHealthTesting(false);
    }
  };

  // Trigger a burst of 15 requests through the Gateway to observe the counter decrementing
  const handleBurstTest = async () => {
    setBurstTesting(true);
    const promises = Array.from({ length: 15 }, () =>
      probeRateLimit().catch(() => {})
    );
    await Promise.all(promises);
    setBurstTesting(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
              Redis Rate Limit Monitor
            </h2>
            <p className="text-xs text-slate-400">
              Distributed sliding-window enforcement via Gateway response headers
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-mono px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText}`}
          >
            {isMeasured && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
            {is429 && <ShieldAlert className="w-3 h-3 text-rose-400" />}
            {isUnavailable && <AlertTriangle className="w-3 h-3 text-amber-400" />}
            {isInitial && <Clock className="w-3 h-3 text-slate-400" />}
            {theme.statusLabel}
          </span>

          <span className="text-[11px] font-mono px-2 py-1 rounded bg-slate-950 text-slate-400 border border-slate-800 flex items-center gap-1">
            <Database className="w-3 h-3 text-rose-400" /> Redis Cluster
          </span>
        </div>
      </div>

      {/* 2. State-Specific Alert / Diagnostic Banners */}

      {/* CASE A: HTTP 429 Alert Banner */}
      {is429 && (
        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs">
          <div className="flex items-center gap-2 text-rose-400 font-bold font-mono mb-1.5">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            HTTP 429 Too Many Requests — Quota Exceeded
          </div>
          <p className="text-slate-300 text-xs mb-2 leading-relaxed">
            The client rate exceeded the maximum limit within the current sliding window. The API Gateway throttled downstream service proxying.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/70 p-2.5 rounded border border-rose-500/20">
            <div>
              <span className="text-slate-500">RETRY-AFTER: </span>
              <span className="text-rose-300 font-bold">{rateLimitInfo.retryAfter || `${countdown}s`}</span>
            </div>
            <div>
              <span className="text-slate-500">X-RATELIMIT-REMAINING: </span>
              <span className="text-rose-300 font-bold">0</span>
            </div>
          </div>
        </div>
      )}

      {/* CASE B: Unavailable Measurement Banner (Missing backend headers) */}
      {isUnavailable && (
        <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold font-mono mb-1.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Measurement Unavailable on Latest Ingress Response
          </div>
          <p className="text-slate-300 text-xs mb-2 leading-relaxed">
            The latest response from <code className="text-amber-300 font-mono">{rateLimitInfo.lastEndpoint || 'last endpoint'}</code> (HTTP {rateLimitInfo.lastHttpStatus || 200}) did not contain <code className="text-amber-200">X-RateLimit-*</code> headers.
          </p>
          <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2 rounded border border-amber-500/20 space-y-1">
            <div>• <strong className="text-slate-300">Why this occurs:</strong> The Gateway mounts rate limiting on proxy routes (<code className="text-indigo-300">/api/auth/*</code>, <code className="text-indigo-300">/api/users/*</code>, <code className="text-indigo-300">/api/notifications/*</code>). Endpoints like <code className="text-indigo-300">/health</code> bypass rate limiting to prevent health checks from exhausting user quotas.</div>
            <div>• <strong className="text-slate-300">Zero-Fabrication Guarantee:</strong> Values are not simulated. Click "Send Rate-Limited Request" to inspect live Redis quota headers.</div>
          </div>

          {/* Fallback Reference to last valid measurement */}
          {rateLimitInfo.lastValidMeasurement && (
            <div className="mt-2.5 pt-2 border-t border-amber-500/20 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Last Valid Measurement ({rateLimitInfo.lastValidMeasurement.endpoint}):</span>
              <span className="text-slate-200 font-bold">
                {rateLimitInfo.lastValidMeasurement.remaining} / {rateLimitInfo.lastValidMeasurement.limit} remaining ({rateLimitInfo.lastValidMeasurement.percentageConsumed}% consumed)
              </span>
            </div>
          )}
        </div>
      )}

      {/* CASE C: Initial State Info Banner */}
      {isInitial && (
        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Awaiting initial API response to inspect live rate-limit headers.</span>
          </div>
          <button
            type="button"
            onClick={handleSingleProbe}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
          >
            Probe Gateway Now
          </button>
        </div>
      )}

      {/* 3. Main Quota Metric Cards (Active when MEASURED, RATE_LIMITED, or referencing previous measurement) */}
      {(isMeasured || is429) && (
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
          {/* Top Metric Values */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-3 border-b border-slate-800/70">
            {/* Maximum Limit */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                Rate Limit Maximum
              </span>
              <span className="text-lg sm:text-xl font-bold font-mono text-slate-200">
                {limit} <span className="text-xs font-normal text-slate-500">reqs/win</span>
              </span>
            </div>

            {/* Remaining Requests */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                Remaining Requests
              </span>
              <span className={`text-lg sm:text-xl font-bold font-mono ${theme.textColor}`}>
                {remaining} <span className="text-xs font-normal text-slate-500">({percentageRemaining}%)</span>
              </span>
            </div>

            {/* Percentage Consumed */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                Quota Consumed
              </span>
              <span className="text-lg sm:text-xl font-bold font-mono text-indigo-300">
                {percentageConsumed}% <span className="text-xs font-normal text-slate-500">({consumed} used)</span>
              </span>
            </div>

            {/* Reset Time (Countdown) */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                Reset Time (TTL)
              </span>
              <span className="text-lg sm:text-xl font-bold font-mono text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {countdown}s
              </span>
            </div>
          </div>

          {/* Progress Bar with Color Transitions */}
          <div>
            <div className="flex justify-between items-center text-[11px] font-mono mb-1.5">
              <span className="text-slate-400 flex items-center gap-1">
                <span>Quota Remaining</span>
                <span className={`font-bold ${theme.textColor}`}>({remaining} of {limit})</span>
              </span>
              <span className="text-slate-400">
                Consumed: <strong className="text-slate-200">{percentageConsumed}%</strong>
              </span>
            </div>

            <div className="w-full h-3.5 rounded-full bg-slate-900 overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-300 ${theme.barColor} ${theme.glow}`}
                style={{ width: `${Math.max(percentageRemaining, 2)}%` }}
              />
            </div>

            {/* Progress Bar Legend */}
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> &gt; 40% (Healthy)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> 15% - 40% (Warning)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> &le; 15% (Critical)
              </span>
            </div>
          </div>

          {/* Endpoint Sync Meta */}
          <div className="pt-2 border-t border-slate-800/70 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              Source: <code className="text-indigo-300">{rateLimitInfo.lastEndpoint || 'Gateway Ingress'}</code>
            </span>
            <span className="text-slate-500">
              Last Synced: {rateLimitInfo.lastUpdated || 'Just now'}
            </span>
          </div>
        </div>
      )}

      {/* 4. Raw Backend Headers Telemetry Inspector (Collapsible) */}
      <div className="rounded-lg bg-slate-950 border border-slate-800/80 overflow-hidden text-xs font-mono">
        <button
          type="button"
          onClick={() => setShowRawHeaders(!showRawHeaders)}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-slate-400 hover:text-slate-200 transition-colors bg-slate-900/50 cursor-pointer"
        >
          <span className="flex items-center gap-2 font-semibold">
            <Terminal className="w-3.5 h-3.5 text-rose-400" />
            Backend Rate-Limit Response Headers
          </span>
          <span className="text-[11px] text-indigo-400 hover:underline">
            {showRawHeaders ? 'Hide Headers' : 'Inspect Headers'}
          </span>
        </button>

        {showRawHeaders && (
          <div className="p-3 border-t border-slate-800/80 space-y-1.5 text-[11px] bg-slate-950">
            <div className="flex justify-between items-center py-0.5 border-b border-slate-900">
              <span className="text-slate-500 font-bold">X-RateLimit-Limit:</span>
              <span className="text-slate-300">{rateLimitInfo.rawHeaders.limit ?? 'Not Exposed / Unavailable'}</span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-900">
              <span className="text-slate-500 font-bold">X-RateLimit-Remaining:</span>
              <span className={rateLimitInfo.rawHeaders.remaining !== null ? theme.textColor : 'text-slate-300'}>
                {rateLimitInfo.rawHeaders.remaining ?? 'Not Exposed / Unavailable'}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-900">
              <span className="text-slate-500 font-bold">X-RateLimit-Reset:</span>
              <span className="text-amber-300">{rateLimitInfo.rawHeaders.reset ? `${rateLimitInfo.rawHeaders.reset}s` : 'Not Exposed / Unavailable'}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500 font-bold">Retry-After:</span>
              <span className={is429 ? 'text-rose-400 font-bold' : 'text-slate-600'}>
                {rateLimitInfo.rawHeaders.retryAfter ?? 'None (Not Throttled)'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Interactive Testing & Diagnostic Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        {/* Test Rate-Limited Request */}
        <button
          type="button"
          disabled={singleTesting || burstTesting}
          onClick={handleSingleProbe}
          className="px-3 py-2.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 disabled:opacity-50 text-indigo-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors border border-indigo-500/30 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          {singleTesting ? 'Sending...' : 'Send Rate-Limited Req'}
        </button>

        {/* Rapid Burst Test */}
        <button
          type="button"
          disabled={burstTesting || singleTesting}
          onClick={handleBurstTest}
          className="px-3 py-2.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 disabled:opacity-50 text-rose-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors border border-rose-500/30 cursor-pointer"
        >
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          {burstTesting ? 'Bursting (15)...' : 'Rapid Burst (15 Reqs)'}
        </button>

        {/* Test Unmonitored Route (/health) */}
        <button
          type="button"
          disabled={healthTesting || burstTesting}
          onClick={handleHealthProbe}
          className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          {healthTesting ? 'Testing...' : 'Test Unmonitored (/health)'}
        </button>
      </div>

      {/* 6. Technical Architecture Details Footnote */}
      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-500">IDENTIFIER STRATEGY:</span>
          <span className="text-slate-300">user:&#123;userId&#125; (Auth) | ip:&#123;clientIp&#125; (Public)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">REDIS ATOMIC PIPELINE:</span>
          <span className="text-slate-300">MULTI &rarr; INCR &rarr; TTL &rarr; EXEC</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">FAIL-OPEN POLICY:</span>
          <span className="text-emerald-400">If Redis disconnects, requests bypass limiter</span>
        </div>
      </div>
    </div>
  );
};

export default RateLimitSection;