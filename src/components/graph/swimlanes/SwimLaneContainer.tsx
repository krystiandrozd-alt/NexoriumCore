'use client';

// TelEnvIQ - Swimlane Container Component
// Wrapper for swimlane-based graph layouts

import { memo, useMemo } from 'react';
import type { ViewMode, SwimLane } from '@/types';
import SwimLaneBackground from './SwimLaneBackground';

interface SwimLaneContainerProps {
  viewMode: ViewMode;
  lanes: SwimLane[];
  width: number;
  height: number;
  children?: React.ReactNode;
}

function SwimLaneContainer({
  viewMode,
  lanes,
  width,
  height,
  children,
}: SwimLaneContainerProps) {
  const showSwimLanes = viewMode !== 'default' && lanes.length > 0;

  const containerStyle = useMemo(() => ({
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  }), []);

  if (!showSwimLanes) {
    return <div style={containerStyle}>{children}</div>;
  }

  return (
    <div style={containerStyle}>
      <SwimLaneBackground lanes={lanes} width={width} height={height} />
      {children}
    </div>
  );
}

export default memo(SwimLaneContainer);
