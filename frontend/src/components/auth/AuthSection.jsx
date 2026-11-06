import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  LogIn, 
  UserPlus, 
  Check, 
  Eye, 
  EyeOff, 
  Lock, 
  ShieldCheck, 
  Copy,
  LogOut,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { login, register } from '../../services/gatewayService';
import { useRequestTelemetry } from '../../context/RequestContext';

export const AuthSection = () => {
  const { authNotice, clearAuthNotice } = useRequestTelemetry();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [decodedPayload, setDecodedPayload] = useState(null);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Form states
  const [email, setEmail] = useState('engineer@example.com');
  const [password, setPassword] = useState('SecurePassword123');
  const [name, setName] = useState('Engineer');

  // Decode JWT payload on token change
  useEffect(() => {
    if (!token) {
      setDecodedPayload(null);
      return;
    }
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payloadJson = atob(parts[1]);
        setDecodedPayload(JSON.parse(payloadJson));
      }
    } catch {
      setDecodedPayload(null);
    }
  }, [token]);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setActionMessage('Logged out. Token removed from localStorage.');
    setErrorMessage(null);
    clearAuthNotice();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setActionMessage(null);
    setErrorMessage(null);

    try {
      if (tab === 'login') {
        const response = await login({ email, password });
        if (response.data?.token) {
          localStorage.setItem('token', response.data.token);
          setToken(response.data.token);
          setActionMessage('Login successful! JWT stored in localStorage.');
        }
      } else {
        const response = await register({ name, email, password });
        setActionMessage(response.message || 'User registered successfully! You can now log in.');
        setTab('login');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication request failed.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isAuthenticated = Boolean(token);

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
          {isAuthenticated ? (
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

      {/* 401 Notice Banner from Interceptor */}
      {authNotice && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>HTTP 401: {authNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={clearAuthNotice}
            className="text-[10px] text-slate-400 hover:text-slate-200 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Action Success & Error Alerts */}
      {actionMessage && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800/60 pb-3">
        <button
          type="button"
          onClick={() => { setTab('login'); setErrorMessage(null); }}
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
          onClick={() => { setTab('register'); setErrorMessage(null); }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            tab === 'register'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" /> Register (POST /api/auth/register)
        </button>

        {isAuthenticated && (
          <button
            type="button"
            onClick={handleLogout}
            className="ml-auto text-xs font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3 h-3" /> Logout
          </button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {tab === 'register' && (
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">
              FULL NAME
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Engineer"
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
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="engineer@example.com"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">
              PASSWORD (BCRYPT HASHED)
            </label>
            <input
              type="password"
              required
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
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs shadow-md transition-colors flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...
              </>
            ) : tab === 'login' ? (
              <>
                <LogIn className="w-3.5 h-3.5" /> Execute Login
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" /> Execute Register
              </>
            )}
          </button>
        </div>
      </form>

      {/* Active JWT Inspector Sub-panel */}
      {isAuthenticated && (
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
              {token}
            </div>
          )}

          {/* Decoded Payload Grid */}
          {decodedPayload && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">USER ID (sub)</span>
                <span className="text-indigo-300 font-medium truncate block">
                  {decodedPayload.userId}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">EMAIL</span>
                <span className="text-slate-200 truncate block">
                  {decodedPayload.email}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">EXPIRES</span>
                <span className="text-emerald-400 block">
                  {new Date(decodedPayload.exp * 1000).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthSection;
