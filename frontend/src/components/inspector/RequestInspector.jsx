import React, { useState } from 'react';
import { 
  Terminal, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  ShieldAlert, 
  AlertOctagon, 
  XCircle, 
  Clock, 
  Activity, 
  Search, 
  Gauge, 
  Info,
  X,
  FileText,
  Send
} from 'lucide-react';
import { useRequestTelemetry } from '../../context/RequestContext';

export const RequestInspector = () => {
  const { requestLogs, clearLogs } = useRequestTelemetry();
  const [filter, setFilter] = useState('ALL'); // 'ALL' | '200' | '201' | '400' | '401' | '403' | '429' | '500'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // Filter logs based on status code and search query
  const filteredLogs = requestLogs.filter((log) => {
    // 1. Status Filter
    if (filter === '200' && log.status !== 200) return false;
    if (filter === '201' && log.status !== 201) return false;
    if (filter === '400' && log.status !== 400) return false;
    if (filter === '401' && log.status !== 401) return false;
    if (filter === '403' && log.status !== 403) return false;
    if (filter === '429' && log.status !== 429) return false;
    if (filter === '500' && (log.status < 500 || log.status > 599)) return false;

    // 2. Search query (URL, method, status)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchUrl = log.url?.toLowerCase().includes(q);
      const matchMethod = log.method?.toLowerCase().includes(q);
      const matchStatus = String(log.status).includes(q);
      return matchUrl || matchMethod || matchStatus;
    }

    return true;
  });

  // Selected request details
  const selectedLog = requestLogs.find((l) => l.id === selectedRequestId) || null;

  // Helper to distinguish status codes with specific colors, badges, and icons
  const getStatusConfig = (status) => {
    if (status === 200) {
      return {
        label: '200 OK',
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        icon: CheckCircle2,
        dotColor: 'bg-emerald-400',
      };
    }
    if (status === 201) {
      return {
        label: '201 Created',
        badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
        icon: CheckCircle2,
        dotColor: 'bg-teal-400',
      };
    }
    if (status === 400) {
      return {
        label: '400 Bad Request',
        badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        icon: AlertCircle,
        dotColor: 'bg-amber-400',
      };
    }
    if (status === 401) {
      return {
        label: '401 Unauthorized',
        badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
        icon: Lock,
        dotColor: 'bg-purple-400',
      };
    }
    if (status === 403) {
      return {
        label: '403 Forbidden',
        badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
        icon: ShieldAlert,
        dotColor: 'bg-orange-400',
      };
    }
    if (status === 429) {
      return {
        label: '429 Rate Limited',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold',
        icon: ShieldAlert,
        dotColor: 'bg-rose-400',
      };
    }
    if (status === 500) {
      return {
        label: '500 Server Error',
        badge: 'bg-red-500/20 text-red-400 border-red-500/40 font-bold',
        icon: AlertOctagon,
        dotColor: 'bg-red-500',
      };
    }
    if (status === 502) {
      return {
        label: '502 Bad Gateway',
        badge: 'bg-red-500/20 text-red-400 border-red-500/40',
        icon: AlertOctagon,
        dotColor: 'bg-red-400',
      };
    }
    if (status >= 500) {
      return {
        label: `${status} Server Error`,
        badge: 'bg-red-500/20 text-red-400 border-red-500/40',
        icon: AlertOctagon,
        dotColor: 'bg-red-500',
      };
    }
    if (status === 0 || !status) {
      return {
        label: 'Network Error',
        badge: 'bg-slate-800 text-slate-400 border-slate-700',
        icon: XCircle,
        dotColor: 'bg-slate-500',
      };
    }
    return {
      label: `${status}`,
      badge: 'bg-slate-800 text-slate-300 border-slate-700',
      icon: Activity,
      dotColor: 'bg-slate-400',
    };
  };

  // Helper for HTTP method badge colors
  const getMethodBadge = (method) => {
    switch (method?.toUpperCase()) {
      case 'GET':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'POST':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'PUT':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'DELETE':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // Extract rate-limit headers from response headers if present
  const extractRateLimitHeaders = (headers = {}) => {
    const clean = {};
    for (const [k, v] of Object.entries(headers)) {
      const lower = k.toLowerCase();
      if (lower.startsWith('x-ratelimit-') || lower === 'retry-after') {
        clean[k] = v;
      }
    }
    return Object.keys(clean).length > 0 ? clean : null;
  };

  const handleClearHistory = () => {
    clearLogs();
    setSelectedRequestId(null);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* 1. Inspector Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
                Live Gateway Request Inspector
              </h2>
              {requestLogs.length > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Real-time interception of browser-to-Gateway HTTP traffic with sanitized payloads
            </p>
          </div>
        </div>

        {/* Global Controls & Stats */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-950 text-slate-400 border border-slate-800">
            {requestLogs.length} / 100 Captured
          </span>

          {requestLogs.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              title="Clear all captured request logs"
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors text-xs font-mono flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
          )}
        </div>
      </div>

      {/* 2. Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
          {[
            { id: 'ALL', label: 'ALL' },
            { id: '200', label: '200' },
            { id: '201', label: '201' },
            { id: '400', label: '400' },
            { id: '401', label: '401' },
            { id: '403', label: '403' },
            { id: '429', label: '429' },
            { id: '500', label: '500+' },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                filter === id
                  ? 'bg-slate-800 text-indigo-300 font-bold border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search URL Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search path, method, status..."
            className="w-full sm:w-56 pl-8 pr-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* 3. Live Request Table */}
      <div className="rounded-lg border border-slate-800/90 overflow-hidden bg-slate-950">
        <div className="overflow-x-auto max-h-72 overflow-y-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead className="bg-slate-900/90 sticky top-0 z-10 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-12">#</th>
                <th className="py-2.5 px-3 w-20">Method</th>
                <th className="py-2.5 px-3 min-w-[200px]">Request URL</th>
                <th className="py-2.5 px-3 w-36">Status</th>
                <th className="py-2.5 px-3 w-24">Latency</th>
                <th className="py-2.5 px-3 w-28 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 font-mono text-xs">
                    <Terminal className="w-5 h-5 mx-auto mb-2 text-slate-600" />
                    {requestLogs.length === 0
                      ? 'No API requests intercepted yet. Perform actions in the dashboard to record live traffic.'
                      : 'No requests matched the selected filter.'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const statusConfig = getStatusConfig(log.status);
                  const isSelected = selectedRequestId === log.id;
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedRequestId(isSelected ? null : log.id)}
                      className={`hover:bg-slate-900/70 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-slate-900 border-l-2 border-l-indigo-400 font-semibold'
                          : ''
                      }`}
                    >
                      {/* Request Number */}
                      <td className="py-2 px-3 text-slate-500 text-[11px]">
                        #{log.requestNumber || 1}
                      </td>

                      {/* HTTP Method */}
                      <td className="py-2 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getMethodBadge(
                            log.method
                          )}`}
                        >
                          {log.method}
                        </span>
                      </td>

                      {/* Request URL */}
                      <td className="py-2 px-3 text-slate-200 truncate max-w-xs">
                        <span className="text-slate-300">{log.url || '/'}</span>
                      </td>

                      {/* Status Code with Visual Indicator */}
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border ${statusConfig.badge}`}
                        >
                          <StatusIcon className="w-3 h-3 flex-shrink-0" />
                          <span>{statusConfig.label}</span>
                        </span>
                      </td>

                      {/* Latency */}
                      <td className="py-2 px-3 text-slate-400 text-[11px]">
                        {log.durationMs} ms
                      </td>

                      {/* Timestamp */}
                      <td className="py-2 px-3 text-slate-500 text-[11px] text-right whitespace-nowrap">
                        {log.timeFormatted || new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Selected Request Detail Inspection Drawer */}
      {selectedLog && (
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3.5 text-xs font-mono">
          {/* Header of Drawer */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">
                Request #{selectedLog.requestNumber || 1} Details
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getMethodBadge(
                  selectedLog.method
                )}`}
              >
                {selectedLog.method}
              </span>
              <code className="text-indigo-300 font-bold">{selectedLog.url}</code>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                Duration: <strong className="text-slate-200">{selectedLog.durationMs} ms</strong>
              </span>

              <button
                type="button"
                onClick={() => setSelectedRequestId(null)}
                className="text-slate-500 hover:text-slate-300 cursor-pointer"
                title="Close Details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
            <div>
              <span className="text-slate-500 block">STATUS CODE</span>
              <span className="text-slate-200 font-bold">
                {selectedLog.status} ({selectedLog.statusText || 'OK'})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">EXACT TIMESTAMP</span>
              <span className="text-slate-300 font-mono text-[10px] truncate block">
                {selectedLog.timestamp}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">TARGET GATEWAY URL</span>
              <span className="text-indigo-300 truncate block">
                {selectedLog.fullUrl}
              </span>
            </div>
          </div>

          {/* Rate Limit Headers Highlight (if returned by backend) */}
          {(() => {
            const rlHeaders = extractRateLimitHeaders(selectedLog.responseHeaders);
            if (!rlHeaders) return null;
            return (
              <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/30 text-[11px] space-y-1.5">
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold font-mono">
                  <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                  Gateway Redis Rate-Limit Response Headers
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-slate-300">
                  {Object.entries(rlHeaders).map(([k, v]) => (
                    <div key={k} className="bg-slate-950/80 p-1.5 rounded border border-indigo-500/20">
                      <span className="text-[10px] text-slate-500 block">{k}</span>
                      <span className="text-indigo-300 font-bold">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Side-by-side / Stacked Headers & Payloads */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Outbound Safe Request Headers */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1">
                <Send className="w-3 h-3 text-slate-500" /> Safe Outbound Request Headers (Masked)
              </span>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] space-y-1 max-h-40 overflow-y-auto">
                {Object.entries(selectedLog.requestHeaders || {}).length === 0 ? (
                  <span className="text-slate-500">None</span>
                ) : (
                  Object.entries(selectedLog.requestHeaders).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2 border-b border-slate-800/40 pb-0.5 last:border-0">
                      <span className="text-slate-400 font-semibold">{k}:</span>
                      <span className="text-slate-300 truncate max-w-[240px]">{String(v)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Ingress Safe Response Headers */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-500" /> Safe Ingress Response Headers
              </span>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] space-y-1 max-h-40 overflow-y-auto">
                {Object.entries(selectedLog.responseHeaders || {}).length === 0 ? (
                  <span className="text-slate-500">None (Omitted or CORS-restricted)</span>
                ) : (
                  Object.entries(selectedLog.responseHeaders).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2 border-b border-slate-800/40 pb-0.5 last:border-0">
                      <span className="text-slate-400 font-semibold">{k}:</span>
                      <span className="text-slate-300 truncate max-w-[240px]">{String(v)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Request Payload (if present) */}
          {selectedLog.requestPayload && (
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
                Sanitized Request Payload (Passwords/Secrets Redacted)
              </span>
              <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto max-h-36">
{JSON.stringify(selectedLog.requestPayload, null, 2)}
              </pre>
            </div>
          )}

          {/* Response Body (if present) */}
          {selectedLog.responseBody && (
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
                Response Body
              </span>
              <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-emerald-300 overflow-x-auto max-h-40">
{JSON.stringify(selectedLog.responseBody, null, 2)}
              </pre>
            </div>
          )}

          {/* Error Category Banner (if error) */}
          {selectedLog.isError && selectedLog.errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] font-mono text-rose-300">
              <strong className="text-rose-400">{selectedLog.errorCategory || 'ERROR'}: </strong>
              {selectedLog.errorMessage}
            </div>
          )}
        </div>
      )}

      {/* 5. Architectural Security & Protocol Boundary Disclaimer */}
      <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-start gap-2">
        <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-300">Protocol Observation Scope:</strong> This live inspector strictly records HTTP/1.1 traffic exchanged between the browser client and the API Gateway (Port 3000). Downstream microservice communication (such as User Service &rarr; Notification Service binary gRPC on port 50053) occurs internally behind the Gateway edge and is not directly observable by client browser interceptors. All passwords, secrets, and authorization bearer tokens are permanently masked.
        </div>
      </div>
    </div>
  );
};

export default RequestInspector;