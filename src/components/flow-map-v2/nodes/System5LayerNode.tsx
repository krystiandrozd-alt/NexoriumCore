'use client';

// Nexorium Core - System 5-Layer Node Component
// Displays ComponentInstance from the 5-layer canonical model

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import {
  Server,
  Database,
  Layers,
  Globe,
  Cpu,
  MessageSquare,
  Shield,
  Zap,
  Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ArchitectureLayer, CapabilityType } from '@/types';

// ============================================
// NODE DATA INTERFACE
// ============================================

interface System5LayerNodeData {
  label: string;
  displayName?: string | null;
  componentName: string;
  layer: ArchitectureLayer;
  capabilityType: CapabilityType;
  hostname?: string | null;
  primaryEndpoint?: { port?: number; scheme?: string } | null;
  projectVersion?: string | null;
  isEntry: boolean;
  isExit: boolean;
  sourceSystem?: string | null;
  ingestedAt?: Date | null;
}

// ============================================
// LAYER COLORS
// ============================================

const layerColors: Record<ArchitectureLayer, string> = {
  BSS: '#8b5cf6',     // Violet
  OSS: '#06b6d4',     // Cyan
  INFRA: '#f59e0b',   // Amber
  EXTERNAL: '#64748b', // Slate
  UNKNOWN: '#6b7280',  // Gray
};

// ============================================
// CAPABILITY ICONS
// ============================================

const capabilityIcons: Record<CapabilityType, typeof Server> = {
  CPQ: Zap,
  CRM: Shield,
  BILLING: Circle,
  SOM: Layers,
  INVENTORY: Layers,
  ORCHESTRATOR: Cpu,
  DB: Database,
  MQ: MessageSquare,
  API_GW: Globe,
  IDENTITY: Shield,
  ITSM: Server,
  OTHER: Server,
  UNKNOWN: Server,
};

// ============================================
// SYSTEM 5-LAYER NODE
// ============================================

function System5LayerNode({ data, selected }: NodeProps & { data: System5LayerNodeData }) {
  const color = layerColors[data.layer] || layerColors.UNKNOWN;
  const IconComponent = capabilityIcons[data.capabilityType] || Server;

  return (
    <div
      className={cn(
        'relative group transition-all duration-200 ease-out',
        'min-w-[160px] max-w-[200px]',
        'hover:scale-105 hover:z-10',
        selected && 'scale-105 z-10'
      )}
      data-testid={`system-${data.componentName}`}
    >
      {/* Entry/Exit indicator */}
      {(data.isEntry || data.isExit) && (
        <div
          className={cn(
            'absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5',
            'text-[8px] font-bold uppercase tracking-wider rounded-full',
            data.isEntry ? 'bg-green-500/20 text-green-400 border border-green-500/30' : '',
            data.isExit ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : ''
          )}
        >
          {data.isEntry ? 'Entry' : 'Exit'}
        </div>
      )}

      {/* Selection glow */}
      {selected && (
        <div
          className="absolute -inset-2 rounded-xl blur-lg opacity-40"
          style={{ backgroundColor: color }}
        />
      )}

      {/* Main card */}
      <div
        className={cn(
          'relative px-3 py-2.5 rounded-lg',
          'backdrop-blur-xl',
          'bg-slate-900/90',
          'border-2',
          'shadow-lg transition-all',
          selected && 'ring-2 ring-white/30'
        )}
        style={{
          borderColor: selected ? color : `${color}60`,
        }}
      >
        {/* Connection handles */}
        <Handle
          type="target"
          position={Position.Left}
          className="!w-1.5 !h-3 !rounded-full !border-0 !bg-white/20 hover:!bg-white/40 transition-colors"
        />

        {/* Content */}
        <div className="flex items-start gap-2.5">
          {/* Icon container */}
          <div
            className={cn(
              'p-1.5 rounded-md',
              'border border-white/10',
              'transition-transform group-hover:scale-110'
            )}
            style={{
              backgroundColor: `${color}20`,
            }}
          >
            <IconComponent
              className="h-4 w-4"
              style={{ color }}
            />
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            {/* System name */}
            <div className="text-xs font-semibold text-white truncate">
              {data.displayName || data.label}
            </div>

            {/* Layer badge */}
            <div
              className={cn(
                'inline-flex items-center gap-1',
                'mt-0.5 px-1.5 py-0.5 rounded-full',
                'text-[9px] font-medium border'
              )}
              style={{
                backgroundColor: `${color}15`,
                borderColor: `${color}40`,
                color,
              }}
            >
              {data.layer}
            </div>

            {/* Version & hostname */}
            <div className="mt-1 space-y-0.5">
              {data.projectVersion && (
                <div className="text-[9px] text-slate-400 truncate">
                  v{data.projectVersion}
                </div>
              )}
              {data.hostname && (
                <div className="text-[9px] text-slate-500 truncate">
                  {data.hostname}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Source handle */}
        <Handle
          type="source"
          position={Position.Right}
          className="!w-1.5 !h-3 !rounded-full !border-0 !bg-white/20 hover:!bg-white/40 transition-colors"
        />
      </div>
    </div>
  );
}

export default memo(System5LayerNode);
