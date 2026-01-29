'use client';

// Nexorium Core - Enhanced Edge Component
// Supports multiple edge types, routing modes, animations, and context menu

import { memo, useState, useCallback, useMemo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from '@xyflow/react';
import { cn } from '@/lib/utils';
import {
  type EnhancedEdgeType,
  type EdgeRoutingMode,
  edgeStyleConfigs,
  resolveEdgeStyle,
  truncateLabel,
  formatProtocolLabel,
  getMarkerConfig,
} from '@/lib/flow-map/edge-utils';
import EdgeContextMenu from './EdgeContextMenu';

// ============================================
// EDGE DATA INTERFACE
// ============================================

export interface EnhancedEdgeData extends Record<string, unknown> {
  edgeType: EnhancedEdgeType;
  label?: string;
  protocol?: string;
  routingMode?: EdgeRoutingMode;
  isActive?: boolean;
  reduceMotion?: boolean;
}

// ============================================
// ENHANCED EDGE COMPONENT
// ============================================

function EnhancedEdge({
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
}: EdgeProps & { data: EnhancedEdgeData }) {
  const { setEdges, getEdge } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Extract data with defaults
  const edgeType = data?.edgeType || 'integration';
  const routingMode = data?.routingMode || 'smooth';
  const reduceMotion = data?.reduceMotion || false;
  const label = data?.label;
  const protocol = data?.protocol;

  // Calculate edge path based on routing mode
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
        offset: 40,
      });
    }

    // Default: smooth bezier curve
    return getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      curvature: 0.2,
    });
  }, [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, routingMode]);

  // Resolve edge styling
  const style = useMemo(
    () => resolveEdgeStyle(edgeType, { selected, hovered: isHovered, reduceMotion }),
    [edgeType, selected, isHovered, reduceMotion]
  );

  const config = edgeStyleConfigs[edgeType];

  // Handle context menu
  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Handle edge type change
  const handleChangeType = useCallback(
    (newType: EnhancedEdgeType) => {
      setEdges((edges) =>
        edges.map((edge) =>
          edge.id === id
            ? { ...edge, data: { ...edge.data, edgeType: newType } }
            : edge
        )
      );
      setContextMenu(null);
    },
    [id, setEdges]
  );

  // Handle label change
  const handleChangeLabel = useCallback(
    (newLabel: string) => {
      setEdges((edges) =>
        edges.map((edge) =>
          edge.id === id
            ? { ...edge, data: { ...edge.data, label: newLabel } }
            : edge
        )
      );
      setContextMenu(null);
    },
    [id, setEdges]
  );

  // Handle edge reversal
  const handleReverse = useCallback(() => {
    const edge = getEdge(id);
    if (edge) {
      setEdges((edges) =>
        edges.map((e) =>
          e.id === id
            ? { ...e, source: e.target, target: e.source }
            : e
        )
      );
    }
    setContextMenu(null);
  }, [id, getEdge, setEdges]);

  // Handle delete
  const handleDelete = useCallback(() => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
    setContextMenu(null);
  }, [id, setEdges]);

  // Display label (protocol or custom label)
  const displayLabel = label || (protocol ? formatProtocolLabel(protocol) : null);
  const truncatedLabel = displayLabel ? truncateLabel(displayLabel, 16) : null;

  return (
    <>
      {/* Invisible wide path for better click/hover detection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onContextMenu={handleContextMenu}
        className="cursor-pointer"
      />

      {/* Selection glow effect */}
      {(selected || (isHovered && edgeType === 'promotion')) && (
        <BaseEdge
          id={`${id}-glow`}
          path={edgePath}
          style={{
            stroke: config.glowColor || config.color,
            strokeWidth: 10,
            filter: 'blur(6px)',
            opacity: selected ? 0.5 : 0.3,
          }}
        />
      )}

      {/* Main edge path */}
      <BaseEdge
        id={id}
        path={edgePath}
        className={cn(style.className, 'transition-all duration-200')}
        style={{
          stroke: style.stroke,
          strokeWidth: style.strokeWidth,
          strokeDasharray: style.strokeDasharray,
          strokeLinecap: style.strokeLinecap,
          opacity: style.opacity,
          filter: style.filter,
        }}
        markerEnd={markerEnd}
      />

      {/* Animated overlay for data-sync */}
      {edgeType === 'data-sync' && !reduceMotion && (
        <BaseEdge
          id={`${id}-anim`}
          path={edgePath}
          className="edge-dash-animation"
          style={{
            stroke: config.color,
            strokeWidth: style.strokeWidth,
            strokeDasharray: '8 16',
            strokeLinecap: 'round',
            opacity: 0.8,
          }}
        />
      )}

      {/* Animated flow particles for promotion edges */}
      {edgeType === 'promotion' && !reduceMotion && (
        <g className="edge-flow-particles">
          <circle r="3" fill={config.color} className="edge-flow-dot">
            <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
          </circle>
          <circle r="3" fill={config.color} className="edge-flow-dot" style={{ opacity: 0.6 }}>
            <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} begin="0.5s" />
          </circle>
          <circle r="3" fill={config.color} className="edge-flow-dot" style={{ opacity: 0.3 }}>
            <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} begin="1s" />
          </circle>
        </g>
      )}

      {/* Edge label */}
      {truncatedLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
            onContextMenu={handleContextMenu}
          >
            <div
              className={cn(
                'px-2 py-0.5 rounded text-[9px] font-medium',
                'backdrop-blur-md border transition-all duration-200',
                'max-w-[100px] truncate',
                selected
                  ? 'bg-violet-500/30 border-violet-500/50 text-violet-200'
                  : 'bg-slate-900/90 border-white/10 text-slate-400',
                isHovered && !selected && 'bg-slate-800/90 border-white/20 text-slate-300'
              )}
              title={displayLabel || undefined}
            >
              {truncatedLabel}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Context menu */}
      {contextMenu && (
        <EdgeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          currentType={edgeType}
          currentLabel={label || ''}
          onChangeType={handleChangeType}
          onChangeLabel={handleChangeLabel}
          onReverse={handleReverse}
          onDelete={handleDelete}
          onClose={handleCloseContextMenu}
        />
      )}
    </>
  );
}

export default memo(EnhancedEdge);
