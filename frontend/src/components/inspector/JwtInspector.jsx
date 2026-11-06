import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  LogOut, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  User, 
  Mail, 
  AlertTriangle,
  Info,
  Lock
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../context/AuthContext';

export const JwtInspector = () => {
  const { token, isAuthenticated, logout } = useAuth();

  const [decoded, setDecoded] = useState(null);
  const [decodeError, setDecodeError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nowSeconds, setNowSeconds] = useState(() => Math.floor(Date.now() / 1000));

  // Ticking timer every second to keep expiration calculation live
  useEffect(() => {
    if (!token) return;
    const timer = setInterval(() => {
      setNowSeconds(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [token]);

  // Decode JWT payload on token change using jwt-decode
  useEffect(() => {
    if (!token) {
      setDecoded(null);
      setDecodeError(null);
      return;
    }

    try {
      const payload = jwtDecode(token);
      setDecoded(payload);
      setDecodeError(null);
    } catch (err) {
      setDecoded(null);
      setDecodeError(err.message || 'Failed to decode JWT string');
    }
  }, [token]);

  // Handle copy token to clipboard
  const handleCopy = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compute expiration status
  const expTimestamp = decoded?.exp || null;
  const iatTimestamp = decoded?.iat || null;
  const isExpired = expTimestamp ? expTimestamp < nowSeconds : false;
  const secondsRemaining = expTimestamp ? Math.max(0, expTimestamp - nowSeconds) : null;

  // Format seconds to mm:ss or hh:mm:ss
  const formatCountdown = (totalSeconds) => {
    if (totalSeconds === null) return 'N/A';
    if (totalSeconds <= 0) return 'Expired';
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  // Masked token preview string
  const getMaskedToken = (rawToken) => {
    if (!rawToken || rawToken.length < 32) return rawToken || '';
    const prefix = rawToken.slice(0, 24);
    const suffix = rawToken.slice(-8);
    return `${prefix}••••••••••••••••••••••••••••••••••••••••••••${suffix}`;
  };

  // Split token into its 3 standard parts
  const tokenParts = token ? token.split('.') : [];
  const headerPart = tokenParts[0] || '';
  const payloadPart = tokenParts[1] || '';
  const signaturePart = tokenParts[2] || '';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
                JWT Inspection & Claims
              </h2>
              {isAuthenticated && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-medium ${
                  isExpired 
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}>
                  {isExpired ? 'EXPIRED' : 'ACTIVE / VALID'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Client-side payload inspection via <code className="text-indigo-300 font-mono">jwt-decode</code>
            </p>
          </div>
        </div>

        {/* Action Controls: Copy & Logout */}
        {isAuthenticated && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
              title="Copy Bearer JWT to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy JWT'}</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 hover:bg-rose-950/30 hover:border-rose-900 text-slate-400 hover:text-rose-400 text-xs font-mono flex items-center gap-1.5 transition-colors"
              title="Clear session and logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Security Architectural Notice (Decoding vs. Verifying) */}
      <div className="mb-4 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20 text-xs">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1 font-mono text-[11px]">
          <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Security Protocol: Decoding vs. Signature Verification</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Decoding a token on the frontend extracts unverified Base64URL claims. It is <strong className="text-slate-200">not</strong> proof of authentication. The API Gateway authoritatively verifies the HMAC-SHA256 signature using the server secret key before routing requests.
        </p>
      </div>

      {/* Empty State: No Active Token */}
      {!isAuthenticated && (
        <div className="p-6 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-900 text-slate-500 flex items-center justify-center mx-auto mb-2.5">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-mono font-semibold text-slate-300 mb-1">
            No Active JWT In Session
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Log in through the Authentication panel to generate a signed JWT from Auth Service (:5001) and inspect its claims.
          </p>
        </div>
      )}

      {/* Active Token Inspector View */}
      {isAuthenticated && (
        <div className="space-y-4">
          
          {/* 1. Decoded Claims Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            
            {/* Claim 1: User ID */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                USER ID (sub)
              </span>
              <span className="text-xs font-mono text-indigo-300 font-semibold truncate block" title={decoded?.userId || 'N/A'}>
                {decoded?.userId || 'N/A'}
              </span>
            </div>

            {/* Claim 2: Email */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                IDENTITY (email)
              </span>
              <span className="text-xs font-mono text-slate-200 truncate block" title={decoded?.email || 'N/A'}>
                {decoded?.email || 'N/A'}
              </span>
            </div>

            {/* Claim 3: Issued At */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                ISSUED AT (iat)
              </span>
              <span className="text-xs font-mono text-slate-300 block">
                {iatTimestamp ? new Date(iatTimestamp * 1000).toLocaleTimeString() : 'N/A'}
              </span>
              {iatTimestamp && (
                <span className="text-[10px] font-mono text-slate-500">
                  {new Date(iatTimestamp * 1000).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Claim 4: Expiration & Status */}
            <div className={`p-3 rounded-lg border ${
              isExpired 
                ? 'bg-rose-500/10 border-rose-500/30' 
                : 'bg-slate-950 border-slate-800/80'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  EXPIRATION (exp)
                </span>
                <span className={`text-[10px] font-mono px-1 rounded ${
                  isExpired ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {isExpired ? 'EXPIRED' : formatCountdown(secondsRemaining)}
                </span>
              </div>
              <span className={`text-xs font-mono font-semibold block ${isExpired ? 'text-rose-400' : 'text-emerald-400'}`}>
                {expTimestamp ? new Date(expTimestamp * 1000).toLocaleTimeString() : 'No exp claim'}
              </span>
            </div>

          </div>

          {/* 2. Masked / Collapsible Token View */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                Raw JWT Token (RFC 7519)
              </span>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                {isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{isExpanded ? 'Mask Token' : 'Reveal Full Token'}</span>
              </button>
            </div>

            {/* Collapsed / Masked format */}
            {!isExpanded && (
              <div className="font-mono text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800/80 break-all select-all">
                {getMaskedToken(token)}
              </div>
            )}

            {/* Expanded Full Token format with segment breakdown */}
            {isExpanded && (
              <div className="space-y-2 pt-1">
                <div className="font-mono text-[11px] p-2.5 rounded bg-slate-900/90 border border-slate-800 break-all select-all leading-relaxed">
                  <span className="text-rose-400" title="Header (Algorithm & Token Type)">{headerPart}</span>
                  <span className="text-slate-600">.</span>
                  <span className="text-indigo-300" title="Payload (User Claims)">{payloadPart}</span>
                  <span className="text-slate-600">.</span>
                  <span className="text-cyan-400" title="Signature (HMAC-SHA256)">{signaturePart}</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" /> Header (Base64URL)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-300" /> Payload (Base64URL)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" /> HMAC Signature
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Decoding error banner if token malformed */}
          {decodeError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Token decoding failed: {decodeError}</span>
            </div>
          )}

          {/* Footer Security Note */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
            <span>Algorithm: HS256 &bull; Issuer: Auth Service (:5001)</span>
            <span className="text-indigo-400 font-semibold">JWT_SECRET: Never Exposed to Client</span>
          </div>

        </div>
      )}
    </div>
  );
};

export default JwtInspector;

