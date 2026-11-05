import React, { useState } from 'react';
import { 
  Gauge, 
  Flame, 
  RotateCcw, 
  AlertTriangle, 
  Database, 
  ShieldAlert,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { MOCK_RATE_LIMIT_STATE } from '../../utils/mockData';

export const RateLimitSection = () => {
  const [limitState, setLimitState] = useState(MOCK_RATE_LIMIT_STATE);
  const [is429, setIs429] = useState(false);

  const percentage = Math.round((limitState.remaining / limitState.limit) * 100);

  // Meter color dynamically switches as quota drops
  const meterColor = is429 || limitState.remaining === 0
    ? 'bg-rose-500 text-rose-400 border-rose-500/30'
    : percentage < 25
    ? 'bg-amber-500 text-amber-400 border-amber-500/30'
    : 'bg-emerald-500 text-emerald-400 border-emerald-500/30';

  const handleSimulateOne = () => {
    if (limitState.remaining > 0) {
      setLimitState((prev) => ({
        ...prev,
        remaining: prev.remaining - 1,
      }));
    } else {
      setIs429(true);
    }
  };

  const handleSimulateBurst = () => {
    setLimitState((prev) => ({
      ...prev,
      remaining: 0,
    }));
    setIs429(true);
  };

  const handleReset = () => {
    setLimitState(MOCK_RATE_LIMIT_STATE);
    setIs429(false);
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
              Redis-backed atomic pipeline counter & window TTL
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
              {limitState.remaining}
            </span>
            <span className="text-slate-500 font-mono text-sm ml-1.5">
              / {limitState.limit} REQS
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-slate-400">RESET IN</span>
            <span className="text-sm font-mono font-bold text-indigo-400 ml-1.5">
              {limitState.resetInSeconds}s
            </span>
          </div>
        </div>

        {/* Progress Bar Meter */}
        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden mb-2">
          <div
            className={`h-full transition-all duration-300 ${
              is429 || limitState.remaining === 0
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
          <span>Window: {limitState.windowSeconds}s Sliding</span>
          <span>{percentage}% Available</span>
        </div>
      </div>

      {/* 429 Alert Banner */}
      {is429 && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs">
          <div className="flex items-center gap-2 text-rose-400 font-bold font-mono mb-1">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            HTTP 429 Too Many Requests Triggered
          </div>
          <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
            <div>• <code className="text-rose-300">X-RateLimit-Remaining: 0</code></div>
            <div>• <code className="text-rose-300">Retry-After: {limitState.resetInSeconds}</code></div>
          </div>
        </div>
      )}

      {/* Key Details */}
      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs font-mono text-slate-400 mb-4 space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-500">ACTIVE REDIS KEY:</span>
          <span className="text-indigo-300 truncate max-w-[220px]" title={limitState.key}>
            {limitState.key}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">STRATEGY:</span>
          <span className="text-slate-300">{limitState.strategy}</span>
        </div>
      </div>

      {/* Interactive Simulation Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={handleSimulateOne}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
        >
          <Zap className="w-3.5 h-3.5 text-indigo-400" /> Send 1 Req
        </button>

        <button
          type="button"
          onClick={handleSimulateBurst}
          className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors border border-rose-500/30"
        >
          <Flame className="w-3.5 h-3.5 text-rose-400" /> Trigger Burst (429)
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 text-slate-400 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors border border-slate-800"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
    </div>
  );
};

export default RateLimitSection;

