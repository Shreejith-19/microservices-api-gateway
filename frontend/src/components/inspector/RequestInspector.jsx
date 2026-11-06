import React, { useState } from 'react';
import { 
  Terminal, 
  ChevronRight, 
  ChevronDown, 
  Trash2, 
  ShieldCheck, 
  AlertCircle,
  Database,
  Radio,
  Zap
} from 'lucide-react';
import { useRequestTelemetry } from '../../context/RequestContext';
import { MOCK_REQUEST_LOGS } from '../../utils/mockData';

export const RequestInspector = () => {
  const { requestLogs, clearLogs } = useRequestTelemetry();
  const [filter, setFilter] = useState('ALL'); // 'ALL' | '2XX' | '4XX' | '5XX'
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [showDemoLogs, setShowDemoLogs] = useState(false);

  // If live logs exist, use them. Otherwise, optionally fall back to demo logs.
  const activeLogs = requestLogs.length > 0 
    ? requestLogs 
    : (showDemoLogs ? MOCK_REQUEST_LOGS : []);

  const filteredLogs = activeLogs.filter((log) => {
    if (filter === 'ALL') return true;
    if (filter === '2XX') return log.status >= 200 && log.status < 300;
    if (filter === '4XX') return log.status >= 400 && log.status < 500;
    if (filter === '5XX') return log.status >= 500;
    return true;
  });

  const getStatusBadge = (status) => {
    if (status >= 200 && status < 300) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (status === 429) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
    if (status >= 400 && status < 500) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    if (status >= 500) {
      return 'bg-red-500/10 text-red-400 border-red-500/30';
    }
    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
                Gateway Request Inspector
              </h2>
              {requestLogs.length > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Captured via Axios Interceptors (duration, status & sanitized headers)
            </p>
          </div>
        </div>

        {/* Controls: Clear & Filters */}
        <div className="flex items-center gap-2">
          {requestLogs.length > 0 && (
            <button
              type="button"
              onClick={clearLogs}
              title="Clear request history"
              className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800 text-[11px] font-mono">
            {['ALL', '2XX', '4XX', '5XX'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`px-2 py-0.5 rounded transition-all ${
                  filter === cat
                    ? 'bg-slate-800 text-indigo-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Log Feed List */}
      <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
        {filteredLogs.length === 0 ? (
          <div className="p-8 rounded-lg bg-slate-950/60 border border-slate-800/80 text-center">
            <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-2.5">
              <Terminal className="w-4 h-4" />
            </div>
            <p className="text-xs font-mono text-slate-400 mb-1">
              No live requests captured yet.
            </p>
            <p className="text-[11px] text-slate-500 mb-3">
              Trigger any action in the interactive controls to observe live telemetry.
            </p>
            <button
              type="button"
              onClick={() => setShowDemoLogs(!showDemoLogs)}
              className="text-[11px] font-mono px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showDemoLogs ? 'Hide Sample Data' : 'View Sample Telemetry'}
            </button>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const statusBadge = getStatusBadge(log.status);

            return (
              <div
                key={log.id}
                className="rounded-lg bg-slate-950 border border-slate-800/90 overflow-hidden transition-all"
              >
                {/* Row Header */}
                <button
                  type="button"
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="w-full text-left p-3 flex items-center justify-between gap-3 hover:bg-slate-900/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}

                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        log.method === 'GET'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : log.method === 'POST'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {log.method}
                    </span>

                    <span className="font-mono text-xs text-slate-200 truncate">
                      {log.url}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 font-mono text-xs">
                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                      {log.durationMs}ms
                    </span>

                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${statusBadge}`}>
                      {log.status || 'ERR'}
                    </span>
                  </div>
                </button>

                {/* Expanded Inspection Drawer */}
                {isExpanded && (
                  <div className="p-3.5 bg-slate-900/70 border-t border-slate-800/80 space-y-2.5 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>TIMESTAMP:</span>
                      <span className="text-slate-300">{log.timestamp}</span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>FULL URL:</span>
                      <span className="text-indigo-300 break-all">{log.fullUrl}</span>
                    </div>

                    {/* Sanitized Request Payload */}
                    {log.requestPayload && (
                      <div className="pt-2 border-t border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block mb-1">
                          Request Payload (Passwords Sanitized)
                        </span>
                        <pre className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto max-h-32">
                          {JSON.stringify(log.requestPayload, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Sanitized Request Headers */}
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block mb-1">
                        Outbound Request Headers
                      </span>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-1 text-[11px] text-slate-400">
                        {Object.entries(log.requestHeaders || {}).map(([key, val]) => (
                          <div key={key} className="flex justify-between">
                            <span>{key}:</span>
                            <span className="text-slate-300 truncate max-w-[220px]">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Response Headers (Rate Limiting) */}
                    {Object.keys(log.responseHeaders || {}).length > 0 && (
                      <div className="pt-2 border-t border-slate-800">
                        <span className="text-[10px] text-cyan-400 uppercase font-semibold block mb-1">
                          Gateway Ingress Response Headers
                        </span>
                        <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-1 text-[11px] text-slate-400">
                          {Object.entries(log.responseHeaders).map(([key, val]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-slate-400">{key}:</span>
                              <span className="text-indigo-300 truncate max-w-[220px]">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Error Detail */}
                    {log.isError && log.errorMessage && (
                      <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]">
                        <strong>{log.errorCategory}:</strong> {log.errorMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RequestInspector;
