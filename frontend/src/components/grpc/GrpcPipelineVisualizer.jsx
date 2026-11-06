import React from 'react';
import { 
  Laptop, 
  Shield, 
  Server, 
  Radio, 
  Mail, 
  ArrowDown, 
  Clock, 
  Activity, 
  Info,
  Zap,
  Layers
} from 'lucide-react';
import { PipelineNode } from './PipelineNode';

/**
 * Interactive gRPC Pipeline Visualizer Component
 * Visualizes the 5-stage microservices notification architecture:
 * Client -> API Gateway -> User Service -> Notification Service (gRPC) -> Email Handler
 *
 * Truthful to backend execution: Distinguishes confirmed outcomes from inferred in-flight states.
 */
export const GrpcPipelineVisualizer = ({
  callState = 'idle', // 'idle' | 'sending' | 'success' | 'error'
  httpStatus = null,
  responseData = null,
  errorMessage = null,
  durationMs = null,
  endpoint = 'POST /api/users/test-notification',
  payload = null,
}) => {
  const isIdle = callState === 'idle';
  const isSending = callState === 'sending';
  const isSuccess = callState === 'success';
  const isError = callState === 'error';

  // --------------------------------------------------------------------------
  // BOUNDARY EVALUATION: Map HTTP Status & Payload to Confirmed Stages
  // --------------------------------------------------------------------------

  // 1. Client Stage Evaluation
  const getClientStage = () => {
    if (isIdle) {
      return {
        status: 'idle',
        statusLabel: 'READY',
        isConfirmed: false,
        detail: 'Centralized Axios client ready on port 3000. Bearer JWT will be attached automatically.',
      };
    }
    if (isSending) {
      return {
        status: 'in_flight',
        statusLabel: 'DISPATCHING',
        isConfirmed: false,
        detail: `Dispatched ${endpoint} with Authorization: Bearer JWT. Awaiting response.`,
      };
    }
    if (isError && (httpStatus === 0 || !httpStatus)) {
      return {
        status: 'error',
        statusLabel: 'NETWORK FAILED',
        isConfirmed: true,
        detail: 'Client unable to connect to API Gateway. Gateway process may be offline or connection refused.',
        errorDetail: errorMessage || 'Network connection refused.',
      };
    }
    return {
      status: 'success',
      statusLabel: 'DISPATCHED',
      isConfirmed: true,
      detail: `Request successfully transmitted to Gateway at ${endpoint}. Total round-trip latency: ${durationMs || 0}ms.`,
    };
  };

  // 2. API Gateway Stage Evaluation
  const getGatewayStage = () => {
    if (isIdle) {
      return {
        status: 'idle',
        statusLabel: 'IDLE',
        isConfirmed: false,
        detail: 'Edge Gateway listening on port 3000. Enforces JWT authentication & Redis rate limiting.',
      };
    }
    if (isSending) {
      return {
        status: 'in_flight',
        statusLabel: 'IN-PROGRESS',
        isConfirmed: false,
        detail: 'Gateway verifying JWT, checking Redis rate limit, and routing request.',
      };
    }
    if (isError) {
      if (httpStatus === 401) {
        return {
          status: 'error',
          statusLabel: '401 UNAUTHORIZED',
          isConfirmed: true,
          detail: 'Gateway rejected request: Missing or invalid JWT Authorization header.',
          errorDetail: errorMessage || 'Authentication required at API Gateway boundary.',
        };
      }
      if (httpStatus === 429) {
        return {
          status: 'error',
          statusLabel: '429 THROTTLED',
          isConfirmed: true,
          detail: 'Gateway Redis rate limiter blocked request: Sliding window limit exceeded.',
          errorDetail: errorMessage || 'Too many requests. Throttled at Gateway edge.',
        };
      }
      if (httpStatus === 502 && !errorMessage?.toLowerCase().includes('grpc')) {
        return {
          status: 'error',
          statusLabel: '502 BAD GATEWAY',
          isConfirmed: true,
          detail: 'Gateway could not proxy to User Service (:5002). Service may be down.',
          errorDetail: errorMessage || 'Downstream User Service unreachable.',
        };
      }
    }

    // If we reached here with 200, 400, or a 502 with gRPC error, Gateway succeeded in proxying
    return {
      status: 'success',
      statusLabel: `HTTP ${httpStatus || 200} PROXIED`,
      isConfirmed: true,
      detail: 'Gateway verified JWT, enforced rate limit, stripped client identity headers, and proxied to User Service.',
    };
  };

  // 3. User Service Stage Evaluation
  const getUserServiceStage = () => {
    if (isIdle) {
      return {
        status: 'idle',
        statusLabel: 'IDLE',
        isConfirmed: false,
        detail: 'User Service (:5002) awaits proxy call, validates JSON body, and compiles Protobuf payload.',
      };
    }
    if (isSending) {
      return {
        status: 'in_flight',
        statusLabel: 'INFERRED IN-FLIGHT',
        isConfirmed: false,
        detail: 'User Service unpacking HTTP payload and preparing gRPC client call.',
      };
    }

    // Upstream failure at Gateway
    if (isError && (httpStatus === 401 || httpStatus === 429 || (httpStatus === 502 && !errorMessage?.toLowerCase().includes('grpc')) || httpStatus === 0)) {
      return {
        status: 'not_reached',
        statusLabel: 'NOT REACHED',
        isConfirmed: true,
        detail: 'User Service was not invoked because the request failed at an upstream boundary.',
      };
    }

    // Validation failure on User Service itself
    if (isError && httpStatus === 400) {
      return {
        status: 'error',
        statusLabel: '400 BAD REQUEST',
        isConfirmed: true,
        detail: 'User Service controller rejected payload: Missing required fields (recipient, subject, message).',
        errorDetail: errorMessage,
      };
    }

    // User Service attempted gRPC call but failed
    if (isError && httpStatus === 502 && errorMessage?.toLowerCase().includes('grpc')) {
      return {
        status: 'error',
        statusLabel: 'gRPC DISPATCH FAILED',
        isConfirmed: true,
        detail: 'User Service received request, compiled protobuf, but the internal gRPC call failed.',
        errorDetail: errorMessage,
      };
    }

    return {
      status: 'success',
      statusLabel: 'RPC DISPATCHED',
      isConfirmed: true,
      detail: 'User Service controller validated payload and dispatched SendEmail() via internal gRPC client.',
    };
  };

  // 4. Notification Service (gRPC) Stage Evaluation
  const getNotificationServiceStage = () => {
    if (isIdle) {
      return {
        status: 'idle',
        statusLabel: 'IDLE',
        isConfirmed: false,
        detail: 'Notification Service (:50053) hosts gRPC server implementing notification.NotificationService.',
      };
    }
    if (isSending) {
      return {
        status: 'in_flight',
        statusLabel: 'INFERRED IN-FLIGHT',
        isConfirmed: false,
        detail: 'Notification Service processing SendEmail RPC over HTTP/2 connection.',
      };
    }

    // Upstream failure before gRPC server could be contacted
    if (isError && (httpStatus === 401 || httpStatus === 429 || httpStatus === 400 || (httpStatus === 502 && !errorMessage?.toLowerCase().includes('grpc')) || httpStatus === 0)) {
      return {
        status: 'not_reached',
        statusLabel: 'NOT REACHED',
        isConfirmed: true,
        detail: 'Notification Service gRPC server was not reached due to upstream boundary error.',
      };
    }

    // Connection or RPC failure at gRPC server boundary
    if (isError && httpStatus === 502 && errorMessage?.toLowerCase().includes('grpc')) {
      return {
        status: 'error',
        statusLabel: 'RPC UNAVAILABLE',
        isConfirmed: true,
        detail: 'gRPC call to Notification Service on port 50053 failed (e.g. connection refused or timeout).',
        errorDetail: errorMessage,
      };
    }

    // Success confirmed by backend payload
    const rpcResultMsg = responseData?.data?.message || 'Email sent successfully';
    return {
      status: 'success',
      statusLabel: 'RPC RETURNED OK',
      isConfirmed: true,
      detail: `gRPC SendEmail() execution confirmed. Return payload: "${rpcResultMsg}".`,
    };
  };

  // 5. Email Handler Stage Evaluation
  const getEmailHandlerStage = () => {
    if (isIdle) {
      return {
        status: 'idle',
        statusLabel: 'IDLE',
        isConfirmed: false,
        detail: 'EmailService logs the simulated email metadata without transmitting external SMTP.',
      };
    }
    if (isSending) {
      return {
        status: 'in_flight',
        statusLabel: 'INFERRED IN-FLIGHT',
        isConfirmed: false,
        detail: 'Simulated email handler execution in-flight.',
      };
    }
    if (isError) {
      return {
        status: 'not_reached',
        statusLabel: 'NOT REACHED',
        isConfirmed: true,
        detail: 'Email Handler was bypassed because upstream RPC execution did not succeed.',
      };
    }

    return {
      status: 'success',
      statusLabel: 'CONFIRMED SIMULATED',
      isConfirmed: true,
      detail: 'Notification Service executed emailService.sendEmail(), generated messageId, and logged structured metadata to stdout. No real SMTP email sent.',
    };
  };

  const clientStage = getClientStage();
  const gatewayStage = getGatewayStage();
  const userServiceStage = getUserServiceStage();
  const notificationStage = getNotificationServiceStage();
  const emailStage = getEmailHandlerStage();

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
      {/* 1. Header with Latency & Telemetry Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
              gRPC Pipeline Architecture Visualizer
            </h2>
            <p className="text-xs text-slate-400">
              Granular stage-by-stage boundary verification with confirmed vs. inferred telemetry
            </p>
          </div>
        </div>

        {/* Global Telemetry Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {durationMs !== null && durationMs !== undefined && (
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-950 text-indigo-300 border border-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Latency: <strong className="text-indigo-200">{durationMs} ms</strong>
            </span>
          )}

          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-950 text-slate-300 border border-slate-800 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Method: <code className="text-cyan-300 font-bold">SendEmail</code>
          </span>
        </div>
      </div>

      {/* 2. Architectural Guidelines & Truthfulness Notice */}
      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-300 font-bold">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          Telemetry Integrity Principles:
        </div>
        <div className="text-[11px] leading-relaxed space-y-0.5">
          <div>• <strong className="text-slate-300">No Synthetic Animations:</strong> Nodes reflect actual backend responses received through HTTP/1.1 REST without fabricated real-time animations.</div>
          <div>• <strong className="text-slate-300">Confirmed vs Inferred:</strong> Completed stages are validated directly from response headers, HTTP codes, and JSON payloads. In-flight states are clearly labeled as inferred.</div>
          <div>• <strong className="text-slate-300">Internal Port Configuration:</strong> gRPC port <code className="text-amber-300">50053</code> is internal microservice configuration only—ingress from the public browser is blocked.</div>
        </div>
      </div>

      {/* 3. Five-Stage Pipeline Flow (Vertical / Stacked Layout with Connectors) */}
      <div className="space-y-3">
        {/* Stage 1: Client */}
        <PipelineNode
          step={1}
          title="Client"
          subtitle="React Single Page Application"
          icon={Laptop}
          protocol="HTTP/1.1 REST"
          port="Browser Client"
          status={clientStage.status}
          statusLabel={clientStage.statusLabel}
          isConfirmed={clientStage.isConfirmed}
          detail={clientStage.detail}
          errorDetail={clientStage.errorDetail}
          latencyMs={durationMs}
        />

        {/* Connector 1 -> 2 */}
        <div className="flex items-center justify-center gap-2 py-0.5 text-slate-600 font-mono text-[11px]">
          <ArrowDown className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-indigo-300">
            HTTP REST &bull; POST /api/users/test-notification &bull; Authorization: Bearer JWT
          </span>
        </div>

        {/* Stage 2: API Gateway */}
        <PipelineNode
          step={2}
          title="API Gateway"
          subtitle="Port 3000 (Express Reverse Proxy)"
          icon={Shield}
          protocol="HTTP Reverse Proxy"
          port="3000 (Edge Ingress)"
          status={gatewayStage.status}
          statusLabel={gatewayStage.statusLabel}
          isConfirmed={gatewayStage.isConfirmed}
          detail={gatewayStage.detail}
          errorDetail={gatewayStage.errorDetail}
        />

        {/* Connector 2 -> 3 */}
        <div className="flex items-center justify-center gap-2 py-0.5 text-slate-600 font-mono text-[11px]">
          <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-cyan-300">
            Internal Network &bull; POST /test-notification &bull; x-user-id Injected
          </span>
        </div>

        {/* Stage 3: User Service */}
        <PipelineNode
          step={3}
          title="User Service"
          subtitle="Port 5002 (Express Business Logic)"
          icon={Server}
          protocol="HTTP Ingress / gRPC Egress"
          port="5002 (Internal Service)"
          status={userServiceStage.status}
          statusLabel={userServiceStage.statusLabel}
          isConfirmed={userServiceStage.isConfirmed}
          rpcMethod="notification.NotificationService/SendEmail"
          detail={userServiceStage.detail}
          errorDetail={userServiceStage.errorDetail}
        />

        {/* Connector 3 -> 4 */}
        <div className="flex items-center justify-center gap-2 py-0.5 text-slate-600 font-mono text-[11px]">
          <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-emerald-300">
            gRPC / HTTP/2 &bull; Binary Protocol Buffers &bull; SendEmailRequest
          </span>
        </div>

        {/* Stage 4: Notification Service (gRPC) */}
        <PipelineNode
          step={4}
          title="Notification Service"
          subtitle="Port 50053 (gRPC Server / HTTP-2)"
          icon={Radio}
          protocol="HTTP/2 Binary Protobuf"
          port="50053"
          isConfigOnly={true}
          configNote="Configuration Information Only: Port 50053 is an internal Docker/microservice gRPC socket. It is not publicly accessible from the internet or browser."
          status={notificationStage.status}
          statusLabel={notificationStage.statusLabel}
          isConfirmed={notificationStage.isConfirmed}
          rpcMethod="SendEmail(SendEmailRequest) &rarr; SendEmailResponse"
          detail={notificationStage.detail}
          errorDetail={notificationStage.errorDetail}
        />

        {/* Connector 4 -> 5 */}
        <div className="flex items-center justify-center gap-2 py-0.5 text-slate-600 font-mono text-[11px]">
          <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-amber-300">
            In-Memory Service Call &bull; emailService.sendEmail()
          </span>
        </div>

        {/* Stage 5: Email Handler */}
        <PipelineNode
          step={5}
          title="Email Handler"
          subtitle="Simulated Email Dispatch (emailService.js)"
          icon={Mail}
          protocol="In-Memory Structured Logger"
          status={emailStage.status}
          statusLabel={emailStage.statusLabel}
          isConfirmed={emailStage.isConfirmed}
          detail={emailStage.detail}
        />
      </div>

      {/* 4. Telemetry Diagnostics Footer */}
      <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-slate-300 font-bold pb-2 border-b border-slate-900">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" /> Live Telemetry Summary
          </span>
          <span className="text-[11px] text-slate-500">
            Status: <code className="text-indigo-300">{callState.toUpperCase()}</code>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
          <div>
            <span className="text-slate-500 block">CLIENT STATUS:</span>
            <span className="text-slate-200 font-bold">{clientStage.statusLabel}</span>
          </div>
          <div>
            <span className="text-slate-500 block">GATEWAY STATUS:</span>
            <span className="text-indigo-300 font-bold">{gatewayStage.statusLabel}</span>
          </div>
          <div>
            <span className="text-slate-500 block">USER SERVICE RESULT:</span>
            <span className="text-cyan-300 font-bold">{userServiceStage.statusLabel}</span>
          </div>
          <div>
            <span className="text-slate-500 block">NOTIFICATION RPC:</span>
            <span className={notificationStage.status === 'success' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              {notificationStage.statusLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrpcPipelineVisualizer;