import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Info,
  Lock,
  MinusCircle
} from 'lucide-react';

/**
 * Reusable Architecture Node Component
 * Represents a single stage in the microservices pipeline.
 *
 * Distinguishes confirmed backend outcomes from inferred in-flight states.
 */
export const PipelineNode = ({
  step,
  title,
  subtitle,
  icon: Icon,
  protocol,
  port,
  status = 'idle', // 'idle' | 'in_flight' | 'success' | 'error' | 'not_reached'
  statusLabel,
  isConfirmed = false,
  isConfigOnly = false,
  configNote,
  rpcMethod,
  detail,
  errorDetail,
  latencyMs,
}) => {
  // Determine color themes based on status
  const getTheme = () => {
    switch (status) {
      case 'success':
        return {
          container: 'bg-emerald-950/20 border-emerald-500/40 shadow-sm',
          header: 'text-emerald-400',
          badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          borderAccent: 'border-l-4 border-l-emerald-500',
        };
      case 'error':
        return {
          container: 'bg-rose-950/25 border-rose-500/50 shadow-sm',
          header: 'text-rose-400',
          badgeBg: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
          iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          borderAccent: 'border-l-4 border-l-rose-500',
        };
      case 'in_flight':
        return {
          container: 'bg-indigo-950/20 border-indigo-500/40 shadow-sm',
          header: 'text-indigo-300',
          badgeBg: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
          iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          borderAccent: 'border-l-4 border-l-indigo-400',
        };
      case 'not_reached':
        return {
          container: 'bg-slate-900/40 border-slate-800/60 opacity-60',
          header: 'text-slate-500',
          badgeBg: 'bg-slate-800/80 border-slate-700/60 text-slate-400',
          iconBg: 'bg-slate-900 text-slate-600 border-slate-800',
          borderAccent: 'border-l-4 border-l-slate-700',
        };
      case 'idle':
      default:
        return {
          container: 'bg-slate-950/70 border-slate-800/80',
          header: 'text-slate-300',
          badgeBg: 'bg-slate-900 border-slate-800 text-slate-400',
          iconBg: 'bg-slate-900 text-slate-400 border-slate-800',
          borderAccent: 'border-l-4 border-l-slate-800',
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 ${theme.container} ${theme.borderAccent}`}
    >
      {/* Top Header: Step Badge & Node Identity */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg border ${theme.iconBg}`}>
            {Icon && <Icon className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                Step {step}
              </span>
              {/* Confirmed vs Inferred status tag */}
              {status !== 'idle' && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold ${
                    isConfirmed
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : status === 'in_flight'
                      ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isConfirmed
                    ? 'CONFIRMED'
                    : status === 'in_flight'
                    ? 'INFERRED IN-FLIGHT'
                    : 'INFERRED'}
                </span>
              )}
            </div>
            <h3 className={`text-sm font-bold font-mono ${theme.header}`}>
              {title}
            </h3>
            {subtitle && (
              <p className="text-[11px] text-slate-400 font-mono">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Status Chip */}
        <div className="text-right flex flex-col items-end gap-1">
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${theme.badgeBg}`}
          >
            {status === 'success' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            {status === 'error' && <XCircle className="w-3 h-3 text-rose-400" />}
            {status === 'in_flight' && <Clock className="w-3 h-3 text-indigo-400 animate-spin" />}
            {status === 'not_reached' && <MinusCircle className="w-3 h-3 text-slate-500" />}
            {status === 'idle' && <Clock className="w-3 h-3 text-slate-500" />}
            {statusLabel || 'READY'}
          </span>

          {latencyMs !== undefined && latencyMs !== null && (
            <span className="text-[10px] font-mono text-slate-400">
              {latencyMs}ms
            </span>
          )}
        </div>
      </div>

      {/* Protocol & Port Configuration Row */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400 mb-2.5 pb-2 border-b border-slate-800/60">
        {protocol && (
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300">
            {protocol}
          </span>
        )}

        {port && (
          <span
            className={`px-2 py-0.5 rounded border flex items-center gap-1 ${
              isConfigOnly
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            {isConfigOnly && <Lock className="w-3 h-3 text-amber-400" />}
            Port: {port}
          </span>
        )}

        {rpcMethod && (
          <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/50 text-cyan-300 truncate max-w-full">
            RPC: <code className="font-bold">{rpcMethod}</code>
          </span>
        )}
      </div>

      {/* Configuration Only Warning (for gRPC Port 50053) */}
      {isConfigOnly && configNote && (
        <div className="mb-2 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-300 flex items-start gap-1.5">
          <Info className="w-3 h-3 flex-shrink-0 mt-0.5 text-amber-400" />
          <span>{configNote}</span>
        </div>
      )}

      {/* Status Detail / Feedback */}
      {detail && (
        <div className="text-[11px] font-mono text-slate-300 bg-slate-950/70 p-2 rounded border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold mb-0.5">
            <Info className="w-3 h-3 text-indigo-400" /> Observation:
          </div>
          <div className="leading-relaxed">{detail}</div>
        </div>
      )}

      {/* Error Specific Detail */}
      {errorDetail && (
        <div className="mt-2 text-[11px] font-mono text-rose-300 bg-rose-500/10 p-2 rounded border border-rose-500/30">
          <div className="flex items-center gap-1.5 text-rose-400 text-[10px] uppercase font-bold mb-0.5">
            <AlertTriangle className="w-3 h-3 text-rose-400" /> Failure Detected at this Boundary:
          </div>
          <div className="leading-relaxed break-words">{errorDetail}</div>
        </div>
      )}
    </div>
  );
};

export default PipelineNode;