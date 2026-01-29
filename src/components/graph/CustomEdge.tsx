'use client';

// Nexorium Core - Custom Edge Component for React Flow

import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { getConfidenceColor, getProtocolDisplayName } from '@/lib/utils';
import type { Protocol } from '@/types';

interface CustomEdgeData {
  protocol: Protocol;
  port?: number | null;
  pathOrTopic?: string | null;
  confidenceScore: number;
  isStale?: boolean;
}

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps & { data?: CustomEdgeData }) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const confidenceColor = getConfidenceColor(data?.confidenceScore ?? 1);
  const isLowConfidence = (data?.confidenceScore ?? 1) < 0.7;
  const isStale = data?.isStale;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: isStale ? '#9ca3af' : confidenceColor,
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: isLowConfidence ? '5,5' : undefined,
          opacity: isStale ? 0.4 : 1,
        }}
      />
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
              'px-2 py-1 rounded text-[10px] font-medium bg-white border shadow-sm',
              selected ? 'border-indigo-500' : 'border-slate-200',
              isStale && 'opacity-60'
            )}
          >
            <div className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: confidenceColor }}
              />
              <span className="text-slate-700">
                {getProtocolDisplayName(data?.protocol || 'REST')}
              </span>
              {data?.port && (
                <span className="text-slate-400">:{data.port}</span>
              )}
            </div>
            {data?.pathOrTopic && (
              <div className="text-slate-500 truncate max-w-[100px]">
                {data.pathOrTopic}
              </div>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(CustomEdge);
