import React, { useState } from 'react';
import { 
  Send, 
  Radio, 
  CheckCircle2, 
  AlertOctagon, 
  ArrowRight, 
  Loader2,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { triggerGrpcNotification } from '../../services/gatewayService';

export const NotificationSection = () => {
  const { isAuthenticated } = useAuth();
  const [recipient, setRecipient] = useState('engineer@microservices.local');
  const [subject, setSubject] = useState('Deployment Notification');
  const [message, setMessage] = useState('Cluster status is optimal. All 4 services healthy.');

  const [callState, setCallState] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'
  const [responseData, setResponseData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSendRpc = async (e) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) {
      setErrorMessage('Action blocked: JWT Authentication is required to dispatch notifications through the Gateway.');
      setCallState('error');
      return;
    }

    setCallState('sending');
    setResponseData(null);
    setErrorMessage(null);

    try {
      const result = await triggerGrpcNotification({ recipient, subject, message });
      setResponseData(result);
      setCallState('success');
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 
        err.response?.data?.error || 
        err.message || 
        'RPC call failed.'
      );
      setCallState('error');
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
              gRPC Inter-Service Communication
            </h2>
            <p className="text-xs text-slate-400">
              User Service (:5002) &rarr; Notification Service (:50053 gRPC)
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
          HTTP/2 Protocol Buffers
        </span>
      </div>

      {/* Protocol Architecture Banner */}
      <div className="mb-4 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 mb-2 font-mono text-[11px]">
          <span className="text-indigo-400 font-semibold">Gateway :3000</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="text-cyan-400 font-semibold">User Service :5002</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="text-emerald-400 font-semibold">gRPC Client (:50053)</span>
        </div>
        <p className="text-slate-400 text-[11px]">
          Invokes <code className="text-cyan-300 font-mono">POST /api/users/test-notification</code> at Gateway, prompting User Service to execute binary gRPC call <code className="text-cyan-300 font-mono">SendEmail()</code>.
        </p>
      </div>

      {/* Protected Notice when unauthenticated */}
      {!isAuthenticated && (
        <div className="mb-4 p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Protected Route: Requires valid JWT to access User Service endpoint.</span>
          </div>
          <span className="text-[10px] text-amber-400/90 font-medium">GUEST MODE</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSendRpc} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              RECIPIENT EMAIL
            </label>
            <input
              type="email"
              required
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              SUBJECT LINE
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-slate-400 mb-1">
            MESSAGE BODY
          </label>
          <textarea
            rows={2}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Buttons & Status Controls */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setCallState('idle'); setResponseData(null); setErrorMessage(null); }}
              className="text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
            >
              Reset Status
            </button>
          </div>

          <button
            type="submit"
            disabled={!isAuthenticated || callState === 'sending'}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-xs shadow-md transition-colors flex items-center gap-2"
          >
            {callState === 'sending' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Dispatching RPC...
              </>
            ) : !isAuthenticated ? (
              <>
                <Lock className="w-3.5 h-3.5" /> Login Required to Dispatch
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" /> Dispatch gRPC Email
              </>
            )}
          </button>
        </div>
      </form>

      {/* Result Card: Success Response */}
      {callState === 'success' && responseData && (
        <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1 font-mono">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            200 OK — gRPC Response Received
          </div>
          <pre className="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
{JSON.stringify(responseData, null, 2)}
          </pre>
        </div>
      )}

      {/* Result Card: Error Response */}
      {callState === 'error' && (
        <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs">
          <div className="flex items-center gap-2 text-rose-400 font-semibold mb-1 font-mono">
            <AlertOctagon className="w-4 h-4 flex-shrink-0" />
            Error Received from Gateway / User Service
          </div>
          <p className="text-[11px] text-slate-300 font-mono break-words">
            {errorMessage || 'Unknown error occurred while contacting gRPC service.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationSection;
