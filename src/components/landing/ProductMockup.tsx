'use client';

// Nexorium Core - Product Mockup

import { useEffect, useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Database,
  Server,
  Network,
  Layers,
} from 'lucide-react';

// Node component for the topology
function TopologyNode({
  label,
  status,
  layer,
  className = '',
}: {
  label: string;
  status: 'healthy' | 'warning' | 'syncing';
  layer: 'infra' | 'api' | 'data' | 'app';
  className?: string;
}) {
  const layerColors = {
    infra: 'border-slate-500/30 bg-slate-500/10',
    api: 'border-[#5B5FEF]/30 bg-[#5B5FEF]/10',
    data: 'border-emerald-500/30 bg-emerald-500/10',
    app: 'border-cyan-500/30 bg-cyan-500/10',
  };

  const statusIcons = {
    healthy: <CheckCircle className="h-3 w-3 text-emerald-400" />,
    warning: <AlertTriangle className="h-3 w-3 text-amber-400" />,
    syncing: <Clock className="h-3 w-3 text-blue-400 animate-spin" />,
  };

  return (
    <div
      className={`relative rounded-lg border backdrop-blur-sm px-3 py-2 ${layerColors[layer]} ${className}`}
    >
      <div className="flex items-center gap-2">
        {statusIcons[status]}
        <span className="text-xs font-medium text-white/80">{label}</span>
      </div>
    </div>
  );
}

export default function ProductMockup() {
  const [riskScore, setRiskScore] = useState(24);
  const [lastUpdated, setLastUpdated] = useState('3s');

  useEffect(() => {
    const interval = setInterval(() => {
      setRiskScore((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(15, Math.min(35, prev + change));
      });
      const seconds = Math.floor(Math.random() * 10) + 1;
      setLastUpdated(`${seconds}s`);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Glow effect behind mockup */}
      <div className="absolute -inset-4 bg-gradient-to-r from-[#5B5FEF]/20 via-[#7C3AED]/10 to-[#06B6D4]/20 rounded-2xl blur-xl opacity-50" />

      {/* Main mockup container */}
      <div className="relative rounded-xl border border-white/10 bg-[#0f1629]/80 backdrop-blur-xl overflow-hidden shadow-2xl">
        {/* Window header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs text-slate-500">Nexorium Core — Environment Topology</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Top metrics bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Governance status */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">Governed</span>
              </div>

              {/* Risk index */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-medium text-amber-400">
                  Risk Score: {riskScore}
                </span>
              </div>
            </div>

            {/* Freshness */}
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs">Updated {lastUpdated} ago</span>
            </div>
          </div>

          {/* Topology visualization */}
          <div className="relative h-[280px] rounded-lg border border-white/5 bg-[#080d1a]/50 p-4">
            {/* Layer labels */}
            <div className="absolute left-0 top-0 bottom-0 w-20 flex flex-col justify-around text-[10px] text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Layers className="h-3 w-3" /> App
              </span>
              <span className="flex items-center gap-1.5">
                <Network className="h-3 w-3" /> API
              </span>
              <span className="flex items-center gap-1.5">
                <Database className="h-3 w-3" /> Data
              </span>
              <span className="flex items-center gap-1.5">
                <Server className="h-3 w-3" /> Infra
              </span>
            </div>

            {/* Nodes grid */}
            <div className="ml-20 h-full grid grid-rows-4 gap-4">
              {/* App layer */}
              <div className="flex items-center gap-3">
                <TopologyNode label="CRM UI" status="healthy" layer="app" />
                <TopologyNode label="Portal" status="healthy" layer="app" />
                <TopologyNode label="Admin" status="syncing" layer="app" />
              </div>

              {/* API layer */}
              <div className="flex items-center gap-3">
                <TopologyNode label="Order API" status="healthy" layer="api" />
                <TopologyNode label="Auth Service" status="healthy" layer="api" />
                <TopologyNode label="Billing API" status="warning" layer="api" />
              </div>

              {/* Data layer */}
              <div className="flex items-center gap-3">
                <TopologyNode label="Primary DB" status="healthy" layer="data" />
                <TopologyNode label="Cache" status="healthy" layer="data" />
                <TopologyNode label="Analytics" status="healthy" layer="data" />
              </div>

              {/* Infra layer */}
              <div className="flex items-center gap-3">
                <TopologyNode label="K8s Cluster" status="healthy" layer="infra" />
                <TopologyNode label="Load Balancer" status="healthy" layer="infra" />
                <TopologyNode label="VPN Gateway" status="warning" layer="infra" />
              </div>
            </div>

            {/* Animated connection overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              {/* Vertical connections */}
              <line
                x1="140"
                y1="35"
                x2="140"
                y2="245"
                stroke="url(#lineGradient)"
                strokeWidth="1"
                strokeDasharray="4 4"
                className="animate-pulse"
              />
              <line
                x1="220"
                y1="35"
                x2="220"
                y2="245"
                stroke="url(#lineGradient)"
                strokeWidth="1"
                strokeDasharray="4 4"
                className="animate-pulse"
                style={{ animationDelay: '0.5s' }}
              />
              <line
                x1="300"
                y1="35"
                x2="300"
                y2="245"
                stroke="url(#lineGradient)"
                strokeWidth="1"
                strokeDasharray="4 4"
                className="animate-pulse"
                style={{ animationDelay: '1s' }}
              />

              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#5B5FEF" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#5B5FEF" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#5B5FEF" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Bottom legend */}
          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                Healthy
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                Warning
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                Syncing
              </span>
            </div>
            <span>12 Systems | 28 Interfaces | UAT Environment</span>
          </div>
        </div>
      </div>
    </div>
  );
}
