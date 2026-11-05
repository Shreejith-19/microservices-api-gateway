import React, { useState } from 'react';
import { 
  KeyRound, 
  LogIn, 
  UserPlus, 
  Check, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Lock, 
  ShieldCheck, 
  Copy,
  LogOut
} from 'lucide-react';
import { MOCK_JWT_PAYLOAD, PLACEHOLDER_NOTICE } from '../../utils/mockData';

export const AuthSection = () => {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form placeholders
  const [email, setEmail] = useState('engineer@microservices.local');
  const [password, setPassword] = useState('Password123');
  const [name, setName] = useState('Alex Mercer');

  const handleCopyToken = () => {
    navigator.clipboard.writeText(MOCK_JWT_PAYLOAD.rawToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
              Identity & Authentication
            </h2>
            <p className="text-xs text-slate-400">
              Auth Service (:5001) credentials & edge JWT issuance
            </p>
          </div>
        </div>

        {/* Current Auth Status Pill */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" /> AUTHENTICATED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700">
              <Lock className="w-3.5 h-3.5" /> GUEST / PUBLIC
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800/60 pb-3">
        <button
          type="button"
          onClick={() => setTab('login')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            tab === 'login'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" /> Login (POST /api/auth/login)
        </button>
        <button
          type="button"
          onClick={() => setTab('register')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            tab === 'register'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" /> Register (POST /api/auth/register)
        </button>

        {/* Quick state toggle for review */}
        <div className="ml-auto flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setIsLoggedIn(!isLoggedIn)}
            className="text-[11px] font-mono px-2 py-1 rounded border border-slate-700 text-slate-400 hover:bg-slate-800 transition-colors"
          >
            Toggle {isLoggedIn ? 'Logout' : 'Login'} State
          </button>
        </div>
      </div>

      {/* Auth Form (Interactive Shell) */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-3.5">
        {tab === 'register' && (
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">
              FULL NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Mercer"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="engineer@microservices.local"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">
              PASSWORD (BCRYPT HASHED)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] text-slate-500 font-mono">
            Calls Gateway port 3000 &rarr; routed to Auth Service:5001
          </p>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition-colors flex items-center gap-2"
          >
            {tab === 'login' ? <LogIn className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
            {tab === 'login' ? 'Simulate Login Request' : 'Simulate Register Request'}
          </button>
        </div>
      </form>

      {/* Active JWT Inspector Sub-panel */}
      {isLoggedIn && (
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                ACTIVE JWT TOKEN & PAYLOAD
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                HS256
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono"
              >
                {showToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showToken ? 'Hide String' : 'Show Token'}
              </button>
              <button
                type="button"
                onClick={handleCopyToken}
                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Copy JWT string"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Raw Token String */}
          {showToken && (
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400 break-all mb-3 select-all">
              {MOCK_JWT_PAYLOAD.rawToken}
            </div>
          )}

          {/* Decoded Payload Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">USER ID (sub)</span>
              <span className="text-indigo-300 font-medium truncate block">
                {MOCK_JWT_PAYLOAD.payload.userId}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">EMAIL</span>
              <span className="text-slate-200 truncate block">
                {MOCK_JWT_PAYLOAD.payload.email}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">EXPIRES</span>
              <span className="text-emerald-400 block">
                1h (Sliding Window)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthSection;
