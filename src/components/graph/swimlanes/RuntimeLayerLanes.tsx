'use client';

// Nexorium Core - Runtime Layer Swimlanes
// Generate swimlane configuration for VM/Container/CNF view

import type { SwimLane, VirtualizationType } from '@/types';

const RUNTIME_COLORS: Record<VirtualizationType, string> = {
  BARE_METAL: '#fee2e2', // Red-100
  VM: '#dbeafe',         // Blue-100
  CONTAINER: '#dcfce7',  // Green-100
  CNF: '#fef3c7',        // Amber-100
  VNF: '#e0e7ff',        // Indigo-100
};

const RUNTIME_LABELS: Record<VirtualizationType, string> = {
  BARE_METAL: 'Bare Metal',
  VM: 'Virtual Machines',
  CONTAINER: 'Containers',
  CNF: 'Cloud-Native Functions',
  VNF: 'Virtual Network Functions',
};

const RUNTIME_ORDER: VirtualizationType[] = [
  'BARE_METAL',
  'VM',
  'VNF',
  'CONTAINER',
  'CNF',
];

export function generateRuntimeLayerLanes(height: number): SwimLane[] {
  const laneHeight = height / RUNTIME_ORDER.length;

  return RUNTIME_ORDER.map((runtime, index) => ({
    id: runtime,
    label: RUNTIME_LABELS[runtime],
    color: RUNTIME_COLORS[runtime],
    yStart: index * laneHeight,
    yEnd: (index + 1) * laneHeight,
  }));
}

export function getRuntimeLayerLaneY(
  virtualizationType: VirtualizationType | null | undefined,
  lanes: SwimLane[]
): number {
  // Default to VM if not specified
  const effectiveType = virtualizationType || 'VM';
  const lane = lanes.find((l) => l.id === effectiveType);

  if (!lane) return lanes[1]?.yStart || 0;

  // Return center of lane
  return (lane.yStart + lane.yEnd) / 2;
}

export function getRuntimeColor(type: VirtualizationType | null | undefined): string {
  return RUNTIME_COLORS[type || 'VM'];
}
