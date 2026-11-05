import React, { useState } from 'react';
import { 
  Network, 
  ArrowRight, 
  Database, 
  Server, 
  Radio, 
  Cpu, 
  ShieldCheck, 
  Zap,
  Globe
} from 'lucide-react';

export const ArchitectureFlow = () => {
  const [activeFlow, setActiveFlow] = useState('all'); // 'all' | 'auth' | 'profile' | 'grpc'

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
              Architecture Topology
            </h2>
            <p className="text-xs text-slate-400">
              Interactive flow path and protocol visualizer
            </p>
          </div>
        </div>

        {/* Flow Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setActiveFlow('all')}
            className={`px-2 py-0.5 rounded transition-all ${
              activeFlow === 'all' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveFlow('auth')}
            className={`px-2 py-0.5 rounded transition-all ${
              activeFlow === 'auth' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Auth Flow
          </button>
          <button
            type="button"
            onClick={() => setActiveFlow('profile')}
            className={`px-2 py-0.5 rounded transition-all ${
              activeFlow === 'profile' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Profile Flow
          </button>
          <button
            type="button"
            onClick={() => setActiveFlow('grpc')}
            className={`px-2 py-0.5 rounded transition-all ${
              activeFlow === 'grpc' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            gRPC Flow
          </button>
        </div>
      </div>

      {/* Visual Topology Diagram */}
      <div className="space-y-4">
        
        {/* Tier 1: Client Ingress */}
        <div className="flex items-center justify-center">
          <div className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2 shadow-sm text-xs font-mono text-slate-300">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>Frontend Client / Browser</span>
          </div>
        </div>

        {/* Downward Connector */}
        <div className="flex justify-center text-slate-600">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-500 border border-slate-800">
            HTTP REST (Port 3000)
          </span>
        </div>

        {/* Tier 2: API Gateway */}
        <div className={`p-3.5 rounded-xl border transition-all ${
          activeFlow !== 'all'
            ? 'bg-indigo-950/20 border-indigo-500/40 shadow-md shadow-indigo-500/5'
            : 'bg-slate-950 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-200">
              <Server className="w-4 h-4 text-indigo-400" />
              API Gateway (:3000)
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
              Reverse Proxy Edge
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-mono text-[10px] text-slate-400">
            <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">
              Structured Logger
            </div>
            <div className={`p-1.5 rounded border text-center transition-colors ${
              activeFlow === 'profile' || activeFlow === 'grpc'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800'
            }`}>
              JWT Verification
            </div>
            <div className={`p-1.5 rounded border text-center transition-colors col-span-2 sm:col-span-1 ${
              activeFlow === 'profile' || activeFlow === 'grpc' || activeFlow === 'auth'
                ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                : 'bg-slate-900 border-slate-800'
            }`}>
              Redis Rate Limit
            </div>
          </div>
        </div>

        {/* Inter-Tier Connector */}
        <div className="flex justify-between items-center text-[10px] font-mono px-3 text-slate-500">
          <span>/api/auth/*</span>
          <span>/api/users/* (x-user-id)</span>
          <span>/api/notifications/*</span>
        </div>

        {/* Tier 3: Microservices Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Auth Service */}
          <div className={`p-3 rounded-lg border transition-all ${
            activeFlow === 'auth'
              ? 'bg-indigo-950/40 border-indigo-500/60 shadow-md'
              : 'bg-slate-950 border-slate-800/80 opacity-70'
          }`}>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-200 mb-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Auth (:5001)
            </div>
            <div className="text-[10px] text-slate-400 font-mono mb-2">
              bcrypt + JWT signing
            </div>
            <div className="text-[10px] font-mono p-1 rounded bg-slate-900 border border-slate-800 text-indigo-300 text-center">
              MongoDB: auth_db
            </div>
          </div>

          {/* User Service */}
          <div className={`p-3 rounded-lg border transition-all ${
            activeFlow === 'profile' || activeFlow === 'grpc'
              ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md'
              : 'bg-slate-950 border-slate-800/80 opacity-70'
          }`}>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-200 mb-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> User (:5002)
            </div>
            <div className="text-[10px] text-slate-400 font-mono mb-2">
              Profile + gRPC Client
            </div>
            <div className="text-[10px] font-mono p-1 rounded bg-slate-900 border border-slate-800 text-cyan-300 text-center">
              MongoDB: user_db
            </div>
          </div>

          {/* Notification Service */}
          <div className={`p-3 rounded-lg border transition-all ${
            activeFlow === 'grpc'
              ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md'
              : 'bg-slate-950 border-slate-800/80 opacity-70'
          }`}>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-200 mb-1">
              <Radio className="w-3.5 h-3.5 text-emerald-400" /> Notif (:50053)
            </div>
            <div className="text-[10px] text-slate-400 font-mono mb-2">
              gRPC Server (HTTP/2)
            </div>
            <div className="text-[10px] font-mono p-1 rounded bg-slate-900 border border-slate-800 text-emerald-300 text-center">
              notification.proto
            </div>
          </div>

        </div>

        {/* Active Flow Legend Callout */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400">
          {activeFlow === 'all' && (
            <span>💡 Select a flow button above to highlight specific microservices communication paths.</span>
          )}
          {activeFlow === 'auth' && (
            <span className="text-indigo-300">
              🟢 <strong>Auth Flow:</strong> Client &rarr; Gateway (:3000) &rarr; Auth Service (:5001) &rarr; MongoDB (auth_db). Returns JWT.
            </span>
          )}
          {activeFlow === 'profile' && (
            <span className="text-cyan-300">
              🟢 <strong>Profile Flow:</strong> Client &rarr; Gateway (JWT Verified) &rarr; Injects <code className="text-emerald-400">x-user-id</code> &rarr; User Service (:5002) &rarr; MongoDB (user_db).
            </span>
          )}
          {activeFlow === 'grpc' && (
            <span className="text-emerald-300">
              🟢 <strong>gRPC Flow:</strong> Gateway &rarr; User Service (:5002) &rarr; [Binary RPC :50053] &rarr; Notification Service (SendEmail).
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

export default ArchitectureFlow;
