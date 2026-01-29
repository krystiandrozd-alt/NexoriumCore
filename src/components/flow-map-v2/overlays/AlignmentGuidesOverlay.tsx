'use client';

// Nexorium Core - Alignment Guides Overlay
// Visual alignment guides shown while dragging nodes

import { memo } from 'react';
import type { AlignmentGuide } from '@/lib/flow-map/selection-utils';

interface AlignmentGuidesOverlayProps {
  guides: AlignmentGuide[];
  visible: boolean;
}

function AlignmentGuidesOverlay({ guides, visible }: AlignmentGuidesOverlayProps) {
  if (!visible || guides.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-50"
      width="100%"
      height="100%"
    >
      <defs>
        {/* Dashed line pattern */}
        <pattern
          id="alignmentDash"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(0)"
        >
          <line x1="0" y1="4" x2="4" y2="4" stroke="#8b5cf6" strokeWidth="1" />
        </pattern>
      </defs>

      {guides.map((guide, index) => {
        if (guide.type === 'horizontal') {
          return (
            <g key={`h-${index}`}>
              {/* Main guide line */}
              <line
                x1={guide.start - 20}
                y1={guide.position}
                x2={guide.end + 20}
                y2={guide.position}
                stroke="#8b5cf6"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.8"
              />
              {/* End markers */}
              <circle
                cx={guide.start - 20}
                cy={guide.position}
                r="3"
                fill="#8b5cf6"
                opacity="0.6"
              />
              <circle
                cx={guide.end + 20}
                cy={guide.position}
                r="3"
                fill="#8b5cf6"
                opacity="0.6"
              />
            </g>
          );
        }

        return (
          <g key={`v-${index}`}>
            {/* Main guide line */}
            <line
              x1={guide.position}
              y1={guide.start - 20}
              x2={guide.position}
              y2={guide.end + 20}
              stroke="#8b5cf6"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.8"
            />
            {/* End markers */}
            <circle
              cx={guide.position}
              cy={guide.start - 20}
              r="3"
              fill="#8b5cf6"
              opacity="0.6"
            />
            <circle
              cx={guide.position}
              cy={guide.end + 20}
              r="3"
              fill="#8b5cf6"
              opacity="0.6"
            />
          </g>
        );
      })}
    </svg>
  );
}

export default memo(AlignmentGuidesOverlay);
