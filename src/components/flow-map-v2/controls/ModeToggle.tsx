'use client';

// Nexorium Core - Mode Toggle Component
// Toggle between Auto, Manual, and Hybrid modes

import { memo } from 'react';
import { cn } from '@/lib/utils';
import type { FlowMapMode } from '@/types/flow-map-manual';

interface ModeToggleProps {
  mode: FlowMapMode;
  onModeChange: (mode: FlowMapMode) => void;
}

const modes: { value: FlowMapMode; label: string; description: string }[] = [
  { value: 'auto', label: 'Auto', description: 'Auto-discovered environments only' },
  { value: 'manual', label: 'Manual', description: 'Manual design nodes only' },
  { value: 'hybrid', label: 'Hybrid', description: 'Both auto and manual nodes' },
];

function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-800/80 border border-white/10">
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => onModeChange(m.value)}
          title={m.description}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
            mode === m.value
              ? 'bg-violet-500/80 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

export default memo(ModeToggle);
