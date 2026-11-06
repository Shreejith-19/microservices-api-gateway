import React from 'react';
import { TopNav } from '../layout/TopNav';
import { ServiceHealthCard } from './ServiceHealthCard';
import { AuthSection } from '../auth/AuthSection';
import { ProfileSection } from '../profile/ProfileSection';
import { NotificationSection } from '../grpc/NotificationSection';
import { JwtInspector } from '../inspector/JwtInspector';
import { IdentityFlowInspector } from '../inspector/IdentityFlowInspector';
import { RateLimitSection } from '../rate-limit/RateLimitSection';
import { RateLimitStressTest } from '../rate-limit/RateLimitStressTest';
import { RequestInspector } from '../inspector/RequestInspector';
import { ArchitectureFlow } from '../architecture/ArchitectureFlow';

export const DashboardLayout = () => {
  const gatewayUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* 1. Global Navigation Bar */}
      <TopNav gatewayUrl={gatewayUrl} />

      {/* 2. Main Dashboard Content Grid */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Intro Subtitle Bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/60">
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              Interactive Architecture Console
            </h2>
            <p className="text-xs text-slate-400">
              Demonstrating Edge Routing, Redis Rate Limiting, JWT Identity Forwarding & gRPC Inter-Service RPC.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
              Target Gateway: <span className="text-indigo-300 font-semibold">{gatewayUrl}</span>
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: INTERACTIVE APPLICATION (7 Columns on XL)   */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6">
            
            <div className="flex items-center gap-2 px-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Interactive Application Controls
              </h3>
            </div>

            {/* 1. Cluster Service Health */}
            <ServiceHealthCard />

            {/* 2. Identity & Authentication Form */}
            <AuthSection />

            {/* 3. User Profile Management */}
            <ProfileSection />

            {/* 4. gRPC Inter-Service Notification */}
            <NotificationSection />

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: ARCHITECTURE INSPECTOR (5 Columns on XL)   */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-6">
            
            <div className="flex items-center gap-2 px-1">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Architecture Telemetry & Edge Inspector
              </h3>
            </div>

            {/* 1. Dedicated JWT Inspection & Claims Panel */}
            <JwtInspector />

            {/* 2. Identity Flow Inspector */}
            <IdentityFlowInspector />

            {/* 3. Rate Limit Monitor */}
            <RateLimitSection />

            {/* 4. Rate Limit Stress Test (105 Concurrent Requests) */}
            <RateLimitStressTest />

            {/* 5. Gateway Request Inspector */}
            <RequestInspector />

            {/* 5. Architecture Topology Visualizer */}
            <ArchitectureFlow />

          </div>

        </div>

      </main>

      {/* 3. Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 mt-12 text-xs font-mono text-slate-500">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span>Microservices Platform UI Shell</span>
            <span>•</span>
            <span>Port 3000 Edge Proxy</span>
            <span>•</span>
            <span className="text-cyan-400">gRPC Port 50053</span>
          </div>
          <div className="text-slate-600">
            Microservices Control Center &bull; Developer Console
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
