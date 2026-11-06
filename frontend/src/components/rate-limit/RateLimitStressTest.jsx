import React, { useState } from 'react';
import { 
  Flame, 
  RotateCcw, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Activity, 
  Info,
  Server
} from 'lucide-react';
import { executeStressTestRequest } from '../../services/gatewayService';

export const RateLimitStressTest = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progressCount, setProgressCount] = useState(0);
  const [results, setResults] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);

  const TOTAL_REQUESTS = 105;

  const handleRunStressTest = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setProgressCount(0);
    setResults([]);
    setSelectedReq(null);

    // Initialize blank slots for all 105 requests so the grid renders immediately
    const initialSlots = Array.from({ length: TOTAL_REQUESTS }, (_, i) => ({
      index: i + 1,
      status: null,
      statusText: 'Pending',
      isSuccess: false,
      is429: false,
      durationMs: 0,
      isPending: true,
      error: null,
    }));
    setResults(initialSlots);

    // Create 105 rapid request promises through centralized Gateway client
    const requestPromises = Array.from({ length: TOTAL_REQUESTS }, (_, i) => {
      const reqIndex = i + 1;
      return executeStressTestRequest(reqIndex).then((res) => {
        setProgressCount((prev) => prev + 1);

        // Update individual slot in real-time
        setResults((prev) => {
          const next = [...prev];
          next[reqIndex - 1] = { ...res, isPending: false };
          return next;
        });

        return res;
      });
    });

    // Use Promise.allSettled to guarantee every outcome is captured
    await Promise.allSettled(requestPromises);
    setIsRunning(false);
  };

  const handleReset = () => {
    if (isRunning) return;
    setResults([]);
    setProgressCount(0);
    setSelectedReq(null);
  };

  // Aggregated Summary Statistics
  const completedResults = results.filter((r) => !r.isPending && r.status !== null);
  const successCount = completedResults.filter((r) => r.isSuccess).length;
  const rateLimitedCount = completedResults.filter((r) => r.is429).length;
  const otherErrorCount = completedResults.filter((r) => !r.isSuccess && !r.is429).length;

  const totalDuration = completedResults.reduce((acc, curr) => acc + curr.durationMs, 0);
  const avgLatency = completedResults.length > 0 ? Math.round(totalDuration / completedResults.length) : 0;

  const progressPercentage = Math.round((progressCount / TOTAL_REQUESTS) * 100);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
              Rate Limit Stress Test
            </h2>
            <p className="text-xs text-slate-400">
              Concurrently dispatch 105 rapid requests to demonstrate Redis-backed throttling
            </p>
          </div>
        </div>

        {/* Primary Action Controls */}
        <div className="flex items-center gap-2">
          {results.length > 0 && (
            <button
              type="button"
              disabled={isRunning}
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              Reset Results
            </button>
          )}

          <button
            type="button"
            disabled={isRunning}
            onClick={handleRunStressTest}
            className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Flame className={`w-3.5 h-3.5 ${isRunning ? 'animate-bounce' : ''}`} />
            {isRunning ? `Testing (${progressCount}/${TOTAL_REQUESTS})...` : 'Trigger 105 Requests'}
          </button>
        </div>
      </div>

      {/* 2. Educational & Architectural Guidance Box */}
      <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold font-mono">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Important Behavioral Guidelines for Distributed Throttling
        </div>
        <div className="text-[11px] font-mono space-y-1 leading-relaxed text-slate-300">
          <p>
            • <strong className="text-amber-200">Real Backend Traffic:</strong> Clicking "Trigger 105 Requests" dispatches 105 real HTTP requests through the centralized Axios Gateway client targeting <code className="text-indigo-300">GET /api/auth/health</code>.
          </p>
          <p>
            • <strong className="text-amber-200">Sliding Window Dependency:</strong> Do not assume the first 100 requests will succeed and the last 5 will fail. The cutoff depends on Redis pipeline concurrency and whether requests were made earlier in the current 60s window.
          </p>
          <p>
            • <strong className="text-amber-200">Clean Demonstration Tip:</strong> For an ideal 100-success and 5-throttled demonstration, ensure the rate-limit reset window has refreshed to 60s before triggering.
          </p>
          <p>
            • <strong className="text-amber-200">No Silent Retries:</strong> 429 responses are captured as genuine rate-limiting events without client retries.
          </p>
        </div>
      </div>

      {/* 3. Live Progress Bar */}
      {(isRunning || results.length > 0) && (
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Activity className={`w-3.5 h-3.5 ${isRunning ? 'text-rose-400 animate-spin' : 'text-emerald-400'}`} />
              {isRunning ? 'Executing Promise.allSettled concurrent requests...' : 'Burst execution complete.'}
            </span>
            <span className="font-bold text-slate-200">
              {progressCount} / {TOTAL_REQUESTS} ({progressPercentage}%)
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${isRunning ? 'bg-indigo-500' : 'bg-emerald-500'}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* 4. Results Summary Cards */}
      {completedResults.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {/* Total Requests */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Total Dispatched</span>
            <span className="text-lg font-bold font-mono text-slate-200">{completedResults.length}</span>
            <span className="text-[10px] font-mono text-slate-500 block">requests</span>
          </div>

          {/* Successful Responses */}
          <div className="p-3 rounded-lg bg-slate-950 border border-emerald-500/30">
            <span className="text-[10px] font-mono text-emerald-400 uppercase block flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Successful (2xx)
            </span>
            <span className="text-lg font-bold font-mono text-emerald-400">{successCount}</span>
            <span className="text-[10px] font-mono text-slate-500 block">
              {Math.round((successCount / completedResults.length) * 100)}% of quota
            </span>
          </div>

          {/* Rate-Limited Responses */}
          <div className="p-3 rounded-lg bg-slate-950 border border-rose-500/30">
            <span className="text-[10px] font-mono text-rose-400 uppercase block flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-rose-400" /> Throttled (429)
            </span>
            <span className="text-lg font-bold font-mono text-rose-400">{rateLimitedCount}</span>
            <span className="text-[10px] font-mono text-slate-500 block">
              {Math.round((rateLimitedCount / completedResults.length) * 100)}% intercepted
            </span>
          </div>

          {/* Other Errors */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-mono text-amber-400 uppercase block flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" /> Other Errors
            </span>
            <span className="text-lg font-bold font-mono text-amber-300">{otherErrorCount}</span>
            <span className="text-[10px] font-mono text-slate-500 block">
              {otherErrorCount === 0 ? 'Zero server errors' : `${otherErrorCount} network/5xx`}
            </span>
          </div>

          {/* Average Latency */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-mono text-indigo-400 uppercase block flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-400" /> Avg Latency
            </span>
            <span className="text-lg font-bold font-mono text-indigo-300">{avgLatency} ms</span>
            <span className="text-[10px] font-mono text-slate-500 block">round-trip time</span>
          </div>
        </div>
      )}

      {/* 5. Visual Grid of 105 Request Outcomes */}
      {results.length > 0 && (
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              105 Request Stream Visualizer
            </span>
            <span className="text-[11px] text-slate-500">
              Click any cell to inspect individual request telemetry
            </span>
          </div>

          {/* Grid: 15 columns on md/lg (7 rows x 15 = 105), responsive on smaller screens */}
          <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-[repeat(15,minmax(0,1fr))] gap-1.5 max-h-64 overflow-y-auto p-1.5 rounded bg-slate-900/60 border border-slate-800/80">
            {results.map((req) => {
              let cellClass = 'bg-slate-900 text-slate-500 border-slate-800';

              if (req.isPending) {
                cellClass = 'bg-slate-900/80 text-slate-600 border-slate-800 animate-pulse';
              } else if (req.isSuccess) {
                cellClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30';
              } else if (req.is429) {
                cellClass = 'bg-rose-500/25 text-rose-300 border-rose-500/60 font-bold hover:bg-rose-500/35';
              } else {
                cellClass = 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30';
              }

              const isSelected = selectedReq?.index === req.index;

              return (
                <button
                  type="button"
                  key={req.index}
                  onClick={() => setSelectedReq(req)}
                  className={`h-8 rounded text-[11px] font-mono border transition-all flex flex-col items-center justify-center cursor-pointer ${cellClass} ${
                    isSelected ? 'ring-2 ring-indigo-400 ring-offset-1 ring-offset-slate-950 scale-105' : ''
                  }`}
                  title={`Request #${req.index}: Status ${req.status || 'Pending'} (${req.durationMs}ms)`}
                >
                  <span className="text-[9px] opacity-75">#{req.index}</span>
                  <span className="text-[10px] leading-none font-bold">
                    {req.status ? req.status : '...'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-500" />
                <span className="text-slate-300">2xx Success ({successCount})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500/40 border border-rose-500" />
                <span className="text-slate-300">HTTP 429 Throttled ({rateLimitedCount})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500/40 border border-amber-500" />
                <span className="text-slate-300">Other ({otherErrorCount})</span>
              </span>
            </div>
            <span className="text-slate-500">
              Protocol: HTTP/1.1 via Port 3000
            </span>
          </div>
        </div>
      )}

      {/* 6. Selected Request Detail Card */}
      {selectedReq && (
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              Request #{selectedReq.index} Detailed Inspector
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selectedReq.isSuccess
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : selectedReq.is429
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {selectedReq.isSuccess ? 'HTTP 200 OK' : selectedReq.is429 ? 'HTTP 429 RATE LIMITED' : `HTTP ${selectedReq.status}`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 block">HTTP STATUS</span>
              <span className="text-slate-200 font-bold">{selectedReq.status || 'Pending'} {selectedReq.statusText}</span>
            </div>
            <div>
              <span className="text-slate-500 block">ROUND-TRIP TIME</span>
              <span className="text-indigo-300 font-bold">{selectedReq.durationMs} ms</span>
            </div>
            <div>
              <span className="text-slate-500 block">GATEWAY ENFORCED</span>
              <span className={selectedReq.is429 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                {selectedReq.is429 ? 'Blocked by Redis Limit' : 'Allowed through Proxy'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">DETAIL</span>
              <span className="text-slate-400 truncate block">
                {selectedReq.error || (selectedReq.isSuccess ? 'Response 200 Received' : 'No error payload')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RateLimitStressTest;