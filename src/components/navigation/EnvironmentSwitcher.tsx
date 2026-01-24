'use client';

// TelEnvIQ - Environment Switcher Component
// Global environment selector for scoped navigation

import { useEnvironment } from '@/contexts/EnvironmentContext';
import { cn } from '@/lib/utils';
import { ChevronDown, Server, X } from 'lucide-react';

const environmentTypeColors: Record<string, string> = {
  DEV: 'bg-indigo-100 text-indigo-700',
  SIT: 'bg-violet-100 text-violet-700',
  UAT: 'bg-cyan-100 text-cyan-700',
  NFT: 'bg-amber-100 text-amber-700',
  PREPROD: 'bg-emerald-100 text-emerald-700',
  PROD_RO: 'bg-red-100 text-red-700',
};

export function EnvironmentSwitcher() {
  const { selectedEnvironment, setSelectedEnvironment, environments, isLoading } = useEnvironment();

  if (isLoading) {
    return (
      <div className="px-3 py-2">
        <div className="h-9 w-full animate-pulse rounded-md bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      <div className="relative">
        <select
          className={cn(
            'flex h-9 w-full appearance-none rounded-md border border-slate-300 bg-white pl-8 pr-8 text-sm font-medium ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
            selectedEnvironment ? 'text-slate-900' : 'text-slate-500'
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
        <Server className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
      {selectedEnvironment && (
        <div className="mt-2 flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium',
              environmentTypeColors[selectedEnvironment.type] || 'bg-slate-100 text-slate-700'
            )}
          >
            {selectedEnvironment.type}
          </span>
          <button
            onClick={() => setSelectedEnvironment(null)}
            className="ml-auto p-1 text-slate-400 hover:text-slate-600"
            title="Clear selection"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
