import React, { useState } from 'react';
import { 
  HeartPulse, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Database,
  Radio,
  Cpu,
  Loader2
} from 'lucide-react';
import { MOCK_SERVICES_HEALTH } from '../../utils/mockData';
import { fetchGatewayHealth } from '../../services/gatewayService';

export const ServiceHealthCard = () => {
  const [liveHealth, setLiveHealth] = useState(null);
  const [checking, setChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleCheckHealth = async () => {
    setChecking(true);
    setErrorMessage(null);
    try {
      const data = await fetchGatewayHealth();
      setLiveHealth(data);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Health check failed');
      if (err.response?.data) {
        setLiveHealth(err.response.data);
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
              Cluster Service Health
            </h2>
            <p className="text-xs text-slate-400">
              Gateway endpoint & downstream microservices topology
            </p>
          </div>
        </div>

        {/* Live Check Button */}
        <button
          type="button"
          disabled={checking}
          onClick={handleCheckHealth}
          className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
        >
          {checking ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>{checking ? 'Checking...' : 'Ping Gateway /health'}</span>
        </button>
      </div>

      {/* Live Health Result Banner if checked */}
      {liveHealth && (
        <div className={`mb-4 p-3 rounded-lg border text-xs font-mono ${
          liveHealth.status === 'UP'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Gateway Status: {liveHealth.status}
            </span>
            <span className="text-[10px] text-slate-400">{liveHealth.timestamp}</span>
          </div>
          <div className="text-[11px] text-slate-300">
            Redis: <span className="text-indigo-300">{liveHealth.redis?.status}</span> ({liveHealth.redis?.url})
          </div>
        </div>
      )}

      {errorMessage && !liveHealth && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Services Topology List */}
      <div className="space-y-2.5">
        {MOCK_SERVICES_HEALTH.map((service) => {
          let statusLabel = 'ACTIVE';
          let statusStyle = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

          if (liveHealth && service.name === 'Redis') {
            if (!liveHealth.redis?.status?.includes('CONNECTED')) {
              statusLabel = 'DISCONNECTED';
              statusStyle = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
            }
          }

          return (
            <div
              key={service.name}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  {service.protocol.includes('gRPC') ? (
                    <Radio className="w-4 h-4 text-cyan-400" />
                  ) : service.name === 'Redis' ? (
                    <Database className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Cpu className="w-4 h-4 text-indigo-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-200">
                      {service.name}
                    </span>
                    <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      :{service.port}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {service.protocol}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {service.role}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${statusStyle}`}
                >
                  <CheckCircle2 className="w-3 h-3" /> {statusLabel}
                </span>
                <div className="text-[10px] font-mono text-slate-500 mt-1">
                  Target: {service.endpoint}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceHealthCard;
