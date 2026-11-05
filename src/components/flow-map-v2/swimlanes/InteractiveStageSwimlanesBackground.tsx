'use client';

// Nexorium Core - Interactive Stage Swimlanes
// Collapsible vertical columns for each stage with interactive headers

import { memo, useMemo } from 'react';
import { Panel } from '@xyflow/react';
import {
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Lock,
  Unlock,
  LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlowMapV2Stage, FlowMapStageKey } from '@/types/flow-map-v2';
import { stageColors } from '@/types/flow-map-v2';
import {
  type StageLaneStates,
  type LaneSummary,
  LANE_HEADER_HEIGHT,
  LANE_COLLAPSED_WIDTH,
  LANE_DEFAULT_WIDTH,
  LANE_MIN_WIDTH,
} from '@/lib/flow-map/lane-utils';

interface InteractiveStageSwimlanesBackgroundProps {
  stages: FlowMapV2Stage[];
  width: number;
  height: number;
  visibleStages: FlowMapStageKey[];
  laneStates: StageLaneStates;
  onToggleCollapse: (stageKey: FlowMapStageKey) => void;
  onToggleVisibility: (stageKey: FlowMapStageKey) => void;
  onToggleLock: (stageKey: FlowMapStageKey) => void;
  onAutoArrangeLane?: (stageKey: FlowMapStageKey) => void;
  laneSummaries?: Record<FlowMapStageKey, LaneSummary>;
}

function InteractiveStageSwimlanesBackground({
  stages,
  width,
  height,
  visibleStages,
  laneStates,
  onToggleCollapse,
  onToggleVisibility,
  onToggleLock,
  onAutoArrangeLane,
  laneSummaries,
}: InteractiveStageSwimlanesBackgroundProps) {
  // Filter and sort visible stages
  const visibleStagesList = useMemo(() => {
    return stages
      .filter((s) => visibleStages.includes(s.key) && laneStates[s.key]?.visible !== false)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [stages, visibleStages, laneStates]);

  // Calculate lane widths considering collapsed states
  const laneLayout = useMemo(() => {
    const layout: { stage: FlowMapV2Stage; x: number; width: number; collapsed: boolean }[] = [];
    let currentX = 0;

    // Calculate total collapsed width
    const collapsedCount = visibleStagesList.filter((s) => laneStates[s.key]?.collapsed).length;
    const expandedCount = visibleStagesList.length - collapsedCount;
    const collapsedTotalWidth = collapsedCount * LANE_COLLAPSED_WIDTH;
    const availableWidth = Math.max(width - collapsedTotalWidth, 0);
    const expandedLaneWidth = expandedCount > 0
      ? Math.max(availableWidth / expandedCount, LANE_MIN_WIDTH)
      : LANE_DEFAULT_WIDTH;

    for (const stage of visibleStagesList) {
      const isCollapsed = laneStates[stage.key]?.collapsed ?? false;
      const laneWidth = isCollapsed ? LANE_COLLAPSED_WIDTH : expandedLaneWidth;

      layout.push({
        stage,
        x: currentX,
        width: laneWidth,
        collapsed: isCollapsed,
      });

      currentX += laneWidth;
    }

    return layout;
  }, [visibleStagesList, width, laneStates]);

  const totalWidth = useMemo(() => {
    return laneLayout.reduce((acc, l) => acc + l.width, 0);
  }, [laneLayout]);

  if (visibleStagesList.length === 0) {
    return null;
  }

  return (
    <>
      {/* SVG Background Layer */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={Math.max(width, totalWidth)}
        height={height}
        style={{ zIndex: 0 }}
      >
        <defs>
          {/* Grid pattern */}
          <pattern id="flowMapGridInteractive" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="0.5" fill="#64748b" opacity="0.2" />
          </pattern>

          {/* Gradient definitions for each stage */}
          {visibleStagesList.map((stage) => {
            const color = stage.color || stageColors[stage.key] || '#64748b';
            return (
              <linearGradient
                key={`gradient-${stage.key}`}
                id={`stageGradientInteractive-${stage.key}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor={color} stopOpacity="0.08" />
                <stop offset="50%" stopColor={color} stopOpacity="0.04" />
                <stop offset="100%" stopColor={color} stopOpacity="0.08" />
              </linearGradient>
            );
          })}
        </defs>

        {laneLayout.map(({ stage, x, width: laneWidth, collapsed }, index) => {
          const color = stage.color || stageColors[stage.key] || '#64748b';
          const summary = laneSummaries?.[stage.key];

          return (
            <g key={stage.key}>
              {/* Lane background with gradient */}
              <rect
                x={x}
                y={LANE_HEADER_HEIGHT}
                width={laneWidth}
                height={height - LANE_HEADER_HEIGHT}
                fill={collapsed ? 'rgba(15, 23, 42, 0.6)' : `url(#stageGradientInteractive-${stage.key})`}
              />

              {/* Grid pattern overlay (only for expanded lanes) */}
              {!collapsed && (
                <rect
                  x={x}
                  y={LANE_HEADER_HEIGHT}
                  width={laneWidth}
                  height={height - LANE_HEADER_HEIGHT}
                  fill="url(#flowMapGridInteractive)"
                />
              )}

              {/* Lane divider */}
              {index < laneLayout.length - 1 && (
                <line
                  x1={x + laneWidth}
                  y1={0}
                  x2={x + laneWidth}
                  y2={height}
                  stroke={color}
                  strokeWidth={1}
                  strokeOpacity={0.3}
                />
              )}

              {/* Collapsed lane vertical text */}
              {collapsed && (
                <text
                  x={x + laneWidth / 2}
                  y={LANE_HEADER_HEIGHT + 100}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={color}
                  style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                  }}
                  transform={`rotate(180, ${x + laneWidth / 2}, ${LANE_HEADER_HEIGHT + 100})`}
                >
                  {stage.name}
                </text>
              )}

              {/* Collapsed summary badges */}
              {collapsed && summary && (
                <g transform={`translate(${x + laneWidth / 2}, ${LANE_HEADER_HEIGHT + 200})`}>
                  {/* Node count */}
                  <rect
                    x={-10}
                    y={0}
                    width={20}
                    height={16}
                    rx={4}
                    fill="rgba(148, 163, 184, 0.2)"
                  />
                  <text
                    x={0}
                    y={12}
                    textAnchor="middle"
                    fill="#94a3b8"
                    style={{
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: '9px',
                      fontWeight: 500,
                    }}
                  >
                    {summary.nodeCount}
                  </text>

                  {/* Warning count (if any) */}
                  {summary.warningCount > 0 && (
                    <>
                      <rect
                        x={-10}
                        y={20}
                        width={20}
                        height={16}
                        rx={4}
                        fill="rgba(251, 191, 36, 0.2)"
                      />
                      <text
                        x={0}
                        y={32}
                        textAnchor="middle"
                        fill="#fbbf24"
                        style={{
                          fontFamily: 'system-ui, sans-serif',
                          fontSize: '9px',
                          fontWeight: 500,
                        }}
                      >
                        {summary.warningCount}
                      </text>
                    </>
                  )}
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Interactive Lane Headers (HTML overlay for pointer events) */}
      <Panel position="top-left" className="!m-0 !p-0 pointer-events-none" style={{ width: totalWidth, zIndex: 10 }}>
        <div className="flex pointer-events-auto" style={{ height: LANE_HEADER_HEIGHT }}>
          {laneLayout.map(({ stage, width: laneWidth, collapsed }) => {
            const color = stage.color || stageColors[stage.key] || '#64748b';
            const state = laneStates[stage.key];
            const summary = laneSummaries?.[stage.key];

            return (
              <div
                key={stage.key}
                className="relative flex items-center justify-center bg-slate-900/90 backdrop-blur-sm border-b-2 group"
                style={{
                  width: laneWidth,
                  height: LANE_HEADER_HEIGHT,
                  borderColor: color,
                }}
              >
                {/* Collapse/Expand button */}
                <button
                  onClick={() => onToggleCollapse(stage.key)}
                  className={cn(
                    'absolute left-1 top-1/2 -translate-y-1/2 p-1 rounded',
                    'text-slate-400 hover:text-white hover:bg-white/10',
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                    collapsed && 'opacity-100'
                  )}
                  title={collapsed ? 'Expand lane' : 'Collapse lane'}
                >
                  {collapsed ? (
                    <ChevronRight className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronLeft className="h-3.5 w-3.5" />
                  )}
                </button>

                {/* Stage badge (only when expanded) */}
                {!collapsed && (
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: `${color}20`,
                      borderWidth: '1px',
                      borderColor: `${color}40`,
                    }}
                  >
                    <span
                      className="text-xs font-semibold tracking-wide"
                      style={{ color }}
                    >
                      {stage.name}
                    </span>
                    {summary && summary.nodeCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-slate-700 text-slate-300">
                        {summary.nodeCount}
                      </span>
                    )}
                  </div>
                )}

                {/* Lane controls (only when expanded and hovered) */}
                {!collapsed && (
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Auto-arrange */}
                    {onAutoArrangeLane && (
                      <button
                        onClick={() => onAutoArrangeLane(stage.key)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
                        title="Auto-arrange nodes in lane"
                      >
                        <LayoutGrid className="h-3 w-3" />
                      </button>
                    )}

                    {/* Lock toggle */}
                    <button
                      onClick={() => onToggleLock(stage.key)}
                      className={cn(
                        'p-1 rounded',
                        state?.locked
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'text-slate-400 hover:text-white hover:bg-white/10'
                      )}
                      title={state?.locked ? 'Unlock lane' : 'Lock lane positions'}
                    >
                      {state?.locked ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        <Unlock className="h-3 w-3" />
                      )}
                    </button>

                    {/* Hide toggle */}
                    <button
                      onClick={() => onToggleVisibility(stage.key)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
                      title="Hide lane"
                    >
                      <EyeOff className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
}

export default memo(InteractiveStageSwimlanesBackground);
