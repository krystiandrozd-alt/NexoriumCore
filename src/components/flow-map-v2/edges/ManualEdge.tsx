'use client';

// Nexorium Core - Manual Edge Component
// Enhanced React Flow edge with better selection and editing support

import { memo, useMemo, useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
} from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { Pencil } from 'lucide-react';
import type { ManualEdgeType } from '@/types/flow-map-manual';
import { edgeTypeStyles } from '@/types/flow-map-manual';
import type { EdgeRoutingMode } from '@/lib/flow-map/edge-utils';

// Edge data interface
interface ManualEdgeDataProps {
  edgeType: ManualEdgeType;
  label?: string;
  isSelected?: boolean;
  routingMode?: EdgeRoutingMode;
  reduceMotion?: boolean;
}

function ManualEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  interactionWidth = 20, // Wider hit area
}: EdgeProps & { interactionWidth?: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const edgeData = data as ManualEdgeDataProps | undefined;
  const edgeType = edgeData?.edgeType || 'MANUAL';
  const routingMode = edgeData?.routingMode || 'smooth';
  const style = edgeTypeStyles[edgeType];

  const [edgePath, labelX, labelY] = useMemo(() => {
    if (routingMode === 'orthogonal') {
      return getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 8,
        offset: 30,
      });
    }
    // Default: bezier path for smooth routing
    return getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      curvature: 0.25,
    });
  }, [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, routingMode]);

  // Determine colors based on state
  const strokeColor = selected
    ? '#8b5cf6' // Violet when selected
    : isHovered
      ? '#a78bfa' // Lighter violet on hover
      : style.color;

  const strokeWidth = selected ? 3 : isHovered ? 2.5 : 2;

  return (
    <>
      {/* Invisible wider path for easier interaction */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={interactionWidth}
        className="react-flow__edge-interaction cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Glow effect when selected or hovered */}
      {(selected || isHovered) && (
        <path
          d={edgePath}
          fill="none"
          stroke={selected ? '#8b5cf6' : '#a78bfa'}
          strokeWidth={selected ? 8 : 6}
          strokeOpacity={0.2}
          strokeLinecap="round"
          className="pointer-events-none"
        />
      )}

      {/* Main edge path */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray: style.dashArray,
          transition: 'stroke 0.15s ease, stroke-width 0.15s ease',
        }}
        markerEnd={
          selected
            ? 'url(#manual-edge-marker-selected)'
            : `url(#manual-edge-marker-${edgeType})`
        }
      />

      {/* Edge label or edit hint */}
      <EdgeLabelRenderer>
        {/* Label display */}
        {edgeData?.label && (
          <div
            className={cn(
              'absolute px-2 py-1 rounded text-[10px] font-medium',
              'border backdrop-blur-sm',
              'transition-all duration-150',
              selected
                ? 'bg-violet-500/20 border-violet-500/40 text-violet-200'
                : isHovered
                  ? 'bg-slate-800/95 border-white/20 text-slate-300'
                  : 'bg-slate-800/90 border-white/10 text-slate-400'
            )}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY - 16}px)`,
              pointerEvents: 'none',
            }}
          >
            {edgeData.label}
          </div>
        )}

        {/* Edit indicator on hover/select */}
        {(selected || isHovered) && (
          <div
            className={cn(
              'absolute flex items-center gap-1 px-2 py-1 rounded-full',
              'text-[10px] font-medium transition-all duration-150',
              selected
                ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                : 'bg-slate-700/90 text-slate-300 border border-white/10'
            )}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY + (edgeData?.label ? 8 : 0)}px)`,
              pointerEvents: 'none',
            }}
          >
            <Pencil className="h-3 w-3" />
            <span>{selected ? 'Editing' : 'Click to edit'}</span>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}

// Edge markers for arrow heads
export function ManualEdgeMarkers() {
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0 }}>
      <defs>
        {Object.entries(edgeTypeStyles).map(([type, style]) => (
          <marker
            key={type}
            id={`manual-edge-marker-${type}`}
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={style.color} />
          </marker>
        ))}
        {/* Selected state marker */}
        <marker
          id="manual-edge-marker-selected"
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#8b5cf6" />
        </marker>
        {/* Hover state marker */}
        <marker
          id="manual-edge-marker-hover"
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#a78bfa" />
        </marker>
      </defs>
    </svg>
  );
}

export default memo(ManualEdge);
