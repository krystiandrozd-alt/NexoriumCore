'use client';

// Nexorium Core - Swimlane Background Component
// SVG background rendering for swimlanes

import { memo } from 'react';
import type { SwimLane } from '@/types';

interface SwimLaneBackgroundProps {
  lanes: SwimLane[];
  width: number;
  height: number;
}

function SwimLaneBackground({ lanes, width, height }: SwimLaneBackgroundProps) {
  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
      style={{ zIndex: 0 }}
    >
      <defs>
        <pattern id="nodeGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="0.5" fill="#94a3b8" opacity="0.3" />
        </pattern>
      </defs>

      {lanes.map((lane, index) => {
        const laneHeight = lane.yEnd - lane.yStart;

        return (
          <g key={lane.id}>
            {/* Lane background */}
            <rect
              x={0}
              y={lane.yStart}
              width={width}
              height={laneHeight}
              fill={lane.color}
              opacity={0.3}
            />

            {/* Lane grid pattern */}
            <rect
              x={0}
              y={lane.yStart}
              width={width}
              height={laneHeight}
              fill="url(#nodeGrid)"
            />

            {/* Lane divider (except for last lane) */}
            {index < lanes.length - 1 && (
              <line
                x1={0}
                y1={lane.yEnd}
                x2={width}
                y2={lane.yEnd}
                stroke="#cbd5e1"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            )}

            {/* Lane label */}
            <text
              x={16}
              y={lane.yStart + 24}
              className="text-xs font-medium"
              fill="#475569"
              style={{ fontFamily: 'system-ui, sans-serif', fontSize: '12px', fontWeight: 500 }}
            >
              {lane.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default memo(SwimLaneBackground);
