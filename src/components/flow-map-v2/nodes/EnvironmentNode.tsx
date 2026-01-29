'use client';

// Nexorium Core - Environment Node Component
// Clean, clarity-first environment card for Flow Map V2

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Server, Layers, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlowMapV2NodeData, FlowMapStageKey } from '@/types/flow-map-v2';
import { stageColors, domainColors } from '@/types/flow-map-v2';

// ============================================
// ENVIRONMENT NODE
// ============================================

function EnvironmentNode({ data, selected }: NodeProps & { data: FlowMapV2NodeData }) {
  const stageColor = data.stageColor || (data.stageKey ? stageColors[data.stageKey as FlowMapStageKey] : '#64748b');
  const domainColor = data.domain ? domainColors[data.domain] : undefined;

  return (
    <div
      className={cn(
        'relative group transition-all duration-200 ease-out',
        'min-w-[180px] max-w-[220px]',
        'hover:scale-105 hover:z-10',
        selected && 'scale-105 z-10'
      )}
      data-testid={`flowmap-env-${data.id}`}
    >
      {/* Selection glow */}
      {selected && (
        <div
          className="absolute -inset-2 rounded-2xl blur-xl opacity-40"
          style={{ backgroundColor: stageColor }}
        />
      )}

      {/* Main card */}
      <div
        className={cn(
          'relative px-4 py-3 rounded-xl',
          'backdrop-blur-xl',
          'bg-slate-900/90',
          'border-2',
          'shadow-xl transition-all',
          selected && 'ring-2 ring-white/30'
        )}
        style={{
          borderColor: selected ? stageColor : `${stageColor}60`,
        }}
      >
        {/* Connection handles */}
        <Handle
          type="target"
          position={Position.Left}
          className="!w-2 !h-4 !rounded-full !border-0 !bg-white/20 hover:!bg-white/40 transition-colors"
        />

        {/* Content */}
        <div className="flex items-start gap-3">
          {/* Icon container */}
          <div
            className={cn(
              'p-2 rounded-lg',
              'border border-white/10',
              'transition-transform group-hover:scale-110'
            )}
            style={{
              backgroundColor: `${stageColor}20`,
            }}
          >
            <Server
              className="h-5 w-5"
              style={{ color: stageColor }}
            />
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            {/* Environment name */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white truncate">
                {data.name}
              </span>
            </div>

            {/* Stage badge */}
            {data.stageName && (
              <div
                className={cn(
                  'inline-flex items-center gap-1',
                  'mt-1 px-2 py-0.5 rounded-full',
                  'text-[10px] font-medium border'
                )}
                style={{
                  backgroundColor: `${stageColor}15`,
                  borderColor: `${stageColor}40`,
                  color: stageColor,
                }}
              >
                {data.stageName}
              </div>
            )}

            {/* Domain badge (if assigned) */}
            {data.domain && domainColor && (
              <div
                className={cn(
                  'inline-flex items-center gap-1 ml-1',
                  'mt-1 px-2 py-0.5 rounded-full',
                  'text-[10px] font-medium border'
                )}
                style={{
                  backgroundColor: `${domainColor}15`,
                  borderColor: `${domainColor}40`,
                  color: domainColor,
                }}
              >
                {data.domain}
              </div>
            )}

            {/* Stats row */}
            <div className="flex items-center gap-3 mt-2">
              {/* System count */}
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Layers className="h-3 w-3" />
                <span>{data.systemCount} systems</span>
              </div>

              {/* Connection count */}
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Link2 className="h-3 w-3" />
                <span>{data.connectionCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Source handle */}
        <Handle
          type="source"
          position={Position.Right}
          className="!w-2 !h-4 !rounded-full !border-0 !bg-white/20 hover:!bg-white/40 transition-colors"
        />
      </div>
    </div>
  );
}

export default memo(EnvironmentNode);
