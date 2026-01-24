'use client';

// TelEnvIQ - Network Zone Swimlanes
// Generate swimlane configuration for network zone view

import type { SwimLane, NetworkZone, NetworkZoneType } from '@/types';

const ZONE_COLORS: Record<NetworkZoneType, string> = {
  PROD: '#fef3c7',       // Amber-100
  NON_PROD: '#dbeafe',   // Blue-100
  DMZ: '#fce7f3',        // Pink-100
  PARTNER: '#e0e7ff',    // Indigo-100
  INTERNET: '#dcfce7',   // Green-100
  SECURE_CORE: '#fef2f2', // Red-100
  LAB: '#f5f3ff',        // Violet-100
};

const ZONE_ORDER: NetworkZoneType[] = [
  'INTERNET',
  'DMZ',
  'PARTNER',
  'NON_PROD',
  'PROD',
  'SECURE_CORE',
  'LAB',
];

export function generateNetworkZoneLanes(
  zones: NetworkZone[],
  height: number
): SwimLane[] {
  if (zones.length === 0) return [];

  // Sort zones by predefined order
  const sortedZones = [...zones].sort((a, b) => {
    const aIndex = ZONE_ORDER.indexOf(a.type);
    const bIndex = ZONE_ORDER.indexOf(b.type);
    return aIndex - bIndex;
  });

  const laneHeight = height / sortedZones.length;

  return sortedZones.map((zone, index) => ({
    id: zone.id,
    label: zone.name,
    color: ZONE_COLORS[zone.type] || '#f1f5f9',
    yStart: index * laneHeight,
    yEnd: (index + 1) * laneHeight,
  }));
}

export function assignNodeToNetworkZoneLane(
  nodeZoneId: string | null | undefined,
  lanes: SwimLane[]
): string | null {
  if (!nodeZoneId) return null;
  const lane = lanes.find((l) => l.id === nodeZoneId);
  return lane?.id || null;
}

export function getNetworkZoneLaneY(
  nodeZoneId: string | null | undefined,
  lanes: SwimLane[]
): number {
  if (!nodeZoneId) {
    // Place unassigned nodes in the middle
    return lanes.length > 0 ? (lanes[0].yStart + lanes[lanes.length - 1].yEnd) / 2 : 0;
  }

  const lane = lanes.find((l) => l.id === nodeZoneId);
  if (!lane) return 0;

  // Return center of lane
  return (lane.yStart + lane.yEnd) / 2;
}
