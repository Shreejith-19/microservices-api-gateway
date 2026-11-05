import React, { useState } from 'react';
import { 
  Terminal, 
  ChevronRight, 
  ChevronDown, 
  Filter, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck,
  Radio
} from 'lucide-react';
import { MOCK_REQUEST_LOGS, PLACEHOLDER_NOTICE } from '../../utils/mockData';

export const RequestInspector = () => {
  const [logs, setLogs] = useState(MOCK_REQUEST_LOGS);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | '2XX' | '4XX' | '5XX'
  const [expandedLogId, setExpandedLogId] = useState('req_102');

  const filteredLogs = logs.filter((log) => {
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
    return 'bg-red-500/10 text-red-400 border-red-500/30';
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
            <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
              Gateway Request Inspector
            </h2>
            <p className="text-xs text-slate-400">
              Live HTTP ingress logs, latency & injected headers
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800 text-[11px] font-mono">
          {['ALL', '2XX', '4XX', '5XX'].map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setFilter(category)}
              className={`px-2 py-0.5 rounded transition-all ${
                filter === category
                  ? 'bg-slate-800 text-indigo-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredLogs.map((log) => {
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
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {log.method}
                  </span>

                  <span className="font-mono text-xs text-slate-200 truncate">
                    {log.path}
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 font-mono text-xs">
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    {log.durationMs}ms
                  </span>

                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${statusBadge}`}>
                    {log.status}
                  </span>
                </div>
              </button>

              {/* Expanded Inspection Drawer */}
              {isExpanded && (
                <div className="p-3.5 bg-slate-900/70 border-t border-slate-800/80 space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>UPSTREAM TARGET:</span>
                    <span className="text-slate-200">{log.target}</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>CLIENT IP:</span>
                    <span className="text-slate-300">{log.clientIp}</span>
                  </div>

                  {/* Gateway Injected Headers */}
                  {Object.keys(log.injectedHeaders).length > 0 && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold uppercase mb-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Gateway Injected Identity Headers
                      </span>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-1">
                        {Object.entries(log.injectedHeaders).map(([key, val]) => (
                          <div key={key} className="flex justify-between text-[11px]">
                            <span className="text-slate-400">{key}:</span>
                            <span className="text-indigo-300">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Client Sent Headers */}
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">
                      Client Sent Headers
                    </span>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-1 text-[11px] text-slate-400">
                      {Object.entries(log.headersSent).map(([key, val]) => (
                        <div key={key} className="flex justify-between">
                          <span>{key}:</span>
                          <span className="text-slate-300 truncate max-w-[200px]">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {log.errorDetail && (
                    <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]">
                      {log.errorDetail}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RequestInspector;

