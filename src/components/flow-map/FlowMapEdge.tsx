'use client';

// Nexorium Core - Flow Map Edge Components
// Animated edges with particle effects for change flow visualization

import { memo, useMemo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import { cn } from '@/lib/utils';
import type { FlowEdgeType } from '@/types/flow-map';

// ============================================
// EDGE DATA INTERFACE
// ============================================

export interface FlowMapEdgeData extends Record<string, unknown> {
  flowType: FlowEdgeType;
  label?: string;
  riskScore: number;
  collisionProbability: number;
  isActive: boolean;
  isEmergent: boolean;
  isHighlighted?: boolean;
}

// ============================================
// STYLING CONFIGS
// ============================================

const flowTypeConfig: Record<
  FlowEdgeType,
  {
    color: string;
    dashArray: string;
    strokeWidth: number;
    glowColor: string;
  }
> = {
  PROMOTION: {
    color: '#8b5cf6', // violet-500
    dashArray: '0',
    strokeWidth: 2,
    glowColor: 'rgba(139, 92, 246, 0.4)',
  },
  INTEGRATION: {
    color: '#3b82f6', // blue-500
    dashArray: '5,5',
    strokeWidth: 1.5,
    glowColor: 'rgba(59, 130, 246, 0.3)',
  },
  DEPENDENCY: {
    color: '#94a3b8', // slate-400
    dashArray: '2,4',
    strokeWidth: 1,
    glowColor: 'rgba(148, 163, 184, 0.2)',
  },
  SHARED_RESOURCE: {
    color: '#f59e0b', // amber-500
    dashArray: '8,4',
    strokeWidth: 1.5,
    glowColor: 'rgba(245, 158, 11, 0.3)',
  },
};

// ============================================
// FLOW MAP EDGE
// ============================================

function FlowMapEdge({
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
}: EdgeProps & { data: FlowMapEdgeData }) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  });

  const config = flowTypeConfig[data.flowType];
  const isHighRisk = data.collisionProbability > 0.6;
  const isMediumRisk = data.collisionProbability > 0.3 && !isHighRisk;

  // Determine edge color based on risk
  const edgeColor = useMemo(() => {
    if (isHighRisk) return '#ef4444'; // rose-500
    if (isMediumRisk) return '#f97316'; // orange-500
    return config.color;
  }, [isHighRisk, isMediumRisk, config.color]);

  // Determine glow color
  const glowColor = useMemo(() => {
    if (isHighRisk) return 'rgba(239, 68, 68, 0.5)';
    if (isMediumRisk) return 'rgba(249, 115, 22, 0.4)';
    return config.glowColor;
  }, [isHighRisk, isMediumRisk, config.glowColor]);

  // Animation for active flows
  const animationDuration = data.isActive ? '1.5s' : '0s';

  return (
    <>
      {/* Glow layer for high risk edges */}
      {(isHighRisk || data.isHighlighted) && (
        <BaseEdge
          id={`${id}-glow`}
          path={edgePath}
          style={{
            stroke: glowColor,
            strokeWidth: 8,
            filter: 'blur(4px)',
            opacity: 0.6,
          }}
        />
      )}

      {/* Background pulse animation for active flows */}
      {data.isActive && (
        <BaseEdge
          id={`${id}-pulse`}
          path={edgePath}
          style={{
            stroke: edgeColor,
            strokeWidth: config.strokeWidth + 4,
            strokeDasharray: config.dashArray,
            opacity: 0.2,
            animation: `pulse-flow ${animationDuration} ease-in-out infinite`,
          }}
        />
      )}

      {/* Main edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: edgeColor,
          strokeWidth: selected ? config.strokeWidth + 1 : config.strokeWidth,
          strokeDasharray: config.dashArray,
          strokeLinecap: 'round',
          transition: 'stroke 0.3s, stroke-width 0.2s',
        }}
        markerEnd={markerEnd}
      />

      {/* Animated particles for active flows */}
      {data.isActive && (
        <circle r="3" fill={edgeColor} className="flow-particle">
          <animateMotion dur={animationDuration} repeatCount="indefinite">
            <mpath xlinkHref={`#${id}`} />
          </animateMotion>
        </circle>
      )}

      {/* Second particle with offset for density */}
      {data.isActive && data.flowType === 'PROMOTION' && (
        <circle r="2" fill={edgeColor} opacity="0.7" className="flow-particle">
          <animateMotion dur={animationDuration} repeatCount="indefinite" begin="0.75s">
            <mpath xlinkHref={`#${id}`} />
          </animateMotion>
        </circle>
      )}

      {/* Path definition for particle animation */}
      <path id={id} d={edgePath} fill="none" style={{ display: 'none' }} />

      {/* Edge label */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {/* Label badge */}
          {data.label && (
            <div
              className={cn(
                'px-2 py-1 rounded-md text-[10px] font-medium',
                'backdrop-blur-md border transition-all duration-200',
                selected
                  ? 'bg-violet-500/30 border-violet-500/50 text-violet-200'
                  : 'bg-slate-900/80 border-white/10 text-slate-300',
                'hover:bg-slate-800/90 hover:border-white/20'
              )}
            >
              {data.label}
            </div>
          )}

          {/* Risk indicator for high probability */}
          {isHighRisk && (
            <div
              className={cn(
                'absolute -top-1 -right-1',
                'w-3 h-3 rounded-full',
                'bg-rose-500 border-2 border-slate-900',
                'animate-ping'
              )}
            />
          )}

          {/* Emergent link indicator */}
          {data.isEmergent && !isHighRisk && (
            <div
              className={cn(
                'absolute -top-1 -right-1',
                'px-1 py-0.5 rounded text-[7px] font-bold',
                'bg-cyan-500/90 text-white'
              )}
            >
              NEW
            </div>
          )}

          {/* Collision probability tooltip on hover */}
          {(selected || data.isHighlighted) && data.collisionProbability > 0.1 && (
            <div
              className={cn(
                'absolute top-full left-1/2 -translate-x-1/2 mt-1',
                'px-2 py-1 rounded text-[9px]',
                'bg-slate-800/95 border border-white/10 text-slate-300',
                'whitespace-nowrap'
              )}
            >
              Risk: {Math.round(data.collisionProbability * 100)}%
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(FlowMapEdge);
