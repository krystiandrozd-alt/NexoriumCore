'use client';

// TelEnvIQ - View Mode Toggle Component
// Toggle between different graph view modes

import { memo } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Layers, Network, Cloud, Server, Grid } from 'lucide-react';
import type { ViewMode } from '@/types';

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}

const VIEW_MODES: Array<{
  value: ViewMode;
  label: string;
  icon: typeof Layers;
  description: string;
}> = [
  {
    value: 'default',
    label: 'Default',
    icon: Grid,
    description: 'Standard topology view',
  },
  {
    value: 'network-zone',
    label: 'Zones',
    icon: Network,
    description: 'Group by network zone (PROD, NON_PROD, DMZ)',
  },
  {
    value: 'telco-layer',
    label: 'Telco',
    icon: Layers,
    description: 'Group by BSS/OSS/Network layers',
  },
  {
    value: 'runtime-layer',
    label: 'Runtime',
    icon: Server,
    description: 'Group by virtualization (VM, Container, CNF)',
  },
  {
    value: 'hosting-domain',
    label: 'Hosting',
    icon: Cloud,
    description: 'Group by hosting (Cloud, On-Prem)',
  },
];

function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <TooltipProvider>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => v && onChange(v as ViewMode)}
        className="bg-white/80 backdrop-blur border border-slate-200 shadow-sm"
      >
        {VIEW_MODES.map((mode) => (
          <Tooltip key={mode.value}>
            <TooltipTrigger asChild>
              <ToggleGroupItem value={mode.value} aria-label={mode.label}>
                <mode.icon className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline text-xs">{mode.label}</span>
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{mode.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
    </TooltipProvider>
  );
}

export default memo(ViewModeToggle);
