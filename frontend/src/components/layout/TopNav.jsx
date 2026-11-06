import React, { useState } from 'react';
import { 
  Server, 
  Copy, 
  Check, 
  Moon, 
  Sun,
  User,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TopNav = ({ gatewayUrl = 'http://localhost:3000' }) => {
  const { isAuthenticated, user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(gatewayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-slate-100 tracking-tight">
                Microservices Control Center
              </h1>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 font-medium">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              API Gateway & Distributed Services Management Console
            </p>
          </div>
        </div>

        {/* System Meta & Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Active User Badge if logged in */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950/50 border border-indigo-800/50 text-xs font-mono text-indigo-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[160px]">{user?.name || user?.email || 'Authenticated'}</span>
            </div>
          )}

          {/* Environment Status Badge */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400 font-mono">ENV:</span>
            <span className="text-emerald-400 font-mono font-medium">LOCAL_DEV</span>
          </div>

          {/* Gateway Target URL Pill */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md p-0.5 pl-2.5 pr-1.5 text-xs text-slate-300">
            <span className="text-slate-500 font-mono mr-1.5 hidden sm:inline">GATEWAY:</span>
            <span className="font-mono text-indigo-300 mr-2 text-[11px] sm:text-xs">
              {gatewayUrl}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              title="Copy API Gateway URL"
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Theme Indicator / Toggle Placeholder */}
          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Theme: Dark console mode (Active)"
          >
            {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

        </div>
      </div>
    </header>
  );
};

export default TopNav;
