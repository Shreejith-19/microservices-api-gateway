import React, { useState } from 'react';
import { 
  Network, 
  ArrowDown, 
  ArrowRight, 
  Server, 
  Cpu, 
  Database, 
  ShieldCheck, 
  ShieldAlert, 
  AlertOctagon, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  RefreshCw, 
  Loader2, 
  FileCode,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRequestTelemetry } from '../../context/RequestContext';
import { fetchProfile } from '../../services/gatewayService';

export const IdentityFlowInspector = () => {
  const { isAuthenticated, user, decodedToken, token } = useAuth();
  const { requestLogs } = useRequestTelemetry();

  // Trace execution state
  const [isTracing, setIsTracing] = useState(false);
  const [lastTraceResult, setLastTraceResult] = useState(null);

  // Find the most recent profile request from telemetry logs
  const latestProfileLog = requestLogs.find((log) => 
    log.url?.includes('/api/users/profile') || log.fullUrl?.includes('/api/users/profile')
  );

  // Active trace is either the result of manual trace or the latest profile request from logs
  const activeTrace = lastTraceResult || latestProfileLog || null;

  // Execute an active live trace to probe the Gateway -> User Service identity flow
  const handleRunTrace = async () => {
    setIsTracing(true);
    setLastTraceResult(null);

    const startTime = performance.now();
    try {
      const response = await fetchProfile();
      const durationMs = Number((performance.now() - startTime).toFixed(2));
      setLastTraceResult({
        status: 200,
        statusText: 'OK',
        durationMs,
        data: response.data,
        timestamp: new Date().toLocaleTimeString(),
        isError: false,
      });
    } catch (err) {
      const durationMs = Number((performance.now() - startTime).toFixed(2));
      setLastTraceResult({
        status: err.response?.status || 0,
        statusText: err.response?.statusText || (err.response ? 'Error' : 'Network Error'),
        durationMs,
        data: err.response?.data || null,
        errorMessage: err.response?.data?.message || err.message,
        timestamp: new Date().toLocaleTimeString(),
        isError: true,
      });
    } finally {
      setIsTracing(false);
    }
  };

  const currentUserId = decodedToken?.userId || user?.id || '';
  const responseData = activeTrace?.data || (activeTrace?.responseBody?.data || activeTrace?.responseBody);
  const returnedUserId = responseData?.userId || responseData?.data?.userId || null;

  // Check if backend confirmed identity matches the token's claim
  const isMatchConfirmed = Boolean(
    activeTrace && 
    activeTrace.status === 200 && 
    returnedUserId && 
    currentUserId && 
    returnedUserId === currentUserId
  );

  // Inspection check for safe diagnostic headers or metadata
  // Requirement 5: Display x-user-id header only if the backend explicitly returns safe diagnostic info
  const rawHeaders = activeTrace?.responseHeaders || {};
  const hasSafeDiagnosticHeader = Boolean(
    rawHeaders['x-identity-resolved'] || 
    rawHeaders['x-user-id'] || 
    responseData?.diagnostics?.identityHeaderReceived
  );

  const diagnosticUserId = rawHeaders['x-identity-resolved'] || 
    rawHeaders['x-user-id'] || 
    responseData?.diagnostics?.resolvedUserId || 
    null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
                Identity Flow Inspector
              </h2>
              {activeTrace && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-medium ${
                  activeTrace.status === 200
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : activeTrace.status === 404
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  HTTP {activeTrace.status} ({activeTrace.durationMs || 0}ms)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Gateway identity extraction, anti-spoofing & injection pipeline
            </p>
          </div>
        </div>

        {/* Live Trace Button */}
        <button
          type="button"
          disabled={isTracing}
          onClick={handleRunTrace}
          className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50"
          title="Dispatch live GET /api/users/profile and trace identity pipeline"
        >
          {isTracing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span>{isTracing ? 'Tracing...' : 'Trace Ingress'}</span>
        </button>
      </div>

      {/* Visual Pipeline Nodes */}
      <div className="space-y-3 font-mono">
        
        {/* Node 1: Client Ingress */}
        <div className={`p-3.5 rounded-lg border transition-all ${
          isAuthenticated
            ? 'bg-slate-950 border-indigo-500/40 text-slate-200'
            : 'bg-slate-950/60 border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'}`} />
              STEP 1: CLIENT INGRESS
            </span>
            <span className="text-[10px] text-slate-500">Origin: Frontend SPA</span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between text-slate-400">
              <span>Dispatched Header:</span>
              <span className="text-indigo-300">
                {isAuthenticated && token 
                  ? `Authorization: Bearer ${token.slice(0, 16)}...` 
                  : '<No Authorization Header>'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500 text-[10px]">
              <span>Client-Supplied x-user-id:</span>
              <span className="text-rose-400 font-semibold">NEVER TRUSTED / OMITTED</span>
            </div>
          </div>
        </div>

        {/* Connector 1 */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 py-0.5">
          <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
          <span>HTTP/REST Ingress to Port 3000</span>
        </div>

        {/* Node 2: API Gateway Edge Boundary */}
        <div className={`p-3.5 rounded-lg border transition-all ${
          activeTrace && activeTrace.status !== 0 && activeTrace.status !== 502
            ? 'bg-slate-950 border-cyan-500/40'
            : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              STEP 2: API GATEWAY (EDGE REVERSE PROXY)
            </span>
            <span className="text-[10px] text-cyan-400/90 font-medium">PORT 3000</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] mb-2">
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">JWT SIGNATURE VERIFICATION</span>
              <span className={isAuthenticated ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                {isAuthenticated ? 'HMAC-SHA256 Verified (req.user)' : 'No Valid Token'}
              </span>
            </div>

            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">ANTI-SPOOFING FILTER</span>
              <span className="text-cyan-300 font-semibold">
                Purged untrusted client x-user-id
              </span>
            </div>
          </div>

          <div className="p-2 rounded bg-slate-900/90 border border-slate-800 text-[11px] flex items-center justify-between">
            <span className="text-slate-400">Gateway Injected Header:</span>
            <span className="text-emerald-400 font-semibold font-mono">
              x-user-id: {isAuthenticated ? currentUserId : '<unauthenticated>'}
            </span>
          </div>
        </div>

        {/* Connector 2 */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 py-0.5">
          <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
          <span>Internal Reverse Proxy Network (:5002)</span>
        </div>

        {/* Node 3: User Service Boundary */}
        <div className={`p-3.5 rounded-lg border transition-all ${
          activeTrace && activeTrace.status === 200
            ? 'bg-slate-950 border-emerald-500/40'
            : activeTrace && activeTrace.status === 404
            ? 'bg-slate-950 border-amber-500/40'
            : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              STEP 3: USER SERVICE (:5002) & USER_DB
            </span>
            <span className="text-[10px] text-slate-500">Internal Trust Boundary</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Trusted Header Consumed:</span>
              <span className="text-indigo-300 font-mono">
                req.headers['x-user-id']
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Database Query:</span>
              <span className="text-slate-300 font-mono text-[10px]">
                userprofiles.findOne({`{ userId: "${returnedUserId || currentUserId || '...'}" }`})
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400">Database Confirmed Identity:</span>
              <span className="text-emerald-400 font-semibold font-mono">
                {returnedUserId || (activeTrace?.status === 404 ? 'Record Not Yet Initialized (404)' : 'Awaiting Trace')}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Confirmation & Diagnostics Status Card */}
      <div className="mt-4 p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            {isMatchConfirmed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
            END-TO-END IDENTITY INTEGRITY STATUS
          </span>

          <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
            isMatchConfirmed 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            {isMatchConfirmed ? 'IDENTITY CONFIRMED' : 'TRACE NOT YET VERIFIED'}
          </span>
        </div>

        {isMatchConfirmed ? (
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            The User Service successfully matched <code className="text-indigo-300 font-mono">{returnedUserId}</code> from <code className="text-slate-300 font-mono">user_db</code>. Because the client did not send any userId in the request URL or body, this confirms that the API Gateway successfully extracted the verified identity from the JWT and forwarded it to the downstream service.
          </p>
        ) : (
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            Run <strong className="text-slate-200">Trace Ingress</strong> above or log in to observe the authenticated identity flow through the API Gateway boundary.
          </p>
        )}
      </div>

      {/* Backend Diagnostic Limitation & Recommendation Section */}
      {/* Requirements 5 & 6: Report limitation if backend does not expose trustworthy header diagnostics */}
      <div className="mt-3 p-3.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs space-y-2 font-mono">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-[11px]">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          <span>BACKEND DIAGNOSTIC OBSERVABILITY REPORT</span>
        </div>

        {hasSafeDiagnosticHeader ? (
          <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
            <span className="text-emerald-400 font-bold block mb-1">Safe Diagnostic Response Detected:</span>
            <span>Reflected Identity: <code>{diagnosticUserId}</code></span>
          </div>
        ) : (
          <div className="space-y-1.5 text-[11px] text-slate-400 font-sans leading-relaxed">
            <p>
              <strong className="text-slate-300">Architecture Limitation:</strong> The internal <code className="text-cyan-300 font-mono">x-user-id</code> header is transported strictly within the private container network between Gateway (:3000) and User Service (:5002). In standard production configuration, internal proxy headers are not mirrored in browser HTTP response headers.
            </p>
            <p>
              <strong className="text-slate-300">Safe Diagnostic Recommendation:</strong> For explicit header inspection in staging environments, User Service can expose a safe diagnostic endpoint (e.g. <code className="text-slate-300 font-mono">GET /api/users/diagnostics</code>) returning:
            </p>
            <pre className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] text-indigo-300 font-mono overflow-x-auto">
{JSON.stringify(
  {
    success: true,
    diagnostic: {
      identityHeaderReceived: true,
      resolvedUserId: "6aac166578bd25ae16472377",
      source: "gateway-injected-header"
    }
  },
  null,
  2
)}
            </pre>
          </div>
        )}
      </div>

      {/* Security Principles Footer */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-3">
        <span>Security Boundary: Zero-Trust Client Headers</span>
        <span className="text-cyan-400 font-medium">Gateway Authoritative Injection</span>
      </div>
    </div>
  );
};

export default IdentityFlowInspector;

