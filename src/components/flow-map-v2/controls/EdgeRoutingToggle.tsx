'use client';

// Nexorium Core - Edge Routing Toggle
// Switch between smooth and orthogonal edge routing

import { memo } from 'react';
import { Spline, GitBranch, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EdgeRoutingMode } from '@/lib/flow-map/edge-utils';

interface EdgeRoutingToggleProps {
  mode: EdgeRoutingMode;
  onModeChange: (mode: EdgeRoutingMode) => void;
  className?: string;
}

interface RoutingOption {
  mode: EdgeRoutingMode;
  icon: LucideIcon;
  label: string;
  description: string;
}

const routingOptions: RoutingOption[] = [
  {
    mode: 'smooth',
    icon: Spline,
    label: 'Smooth',
    description: 'Curved bezier edges',
  },
  {
    mode: 'orthogonal',
    icon: GitBranch,
    label: 'Orthogonal',
    description: 'Right-angle step edges',
  },
];

function EdgeRoutingToggle({
  mode,
  onModeChange,
  className,
}: EdgeRoutingToggleProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-0.5 p-0.5 rounded-md bg-slate-800/50 border border-white/5',
        className
      )}
    >
      {routingOptions.map(({ mode: optionMode, icon: Icon, label, description }) => (
        <button
          key={optionMode}
          onClick={() => onModeChange(optionMode)}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all',
            mode === optionMode
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              : 'text-slate-400 hover:text-slate-300 hover:bg-white/5'
          )}
          title={description}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

export default memo(EdgeRoutingToggle);
