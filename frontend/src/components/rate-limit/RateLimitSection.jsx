import React, { useState } from 'react';
import { 
  Gauge, 
  Flame, 
  RotateCcw, 
  Database, 
  ShieldAlert,
  Zap,
  Activity
} from 'lucide-react';
import { useRequestTelemetry } from '../../context/RequestContext';
import { fetchGatewayHealth, fetchProfile } from '../../services/gatewayService';

export const RateLimitSection = () => {
  const { rateLimitInfo } = useRequestTelemetry();
  const [burstTesting, setBurstTesting] = useState(false);

  // If live telemetry is present in context, use it. Otherwise fallback to initial 100/100 default.
  const limit = rateLimitInfo.limit || 100;
  const remaining = rateLimitInfo.remaining !== undefined ? rateLimitInfo.remaining : 100;
  const is429 = rateLimitInfo.isLimited || remaining === 0;
  const resetSeconds = rateLimitInfo.reset || 60;
  const percentage = Math.round((remaining / limit) * 100);

  // Trigger a single real request through the Gateway
  const handleSingleRequest = async () => {
    try {
      await fetchGatewayHealth();
    } catch {
      // Telemetry interceptor captures both success and error automatically
    }
  };

  // Trigger a rapid burst of requests through the Gateway to observe live rate limiting
  const handleBurstTest = async () => {
    setBurstTesting(true);
    const promises = Array.from({ length: 15 }, () =>
      fetchGatewayHealth().catch(() => {})
    );
    await Promise.all(promises);
    setBurstTesting(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
              Distributed Rate Limiter
            </h2>
            <p className="text-xs text-slate-400">
              Redis-backed atomic pipeline counter & sliding window
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 flex items-center gap-1.5">
          <Database className="w-3 h-3 text-rose-400" /> Redis Cluster
        </span>
      </div>

      {/* Main Quota Display Card */}
      <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-3xl font-extrabold font-mono tracking-tight text-slate-100">
              {remaining}
            </span>
            <span className="text-slate-500 font-mono text-sm ml-1.5">
              / {limit} REQS
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-slate-400">RESET IN</span>
            <span className="text-sm font-mono font-bold text-indigo-400 ml-1.5">
              {resetSeconds}s
            </span>
          </div>
        </div>

        {/* Progress Bar Meter */}
        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden mb-2">
          <div
            className={`h-full transition-all duration-300 ${
              is429
                ? 'bg-rose-500'
                : percentage < 25
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.max(percentage, 2)}%` }}
          />
        </div>

        {/* Status Text */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Window: 60s Sliding</span>
          <span className="flex items-center gap-1.5">
            {rateLimitInfo.hasLiveTelemetry ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <Activity className="w-3 h-3" /> Live Telemetry Synced
              </span>
            ) : (
              <span className="text-slate-500">Awaiting Ingress Response</span>
            )}
          </span>
        </div>
      </div>

      {/* 429 Alert Banner */}
      {is429 && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs">
          <div className="flex items-center gap-2 text-rose-400 font-bold font-mono mb-1">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            HTTP 429 Too Many Requests Received
          </div>
          <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
            <div>• <code className="text-rose-300">X-RateLimit-Remaining: 0</code></div>
            <div>• <code className="text-rose-300">Retry-After: {rateLimitInfo.retryAfter || `${resetSeconds} seconds`}</code></div>
          </div>
        </div>
      )}

      {/* Key Details */}
      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs font-mono text-slate-400 mb-4 space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-500">STRATEGY:</span>
          <span className="text-slate-300">Redis MULTI (INCR + TTL)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">GATEWAY HEADERS:</span>
          <span className="text-indigo-300">X-RateLimit-* / Retry-After</span>
        </div>
      </div>

      {/* Real Gateway Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleSingleRequest}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
        >
          <Zap className="w-3.5 h-3.5 text-indigo-400" /> Send Gateway Request
        </button>

        <button
          type="button"
          disabled={burstTesting}
          onClick={handleBurstTest}
          className="px-3 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 disabled:opacity-50 text-rose-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors border border-rose-500/30"
        >
          <Flame className="w-3.5 h-3.5 text-rose-400" /> {burstTesting ? 'Bursting...' : 'Rapid Burst (15 Reqs)'}
        </button>
      </div>
    </div>
  );
};

export default RateLimitSection;
