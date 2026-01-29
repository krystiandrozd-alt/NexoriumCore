'use client';

// Nexorium Core - Environment Switcher Component
// Premium dark theme with environment selector

import { useEnvironment } from '@/contexts/EnvironmentContext';
import { cn } from '@/lib/utils';
import { ChevronDown, Server, X } from 'lucide-react';

const environmentTypeColors: Record<string, string> = {
  DEV: 'bg-[#5B5FEF]/15 text-[#A5B4FC] border-[#5B5FEF]/30',
  SIT: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  UAT: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  NFT: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  PREPROD: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  PROD_RO: 'bg-red-500/15 text-red-300 border-red-500/30',
};

export function EnvironmentSwitcher() {
  const { selectedEnvironment, setSelectedEnvironment, environments, isLoading } = useEnvironment();

  if (isLoading) {
    return (
      <div className="px-3 py-3">
        <div className="h-9 w-full animate-pulse rounded-lg bg-white/[0.06]" />
      </div>
    );
  }

  return (
    <div className="px-3 py-3">
      <div className="relative">
        <select
          className={cn(
            'flex h-9 w-full appearance-none rounded-lg border border-white/[0.1] bg-white/[0.03] pl-8 pr-8 text-sm font-medium transition-all duration-200',
            'ring-offset-[#0B1220] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5FEF]/50 focus-visible:border-[#5B5FEF]/50',
            'hover:border-white/[0.15] hover:bg-white/[0.05]',
            '[&>option]:bg-[#0F1729] [&>option]:text-white',
            selectedEnvironment ? 'text-white' : 'text-slate-400'
          )}
          value={selectedEnvironment?.id || ''}
          onChange={(e) => {
            const env = environments.find((env) => env.id === e.target.value);
            setSelectedEnvironment(env || null);
          }}
        >
          <option value="">All Environments</option>
          {environments.map((env) => (
            <option key={env.id} value={env.id}>
              {env.name} ({env.type})
            </option>
          ))}
        </select>
        <Server className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>
      {selectedEnvironment && (
        <div className="mt-2 flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider border',
              environmentTypeColors[selectedEnvironment.type] || 'bg-white/[0.06] text-slate-300 border-white/[0.1]'
            )}
          >
            {selectedEnvironment.type}
          </span>
          <button
            onClick={() => setSelectedEnvironment(null)}
            className="ml-auto p-1 text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] rounded transition-colors"
            title="Clear selection"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
