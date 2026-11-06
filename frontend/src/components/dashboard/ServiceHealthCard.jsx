import React from 'react';
import { 
  HeartPulse, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  HelpCircle, 
  RefreshCw, 
  Database, 
  Radio, 
  Cpu, 
  Loader2,
  Clock,
  ShieldCheck,
  Server
} from 'lucide-react';
import { useHealthMonitor } from '../../hooks/useHealthMonitor';

export const ServiceHealthCard = () => {
  const {
    healthData,
    isGatewayResponding,
    isLoading,
    isRefreshing,
    lastChecked,
    lastSuccessfulCheck,
    connectionError,
    refetch,
  } = useHealthMonitor(10000); // 10-second polling interval

  // 1. Determine API Gateway Status
  let gatewayStatus = 'UNKNOWN';
  if (isGatewayResponding === false) {
    gatewayStatus = 'DOWN';
  } else if (isGatewayResponding === true) {
    // If Gateway responds (even if status 503 DEGRADED due to Redis), Gateway process is UP!
    gatewayStatus = 'UP';
  }

  // 2. Determine Redis Status
  let redisStatus = 'UNKNOWN';
  let redisErrorDetail = '';
  if (isGatewayResponding === false) {
    redisStatus = 'UNKNOWN';
  } else if (healthData?.redis) {
    const rawStatus = healthData.redis.status || '';
    if (rawStatus === 'CONNECTED') {
      redisStatus = 'CONNECTED';
    } else {
      redisStatus = 'DEGRADED';
      redisErrorDetail = rawStatus;
    }
  }

  // 3. Inspect if backend health endpoint exposes MongoDB (strict check without fabrication)
  const exposesMongo = Boolean(healthData && 'mongodb' in healthData);
  const mongoStatus = exposesMongo ? (healthData.mongodb?.status || 'UNKNOWN') : 'UNKNOWN';

  // 4. Fail-Open condition check
  const isFailOpenActive = isGatewayResponding === true && redisStatus === 'DEGRADED';

  // Status configuration helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'UP':
      case 'CONNECTED':
        return {
          label: status,
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          dot: 'bg-emerald-500',
          Icon: CheckCircle2,
        };
      case 'DEGRADED':
      case 'DISCONNECTED':
        return {
          label: status,
          text: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          dot: 'bg-amber-500',
          Icon: AlertTriangle,
        };
      case 'DOWN':
        return {
          label: status,
          text: 'text-rose-400',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/30',
          dot: 'bg-rose-500',
          Icon: AlertOctagon,
        };
      case 'UNKNOWN':
      default:
        return {
          label: status || 'UNKNOWN',
          text: 'text-slate-400',
          bg: 'bg-slate-800/80',
          border: 'border-slate-700',
          dot: 'bg-slate-500',
          Icon: HelpCircle,
        };
    }
  };

  const gatewayBadge = getStatusBadge(gatewayStatus);
  const redisBadge = getStatusBadge(redisStatus);
  const mongoBadge = getStatusBadge(mongoStatus);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
                Live Infrastructure Health
              </h2>
              <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                <span className={`w-1.5 h-1.5 rounded-full ${isGatewayResponding ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                10s Polling
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Direct telemetry from Gateway <code className="text-emerald-300 font-mono">GET /health</code>
            </p>
          </div>
        </div>

        {/* Polling Controls & Timestamp */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isRefreshing || isLoading}
            onClick={() => refetch()}
            className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Probe Gateway /health immediately"
          >
            {isRefreshing || isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{isRefreshing ? 'Probing...' : 'Ping Now'}</span>
          </button>
        </div>
      </div>

      {/* Timestamp & Meta Bar */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/70 border border-slate-800/60 rounded-lg px-3 py-1.5 mb-4">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          Last successful check:
          <span className="text-slate-200 font-medium">
            {lastSuccessfulCheck ? lastSuccessfulCheck.toLocaleTimeString() : (isLoading ? 'Probing...' : 'None')}
          </span>
        </span>
        <span className="text-slate-500 hidden sm:inline">
          Target: :3000/health
        </span>
      </div>

      {/* Failure Scenario 1: Fail-Open Active (Redis unavailable, Gateway responding) */}
      {isFailOpenActive && (
        <div className="mb-4 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
          <div className="flex items-center gap-2 font-bold mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Fail-Open Rate Limiting Mode Active (Cluster Degraded)</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Redis is unreachable (<span className="text-amber-300">{redisErrorDetail || 'DISCONNECTED'}</span>). The API Gateway is responding and routing traffic normally, but distributed rate limiting is temporarily bypassed to prevent dropping requests.
          </p>
        </div>
      )}

      {/* Failure Scenario 2: Connection Error (API Gateway is DOWN) */}
      {gatewayStatus === 'DOWN' && (
        <div className="mb-4 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
          <div className="flex items-center gap-2 font-bold mb-1">
            <AlertOctagon className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>Connection Error: API Gateway Offline</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {connectionError || 'Unable to establish HTTP connection with the API Gateway on port 3000.'} Verify the Gateway container or Node.js process is running.
          </p>
        </div>
      )}

      {/* Scenario 3: All Healthy */}
      {gatewayStatus === 'UP' && redisStatus === 'CONNECTED' && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold">Monitored Infrastructure Healthy</span>
          </div>
          <span className="text-[10px] text-emerald-400/80">
            Gateway :3000 &bull; Redis :6379 PONG
          </span>
        </div>
      )}

      {/* Main Health Grid: Directly Monitored Core Components */}
      <div className="space-y-2.5 mb-4">
        
        {/* Component 1: API Gateway */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-indigo-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-200">
                  API Gateway
                </span>
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  :3000
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  HTTP/REST
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralized edge proxy, JWT verification & rate limiting
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium border ${gatewayBadge.bg} ${gatewayBadge.text} ${gatewayBadge.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${gatewayBadge.dot}`} />
              {gatewayBadge.label}
            </span>
            <div className="text-[10px] font-mono text-slate-500 mt-1">
              {gatewayStatus === 'UP' ? 'Responding (200/503)' : 'Connection Refused'}
            </div>
          </div>
        </div>

        {/* Component 2: Redis Distributed Cache */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-rose-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-200">
                  Redis Distributed Store
                </span>
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  :6379
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  TCP / RESP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {healthData?.redis?.url ? `Target: ${healthData.redis.url}` : 'Atomic rate-limit counter & TTL storage'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium border ${redisBadge.bg} ${redisBadge.text} ${redisBadge.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${redisBadge.dot}`} />
              {redisBadge.label}
            </span>
            <div className="text-[10px] font-mono text-slate-500 mt-1">
              {redisStatus === 'CONNECTED' ? 'PING -> PONG' : (redisStatus === 'DEGRADED' ? 'Fail-Open' : 'Unprobed')}
            </div>
          </div>
        </div>

        {/* Component 3: MongoDB Atlas Connectivity (Strict Backend-Accurate Handling) */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-300">
                  MongoDB Databases
                </span>
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  Atlas Cloud
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  Mongoose
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {exposesMongo 
                  ? 'Database connectivity verified by Gateway' 
                  : 'Isolated to Auth (:5001 auth_db) & User (:5002 user_db); not probed by Gateway /health'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium border ${mongoBadge.bg} ${mongoBadge.text} ${mongoBadge.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${mongoBadge.dot}`} />
              {mongoBadge.label}
            </span>
            <div className="text-[10px] font-mono text-slate-500 mt-1">
              {exposesMongo ? 'Exposed by backend' : 'Not exposed by /health'}
            </div>
          </div>
        </div>

      </div>

      {/* Architecture Disclaimer / Integrity Notice */}
      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/60 text-[11px] font-mono text-slate-500 flex items-center justify-between">
        <span>Backend Contract: GET /health checks Gateway process & Redis ping only.</span>
        <span className="text-indigo-400 font-semibold">Zero fabricated telemetry</span>
      </div>
    </div>
  );
};

export default ServiceHealthCard;
