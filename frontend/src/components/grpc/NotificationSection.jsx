import React, { useState } from 'react';
import { 
  Send, 
  Radio, 
  CheckCircle2, 
  AlertOctagon, 
  Terminal, 
  ArrowRight,
  Mail,
  Loader2
} from 'lucide-react';
import { PLACEHOLDER_NOTICE } from '../../utils/mockData';

export const NotificationSection = () => {
  const [recipient, setRecipient] = useState('developer@microservices.local');
  const [subject, setSubject] = useState('Deployment Notification');
  const [message, setMessage] = useState('Cluster status is optimal. All 4 services healthy.');

  const [callState, setCallState] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'

  const handleSimulateCall = () => {
    setCallState('sending');
    setTimeout(() => {
      setCallState('success');
    }, 800);
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
          <span className="text-indigo-400 font-semibold">User Service</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="text-cyan-400 font-semibold">proto/notification.proto</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="text-emerald-400 font-semibold">Notification Service:50053</span>
        </div>
        <p className="text-slate-400 text-[11px]">
          Synchronous binary procedure call <code className="text-cyan-300 font-mono">SendEmail(SendEmailRequest)</code>. No internal HTTP overhead.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              RECIPIENT EMAIL
            </label>
            <input
              type="email"
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
              onClick={() => setCallState('error')}
              className="text-[11px] font-mono text-slate-500 hover:text-rose-400 transition-colors"
            >
              Test 502 RPC Fail
            </button>
            <span className="text-slate-700">|</span>
            <button
              type="button"
              onClick={() => setCallState('idle')}
              className="text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
            >
              Reset
            </button>
          </div>

          <button
            type="button"
            disabled={callState === 'sending'}
            onClick={handleSimulateCall}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium text-xs shadow-md transition-colors flex items-center gap-2"
          >
            {callState === 'sending' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Dispatching RPC...
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
      {callState === 'success' && (
        <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1 font-mono">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            200 OK — gRPC Response Received
          </div>
          <pre className="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
{JSON.stringify(
  {
    success: true,
    message: "Notification sent via gRPC successfully",
    data: {
      success: true,
      message: "Email sent successfully"
    }
  },
  null,
  2
)}
          </pre>
        </div>
      )}

      {/* Result Card: 502 Error Response */}
      {callState === 'error' && (
        <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs">
          <div className="flex items-center gap-2 text-rose-400 font-semibold mb-1 font-mono">
            <AlertOctagon className="w-4 h-4 flex-shrink-0" />
            502 Bad Gateway — RPC Handshake Failure
          </div>
          <p className="text-[11px] text-slate-300 font-mono">
            "Failed to communicate with Notification Service via gRPC: 14 UNAVAILABLE: connection refused"
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationSection;
