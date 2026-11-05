import React, { useState } from 'react';
import { 
  HeartPulse, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Database,
  Radio,
  Cpu
} from 'lucide-react';
import { MOCK_SERVICES_HEALTH, PLACEHOLDER_NOTICE } from '../../utils/mockData';

export const ServiceHealthCard = () => {
  const [viewState, setViewState] = useState('loaded'); // 'loaded' | 'loading' | 'degraded'

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

        {/* State Toggle for UI Review */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-md border border-slate-800 text-[11px]">
          <span className="text-slate-500 font-mono text-[10px] px-1">VIEW:</span>
          <button
            type="button"
            onClick={() => setViewState('loaded')}
            className={`px-2 py-0.5 rounded transition-all font-mono ${
              viewState === 'loaded' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Normal
          </button>
          <button
            type="button"
            onClick={() => setViewState('degraded')}
            className={`px-2 py-0.5 rounded transition-all font-mono ${
              viewState === 'degraded' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Degraded
          </button>
          <button
            type="button"
            onClick={() => setViewState('loading')}
            className={`px-2 py-0.5 rounded transition-all font-mono ${
              viewState === 'loading' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Skeleton
          </button>
        </div>
      </div>

      {/* Simulated Telemetry Banner */}
      <div className="mb-4 px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-300">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
          <span>{PLACEHOLDER_NOTICE.disclaimer}</span>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 font-semibold uppercase">
          {PLACEHOLDER_NOTICE.badgeText}
        </span>
      </div>

      {/* Loading Skeleton State */}
      {viewState === 'loading' && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-700/60" />
                <div className="space-y-1.5">
                  <div className="w-24 h-3 rounded bg-slate-700/60" />
                  <div className="w-48 h-2 rounded bg-slate-800" />
                </div>
              </div>
              <div className="w-16 h-4 rounded bg-slate-700/60" />
            </div>
          ))}
        </div>
      )}

      {/* Loaded / Degraded State */}
      {viewState !== 'loading' && (
        <div className="space-y-2.5">
          {MOCK_SERVICES_HEALTH.map((service) => {
            const isDegraded = viewState === 'degraded' && service.name === 'Redis';
            const statusColor = isDegraded
              ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
              : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

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
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${statusColor}`}
                  >
                    {isDegraded ? (
                      <>
                        <AlertCircle className="w-3 h-3" /> DISCONNECTED
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> HEALTHY
                      </>
                    )}
                  </span>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    Target: {service.endpoint}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ServiceHealthCard;

