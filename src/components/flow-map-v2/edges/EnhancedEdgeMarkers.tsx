'use client';

// Nexorium Core - Enhanced Edge Markers
// SVG marker definitions for all edge types

import { memo } from 'react';
import { edgeStyleConfigs, type EnhancedEdgeType } from '@/lib/flow-map/edge-utils';

const edgeTypes: EnhancedEdgeType[] = [
  'integration',
  'data-sync',
  'promotion',
  'reference',
  'blocked',
];

function EnhancedEdgeMarkers() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        {edgeTypes.map((type) => {
          const config = edgeStyleConfigs[type];
          return (
            <marker
              key={type}
              id={`marker-${type}`}
              markerWidth="12"
              markerHeight="12"
              refX="10"
              refY="6"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path
                d="M2,2 L10,6 L2,10 L4,6 Z"
                fill={config.color}
                stroke={config.color}
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </marker>
          );
        })}

        {/* Hollow arrow markers for reference edges */}
        <marker
          id="marker-reference-hollow"
          markerWidth="12"
          markerHeight="12"
          refX="10"
          refY="6"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M2,2 L10,6 L2,10"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>

        {/* Circular marker for blocked edges */}
        <marker
          id="marker-blocked-circle"
          markerWidth="10"
          markerHeight="10"
          refX="5"
          refY="5"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <circle
            cx="5"
            cy="5"
            r="4"
            fill="none"
            stroke="#ef4444"
            strokeWidth="1.5"
          />
          <line
            x1="2"
            y1="5"
            x2="8"
            y2="5"
            stroke="#ef4444"
            strokeWidth="1.5"
          />
        </marker>

        {/* Double arrow for promotion edges */}
        <marker
          id="marker-promotion-double"
          markerWidth="16"
          markerHeight="12"
          refX="14"
          refY="6"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M2,2 L8,6 L2,10"
            fill="none"
            stroke="#22c55e"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8,2 L14,6 L8,10"
            fill="none"
            stroke="#22c55e"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>

        {/* Gradient definitions for glow effects */}
        {edgeTypes.map((type) => {
          const config = edgeStyleConfigs[type];
          return (
            <linearGradient
              key={`gradient-${type}`}
              id={`gradient-${type}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={config.color} stopOpacity="0.1" />
              <stop offset="50%" stopColor={config.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={config.color} stopOpacity="0.1" />
            </linearGradient>
          );
        })}

        {/* Filter for glow effect */}
        <filter id="edge-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

export default memo(EnhancedEdgeMarkers);
