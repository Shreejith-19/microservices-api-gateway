import React from 'react';
import { Network, ShieldCheck, Activity } from 'lucide-react';

function App() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Microservices Architecture Dashboard
            </h1>
            <p className="text-sm text-slate-400">
              Frontend Scaffolding Initialized
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <span className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              API Gateway Target
            </span>
            <span className="font-mono text-xs px-2.5 py-1 bg-slate-950 text-indigo-300 rounded border border-slate-800">
              {apiBaseUrl}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <span className="flex items-center gap-2 text-slate-300">
              <Activity className="w-4 h-4 text-cyan-400" />
              Framework & Styling
            </span>
            <span className="text-xs text-slate-400">
              React + Vite + Tailwind CSS v4
            </span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-500">
            Centralized Axios client configured at <code className="text-slate-400 font-mono">src/services/api.js</code>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
