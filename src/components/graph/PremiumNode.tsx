'use client';

// TelEnvIQ - Premium Node Component (Flagship)
// Dark theme node with glass styling, version badges, and selection states

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import {
  Server,
  Database,
  Globe,
  Waypoints,
  Layers,
  Radio,
  Box,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ArchitectureLayer, CapabilityType } from '@/types';

interface PremiumNodeData {
  label: string;
  displayName?: string | null;
  componentName: string;
  layer: ArchitectureLayer;
  capabilityType: CapabilityType;
  hostname?: string | null;
  primaryEndpoint?: { port?: number | null; scheme?: string | null } | null;
  projectVersion?: string | null;
  isEntry: boolean;
  isExit: boolean;
  sourceSystem?: string | null;
  ingestedAt?: Date | string | null;
  // Overlay flags
  showVersion?: boolean;
  showOwnership?: boolean;
  isHighlighted?: boolean;
  isSelected?: boolean;
  // Drift status
  driftStatus?: 'added' | 'removed' | 'changed' | null;
  // Ownership
  owner?: string | null;
}

const layerConfig: Record<
  ArchitectureLayer,
  { bg: string; border: string; accent: string; icon: typeof Server }
> = {
  BSS: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    accent: 'text-blue-400',
    icon: Box,
  },
  OSS: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    accent: 'text-amber-400',
    icon: Layers,
  },
  INFRA: {
    bg: 'bg-slate-500/10',
    border: 'border-slate-400/30',
    accent: 'text-slate-400',
    icon: Database,
  },
  EXTERNAL: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    accent: 'text-emerald-400',
    icon: Globe,
  },
  UNKNOWN: {
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    accent: 'text-gray-400',
    icon: Server,
  },
};

const capabilityIcons: Partial<Record<CapabilityType, typeof Server>> = {
  DB: Database,
  MQ: Radio,
  API_GW: Waypoints,
  ORCHESTRATOR: Layers,
};

function PremiumNode({ data, selected }: NodeProps & { data: PremiumNodeData }) {
  const config = layerConfig[data.layer] || layerConfig.UNKNOWN;
  const Icon = capabilityIcons[data.capabilityType] || config.icon;

  const isHighlighted = data.isHighlighted || data.isSelected || selected;

  return (
    <div
      className={cn(
        'relative px-4 py-3 rounded-xl transition-all duration-200',
        'backdrop-blur-md min-w-[180px]',
        config.bg,
        'border',
        config.border,
        // Selection/highlight states
        isHighlighted && 'node-highlight-selected',
        data.isHighlighted && 'node-highlight-search',
        // Drift states
        data.driftStatus === 'added' && 'ring-2 ring-emerald-500/50',
        data.driftStatus === 'removed' && 'opacity-50 ring-2 ring-rose-500/50',
        data.driftStatus === 'changed' && 'ring-2 ring-amber-500/50'
      )}
      data-testid={`node-${data.componentName.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-1.5 !rounded-full !bg-white/20 !border-0 hover:!bg-white/40 transition-colors"
      />

      {/* Entry/Exit badges - top right */}
      <div className="absolute -top-2 -right-2 flex gap-1">
        {data.isEntry && (
          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
            ENTRY
          </span>
        )}
        {data.isExit && (
          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-500/30 text-rose-300 border border-rose-500/40">
            EXIT
          </span>
        )}
      </div>

      {/* Drift badge */}
      {data.driftStatus && (
        <div className="absolute -top-2 -left-2">
          <span
            className={cn(
              'px-1.5 py-0.5 rounded text-[8px] font-bold',
              data.driftStatus === 'added' && 'badge-drift-added',
              data.driftStatus === 'removed' && 'badge-drift-removed',
              data.driftStatus === 'changed' && 'badge-drift-changed'
            )}
          >
            {data.driftStatus.toUpperCase()}
          </span>
        </div>
      )}

      {/* Main content */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn('p-2 rounded-lg', config.bg, 'border', config.border)}>
          <Icon className={cn('h-5 w-5', config.accent)} />
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white truncate max-w-[120px]">
              {data.displayName || data.componentName}
            </span>
          </div>

          {/* Layer badge */}
          <div className="flex items-center gap-2 mt-1">
            <span
              className={cn(
                'px-1.5 py-0.5 rounded text-[9px] font-medium',
                config.bg,
                config.accent,
                'border',
                config.border
              )}
            >
              {data.layer}
            </span>
            <span className="text-[10px] text-slate-500">{data.capabilityType}</span>
          </div>

          {/* Version - prominent when overlay active */}
          {data.projectVersion && (
            <div
              className={cn(
                'mt-2 font-mono text-xs',
                data.showVersion ? 'text-violet-300' : 'text-slate-500'
              )}
            >
              v{data.projectVersion}
            </div>
          )}

          {/* Hostname */}
          {data.hostname && (
            <div className="text-[10px] text-slate-500 truncate max-w-[140px] mt-1">
              {data.hostname}
            </div>
          )}

          {/* Endpoint */}
          {data.primaryEndpoint && data.primaryEndpoint.port && (
            <div className="text-[10px] text-slate-600 mt-0.5">
              {data.primaryEndpoint.scheme || 'TCP'}:{data.primaryEndpoint.port}
            </div>
          )}
        </div>
      </div>

      {/* Ownership indicator */}
      {data.showOwnership && data.owner && (
        <div className="absolute bottom-1 right-2 flex items-center gap-1">
          <User className="h-3 w-3 text-violet-400" />
          <span className="text-[9px] text-violet-300">{data.owner}</span>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-1.5 !rounded-full !bg-white/20 !border-0 hover:!bg-white/40 transition-colors"
      />
    </div>
  );
}

export default memo(PremiumNode);
