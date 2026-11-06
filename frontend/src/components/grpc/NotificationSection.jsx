import React, { useState } from 'react';
import { 
  Send, 
  Radio, 
  CheckCircle2, 
  AlertOctagon, 
  Loader2,
  Lock,
  Mail,
  FileText,
  RotateCcw,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { triggerGrpcNotification } from '../../services/gatewayService';
import { GrpcPipelineVisualizer } from './GrpcPipelineVisualizer';

export const NotificationSection = () => {
  const { isAuthenticated } = useAuth();

  // Form Fields
  const [recipient, setRecipient] = useState('engineer@microservices.local');
  const [subject, setSubject] = useState('Production Deployment Ready');
  const [message, setMessage] = useState('Cluster status is optimal. All 4 microservices healthy.');

  // Validation Errors
  const [errors, setErrors] = useState({});

  // Submission & Pipeline Telemetry States
  const [callState, setCallState] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'
  const [httpStatus, setHttpStatus] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [durationMs, setDurationMs] = useState(null);

  // Field validation logic
  const validateForm = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!recipient.trim()) {
      errs.recipient = 'Recipient email is required.';
    } else if (!emailRegex.test(recipient.trim())) {
      errs.recipient = 'Please enter a valid email address.';
    }

    if (!subject.trim()) {
      errs.subject = 'Subject line is required.';
    } else if (subject.trim().length < 3) {
      errs.subject = 'Subject must be at least 3 characters.';
    }

    if (!message.trim()) {
      errs.message = 'Message body is required.';
    } else if (message.trim().length < 5) {
      errs.message = 'Message must be at least 5 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendRpc = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!isAuthenticated) {
      setErrorMessage('Action blocked: JWT Authentication is required. The API Gateway requires a verified Bearer token to route to /api/users/*.');
      setHttpStatus(401);
      setCallState('error');
      return;
    }

    setCallState('sending');
    setResponseData(null);
    setErrorMessage(null);
    setHttpStatus(null);

    const startTime = performance.now();

    try {
      // Centralized Axios client attaches JWT Authorization: Bearer <token>
      const result = await triggerGrpcNotification({
        recipient: recipient.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      const duration = Math.round(performance.now() - startTime);
      setDurationMs(duration);

      // Verify the backend confirms successful gRPC completion
      if (result && result.success) {
        setHttpStatus(200);
        setResponseData(result);
        setCallState('success');
      } else {
        setHttpStatus(502);
        setErrorMessage(result?.message || 'Backend returned an unconfirmed response.');
        setCallState('error');
      }
    } catch (err) {
      const duration = Math.round(performance.now() - startTime);
      setDurationMs(duration);

      const status = err.response ? err.response.status : 0;
      setHttpStatus(status);
      setErrorMessage(
        err.response?.data?.message || 
        err.response?.data?.error || 
        err.message || 
        'gRPC communication pipeline failed.'
      );
      setCallState('error');
    }
  };

  const handleReset = () => {
    setCallState('idle');
    setResponseData(null);
    setErrorMessage(null);
    setHttpStatus(null);
    setDurationMs(null);
    setErrors({});
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
              gRPC Notification Panel
            </h2>
            <p className="text-xs text-slate-400">
              Dispatch email notifications via Gateway HTTP &rarr; User Service &rarr; Notification Service (gRPC)
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
          gRPC :50053 Internal Socket
        </span>
      </div>

      {/* 2. Notification Dispatch Form */}
      <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 space-y-3">
        {/* Protected Notice when unauthenticated */}
        {!isAuthenticated && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Authentication Guard: Route <code className="text-amber-200">/api/users/*</code> requires a valid JWT.</span>
            </div>
            <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40">
              UNAUTHENTICATED
            </span>
          </div>
        )}

        <form onSubmit={handleSendRpc} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Recipient Email */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>RECIPIENT EMAIL</span>
              </label>
              <input
                type="email"
                value={recipient}
                onChange={(e) => {
                  setRecipient(e.target.value);
                  if (errors.recipient) setErrors((prev) => ({ ...prev, recipient: null }));
                }}
                placeholder="e.g. user@domain.com"
                className={`w-full px-3 py-2 rounded-lg bg-slate-900 border text-xs font-mono text-slate-200 focus:outline-none transition-colors ${
                  errors.recipient
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-slate-800 focus:border-cyan-500'
                }`}
              />
              {errors.recipient && (
                <span className="text-[11px] font-mono text-rose-400 mt-1 block">
                  {errors.recipient}
                </span>
              )}
            </div>

            {/* Subject Line */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>SUBJECT</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (errors.subject) setErrors((prev) => ({ ...prev, subject: null }));
                }}
                placeholder="e.g. System Alert"
                className={`w-full px-3 py-2 rounded-lg bg-slate-900 border text-xs font-mono text-slate-200 focus:outline-none transition-colors ${
                  errors.subject
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-slate-800 focus:border-cyan-500'
                }`}
              />
              {errors.subject && (
                <span className="text-[11px] font-mono text-rose-400 mt-1 block">
                  {errors.subject}
                </span>
              )}
            </div>
          </div>

          {/* Message Body */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              MESSAGE BODY
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errors.message) setErrors((prev) => ({ ...prev, message: null }));
              }}
              placeholder="Type your notification message here..."
              className={`w-full px-3 py-2 rounded-lg bg-slate-900 border text-xs font-mono text-slate-200 focus:outline-none transition-colors ${
                errors.message
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-slate-800 focus:border-cyan-500'
              }`}
            />
            {errors.message && (
              <span className="text-[11px] font-mono text-rose-400 mt-1 block">
                {errors.message}
              </span>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset Pipeline
            </button>

            <button
              type="submit"
              disabled={callState === 'sending' || !isAuthenticated}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {callState === 'sending' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  Dispatching via gRPC...
                </>
              ) : !isAuthenticated ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  Login Required
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Send via gRPC Pipeline
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Interactive gRPC Architecture Pipeline Visualizer */}
      <GrpcPipelineVisualizer
        callState={callState}
        httpStatus={httpStatus}
        responseData={responseData}
        errorMessage={errorMessage}
        durationMs={durationMs}
        endpoint="POST /api/users/test-notification"
        payload={{ recipient, subject, message }}
      />

      {/* 4. Result Card: Confirmed Success Response */}
      {callState === 'success' && responseData && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              HTTP {httpStatus || 200} OK — gRPC Pipeline Execution Confirmed
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              SIMULATED DELIVERY
            </span>
          </div>

          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">BACKEND CONFIRMATION:</span>
              <span className="text-emerald-300 font-semibold">{responseData.message}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">RPC RETURN VALUE:</span>
              <span className="text-cyan-300">{responseData.data?.message || 'Email sent successfully'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">DELIVERY STATUS:</span>
              <span className="text-amber-300">Simulated (Logged to Notification Service stdout)</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Simulation Notice:</strong> The Notification Service confirmed receipt and simulated dispatch with latency and ID generation. No real-world external SMTP email was sent.
            </span>
          </div>

          {/* Raw JSON Payload */}
          <details className="mt-2 text-[11px] font-mono">
            <summary className="text-slate-400 hover:text-slate-200 cursor-pointer">
              Inspect Raw JSON Response Payload
            </summary>
            <pre className="mt-1.5 p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 overflow-x-auto text-[10px]">
{JSON.stringify(responseData, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* 5. Result Card: Error Response */}
      {callState === 'error' && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
            <div className="flex items-center gap-2 text-rose-400 font-bold font-mono">
              <AlertOctagon className="w-4 h-4 flex-shrink-0" />
              {httpStatus ? `HTTP ${httpStatus} Error` : 'Pipeline Communication Error'}
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
              FAILED
            </span>
          </div>

          <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
            {errorMessage || 'Unknown error occurred while dispatching through the gRPC pipeline.'}
          </p>

          <div className="p-2 rounded bg-slate-950 border border-rose-500/20 text-[10px] font-mono text-slate-400 space-y-0.5">
            {httpStatus === 401 && (
              <div>• <strong>Cause:</strong> API Gateway rejected request because no valid JWT Authorization header was received.</div>
            )}
            {httpStatus === 502 && (
              <div>• <strong>Cause:</strong> User Service (:5002) failed to reach Notification Service (:50053 gRPC). Ensure the notification service gRPC server is listening.</div>
            )}
            {httpStatus === 429 && (
              <div>• <strong>Cause:</strong> Rate limit exceeded on API Gateway.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSection;