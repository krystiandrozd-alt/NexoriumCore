'use client';

// Nexorium Core - Domain Swimlanes Background Component
// Horizontal swimlanes for Level 1 Environment Detail Map
// Domains: CSS, BSS, OSS, NETWORK, EXTERNAL
// Renders in flow coordinate space (not as Panel) to move with pan/zoom

import { memo } from 'react';
import { useViewport } from '@xyflow/react';
import { domainLanes, type DomainLane } from '@/types/flow-map-manual';

interface DomainSwimlanesBackgroundProps {
  width: number;
  height: number;
  laneHeight?: number;
  visibleLanes?: DomainLane[];
}

function DomainSwimlanesBackground({
  width,
  height,
  laneHeight = 180,
  visibleLanes,
}: DomainSwimlanesBackgroundProps) {
  // Get current viewport to apply inverse transform
  const { x: viewX, y: viewY, zoom } = useViewport();

  // Filter lanes if specified
  const lanes = visibleLanes
    ? domainLanes.filter((lane) => visibleLanes.includes(lane.key))
    : domainLanes;

  const headerWidth = 180; // Width for lane labels
  const totalLaneHeight = lanes.length * laneHeight;

  // Calculate visible bounds in flow coordinates
  const viewWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const viewHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

  // Expand the render area to account for panning
  const renderWidth = Math.max(width, viewWidth / zoom + 400);
  const renderHeight = Math.max(height, totalLaneHeight + 200, viewHeight / zoom + 200);

  return (
    <svg
      width={renderWidth}
      height={renderHeight}
      className="react-flow__swimlanes"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: -1,
        pointerEvents: 'none',
        transform: `translate(${-viewX / zoom}px, ${-viewY / zoom}px)`,
        transformOrigin: '0 0',
      }}
    >
        <defs>
          {/* Gradient for each lane */}
          {lanes.map((lane) => (
            <linearGradient
              key={`gradient-${lane.key}`}
              id={`lane-gradient-${lane.key}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={lane.bgColor} />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          ))}
        </defs>

        {/* Lane backgrounds */}
        {lanes.map((lane, index) => {
          const y = index * laneHeight;
          return (
            <g key={lane.key}>
              {/* Lane background */}
              <rect
                x={headerWidth}
                y={y}
                width={width - headerWidth}
                height={laneHeight}
                fill={`url(#lane-gradient-${lane.key})`}
              />

              {/* Lane border (bottom) */}
              <line
                x1={0}
                y1={y + laneHeight}
                x2={width}
                y2={y + laneHeight}
                stroke={lane.color}
                strokeOpacity={0.2}
                strokeWidth={1}
                strokeDasharray="4,4"
              />

              {/* Lane header background */}
              <rect
                x={0}
                y={y}
                width={headerWidth}
                height={laneHeight}
                fill={lane.bgColor}
                className="pointer-events-auto"
              />

              {/* Lane header vertical divider */}
              <line
                x1={headerWidth}
                y1={y}
                x2={headerWidth}
                y2={y + laneHeight}
                stroke={lane.color}
                strokeOpacity={0.3}
                strokeWidth={1}
              />

              {/* Lane label */}
              <foreignObject x={8} y={y + 12} width={headerWidth - 16} height={laneHeight - 24}>
                <div className="flex flex-col h-full">
                  <div
                    className="text-xs font-bold tracking-wide"
                    style={{ color: lane.color }}
                  >
                    {lane.key}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    {lane.label}
                  </div>
                </div>
              </foreignObject>

              {/* Accent line on left edge */}
              <rect
                x={0}
                y={y}
                width={3}
                height={laneHeight}
                fill={lane.color}
                fillOpacity={0.6}
              />
            </g>
          );
        })}
      </svg>
  );
}

export default memo(DomainSwimlanesBackground);

// ============================================
// UTILITY: Calculate lane Y position
// ============================================

export function getDomainLaneY(domainLane: DomainLane, laneHeight: number = 180): number {
  const lane = domainLanes.find((l) => l.key === domainLane);
  if (!lane) return 0;
  return lane.sortOrder * laneHeight + laneHeight / 2;
}

export function getDomainLaneForY(y: number, laneHeight: number = 180): DomainLane {
  const laneIndex = Math.floor(y / laneHeight);
  const clampedIndex = Math.max(0, Math.min(laneIndex, domainLanes.length - 1));
  return domainLanes[clampedIndex].key;
}
