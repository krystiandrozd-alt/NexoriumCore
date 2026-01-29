'use client';

// Nexorium Core - Integration Edge Component
// Simple directional edge for Flow Map V2

import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import { cn } from '@/lib/utils';
import type { FlowMapV2EdgeData, FlowMapLinkType } from '@/types/flow-map-v2';

// ============================================
// LINK TYPE STYLING
// ============================================

const linkTypeConfig: Record<
  FlowMapLinkType,
  {
    color: string;
    dashArray: string;
    strokeWidth: number;
    label: string;
  }
> = {
  PROMOTION: {
    color: '#8b5cf6', // violet-500
    dashArray: '0',
    strokeWidth: 2,
    label: 'Promotion',
  },
  DATA_SYNC: {
    color: '#06b6d4', // cyan-500
    dashArray: '8,4',
    strokeWidth: 1.5,
    label: 'Data Sync',
  },
  REFERENCE: {
    color: '#94a3b8', // slate-400
    dashArray: '3,3',
    strokeWidth: 1,
    label: 'Reference',
  },
};

// ============================================
// INTEGRATION EDGE
// ============================================

function IntegrationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps & { data: FlowMapV2EdgeData }) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.2,
  });

  const config = linkTypeConfig[data.linkType];

  return (
    <>
      {/* Selection glow */}
      {selected && (
        <BaseEdge
          id={`${id}-glow`}
          path={edgePath}
          style={{
            stroke: config.color,
            strokeWidth: 8,
            filter: 'blur(4px)',
            opacity: 0.4,
          }}
        />
      )}

      {/* Main edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: config.color,
          strokeWidth: selected ? config.strokeWidth + 1 : config.strokeWidth,
          strokeDasharray: config.dashArray,
          strokeLinecap: 'round',
          transition: 'stroke 0.2s, stroke-width 0.2s',
        }}
        markerEnd={markerEnd}
      />

      {/* Edge label - only show protocol if provided */}
      {data.protocol && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div
              className={cn(
                'px-2 py-0.5 rounded text-[9px] font-medium',
                'backdrop-blur-md border transition-all duration-200',
                selected
                  ? 'bg-violet-500/30 border-violet-500/50 text-violet-200'
                  : 'bg-slate-900/90 border-white/10 text-slate-400',
                'hover:bg-slate-800/90 hover:border-white/20 hover:text-slate-300'
              )}
            >
              {data.protocol}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(IntegrationEdge);
