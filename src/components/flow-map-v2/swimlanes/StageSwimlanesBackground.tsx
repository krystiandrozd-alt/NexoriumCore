'use client';

// Nexorium Core - Stage Swimlanes Background
// Vertical columns for each stage in Flow Map V2

import { memo, useMemo } from 'react';
import type { FlowMapV2Stage, FlowMapStageKey } from '@/types/flow-map-v2';
import { stageColors } from '@/types/flow-map-v2';

interface StageSwimlanesBackgroundProps {
  stages: FlowMapV2Stage[];
  width: number;
  height: number;
  visibleStages: FlowMapStageKey[];
}

function StageSwimlanesBackground({
  stages,
  width,
  height,
  visibleStages,
}: StageSwimlanesBackgroundProps) {
  // Filter and sort stages
  const visibleStagesList = useMemo(() => {
    return stages
      .filter((s) => visibleStages.includes(s.key))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [stages, visibleStages]);

  // Calculate lane widths
  const laneWidth = useMemo(() => {
    if (visibleStagesList.length === 0) return 0;
    return Math.max(width / visibleStagesList.length, 300);
  }, [width, visibleStagesList.length]);

  if (visibleStagesList.length === 0) {
    return null;
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={Math.max(width, laneWidth * visibleStagesList.length)}
      height={height}
      style={{ zIndex: 0 }}
    >
      <defs>
        {/* Grid pattern */}
        <pattern id="flowMapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="0.5" fill="#64748b" opacity="0.2" />
        </pattern>

        {/* Gradient definitions for each stage */}
        {visibleStagesList.map((stage) => {
          const color = stage.color || stageColors[stage.key] || '#64748b';
          return (
            <linearGradient
              key={`gradient-${stage.key}`}
              id={`stageGradient-${stage.key}`}
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

      {visibleStagesList.map((stage, index) => {
        const x = index * laneWidth;
        const color = stage.color || stageColors[stage.key] || '#64748b';

        return (
          <g key={stage.key}>
            {/* Lane background with gradient */}
            <rect
              x={x}
              y={0}
              width={laneWidth}
              height={height}
              fill={`url(#stageGradient-${stage.key})`}
            />

            {/* Grid pattern overlay */}
            <rect
              x={x}
              y={0}
              width={laneWidth}
              height={height}
              fill="url(#flowMapGrid)"
            />

            {/* Lane divider (except for last lane) */}
            {index < visibleStagesList.length - 1 && (
              <line
                x1={x + laneWidth}
                y1={0}
                x2={x + laneWidth}
                y2={height}
                stroke={color}
                strokeWidth={1}
                strokeOpacity={0.2}
                strokeDasharray="4 4"
              />
            )}

            {/* Stage label header - positioned at canvas origin */}
            <g>
              {/* Label background - starts at y=8 at canvas top */}
              <rect
                x={x}
                y={8}
                width={laneWidth}
                height={48}
                fill="rgba(15, 23, 42, 0.9)"
              />

              {/* Bottom border */}
              <line
                x1={x}
                y1={56}
                x2={x + laneWidth}
                y2={56}
                stroke={color}
                strokeWidth={2}
                strokeOpacity={0.5}
              />

              {/* Stage badge */}
              <rect
                x={x + laneWidth / 2 - 40}
                y={20}
                width={80}
                height={24}
                rx={12}
                fill={color}
                fillOpacity={0.2}
                stroke={color}
                strokeWidth={1}
                strokeOpacity={0.4}
              />

              {/* Stage name text */}
              <text
                x={x + laneWidth / 2}
                y={36}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={color}
                style={{
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                }}
              >
                {stage.name}
              </text>

              {/* Environment count badge */}
              {stage.environmentCount > 0 && (
                <>
                  <rect
                    x={x + laneWidth / 2 + 48}
                    y={24}
                    width={18}
                    height={16}
                    rx={8}
                    fill="rgba(148, 163, 184, 0.2)"
                  />
                  <text
                    x={x + laneWidth / 2 + 57}
                    y={36}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#94a3b8"
                    style={{
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: '10px',
                      fontWeight: 500,
                    }}
                  >
                    {stage.environmentCount}
                  </text>
                </>
              )}
            </g>
          </g>
        );
      })}
    </svg>
  );
}

export default memo(StageSwimlanesBackground);
