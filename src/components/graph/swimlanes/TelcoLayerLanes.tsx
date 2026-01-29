'use client';

// Nexorium Core - Telco Layer Swimlanes
// Generate swimlane configuration for BSS/OSS/Network view

import type { SwimLane, TelcoLayer } from '@/types';

const LAYER_COLORS: Record<TelcoLayer, string> = {
  EXTERNAL: '#dcfce7',   // Green-100 (Channels/External)
  BSS: '#dbeafe',        // Blue-100
  OSS: '#fef3c7',        // Amber-100
  NETWORK: '#e0e7ff',    // Indigo-100
  SHARED: '#f1f5f9',     // Slate-100
};

const LAYER_LABELS: Record<TelcoLayer, string> = {
  EXTERNAL: 'Channels & External',
  BSS: 'Business Support Systems (BSS)',
  OSS: 'Operations Support Systems (OSS)',
  NETWORK: 'Network Layer',
  SHARED: 'Shared Services',
};

const LAYER_ORDER: TelcoLayer[] = [
  'EXTERNAL',
  'BSS',
  'OSS',
  'NETWORK',
  'SHARED',
];

export function generateTelcoLayerLanes(height: number): SwimLane[] {
  const laneHeight = height / LAYER_ORDER.length;

  return LAYER_ORDER.map((layer, index) => ({
    id: layer,
    label: LAYER_LABELS[layer],
    color: LAYER_COLORS[layer],
    yStart: index * laneHeight,
    yEnd: (index + 1) * laneHeight,
  }));
}

export function getTelcoLayerLaneY(
  layer: TelcoLayer | null | undefined,
  lanes: SwimLane[]
): number {
  const effectiveLayer = layer || 'SHARED';
  const lane = lanes.find((l) => l.id === effectiveLayer);

  if (!lane) return lanes[lanes.length - 1]?.yEnd / 2 || 0;

  // Return center of lane
  return (lane.yStart + lane.yEnd) / 2;
}

export function getTelcoLayerColor(layer: TelcoLayer | null | undefined): string {
  return LAYER_COLORS[layer || 'SHARED'];
}
