'use client';

// TelEnvIQ - Hosting Domain Swimlanes
// Generate swimlane configuration for Cloud/On-Prem view

import type { SwimLane, HostingDomain, HostingType } from '@/types';

const HOSTING_COLORS: Record<HostingType, string> = {
  CLOUD: '#dbeafe',       // Blue-100
  ON_PREM: '#f1f5f9',     // Slate-100
  HYBRID: '#e0e7ff',      // Indigo-100
  THIRD_PARTY: '#fef3c7', // Amber-100
  EDGE: '#dcfce7',        // Green-100
};

const HOSTING_ORDER: HostingType[] = [
  'EDGE',
  'CLOUD',
  'HYBRID',
  'ON_PREM',
  'THIRD_PARTY',
];

export function generateHostingDomainLanes(
  domains: HostingDomain[],
  height: number
): SwimLane[] {
  if (domains.length === 0) {
    // Generate default lanes by hosting type
    const laneHeight = height / HOSTING_ORDER.length;
    return HOSTING_ORDER.map((type, index) => ({
      id: type,
      label: formatHostingType(type),
      color: HOSTING_COLORS[type],
      yStart: index * laneHeight,
      yEnd: (index + 1) * laneHeight,
    }));
  }

  // Sort domains by hosting type order
  const sortedDomains = [...domains].sort((a, b) => {
    const aIndex = HOSTING_ORDER.indexOf(a.hostingType);
    const bIndex = HOSTING_ORDER.indexOf(b.hostingType);
    return aIndex - bIndex;
  });

  const laneHeight = height / sortedDomains.length;

  return sortedDomains.map((domain, index) => ({
    id: domain.id,
    label: domain.name,
    color: HOSTING_COLORS[domain.hostingType] || '#f1f5f9',
    yStart: index * laneHeight,
    yEnd: (index + 1) * laneHeight,
  }));
}

export function getHostingDomainLaneY(
  domainId: string | null | undefined,
  lanes: SwimLane[]
): number {
  if (!domainId) {
    // Place unassigned nodes in the middle
    return lanes.length > 0 ? (lanes[0].yStart + lanes[lanes.length - 1].yEnd) / 2 : 0;
  }

  const lane = lanes.find((l) => l.id === domainId);
  if (!lane) return 0;

  // Return center of lane
  return (lane.yStart + lane.yEnd) / 2;
}

function formatHostingType(type: HostingType): string {
  switch (type) {
    case 'CLOUD':
      return 'Cloud';
    case 'ON_PREM':
      return 'On-Premises';
    case 'HYBRID':
      return 'Hybrid';
    case 'THIRD_PARTY':
      return 'Third Party';
    case 'EDGE':
      return 'Edge';
    default:
      return type;
  }
}

export function getHostingColor(type: HostingType | null | undefined): string {
  return HOSTING_COLORS[type || 'ON_PREM'];
}
