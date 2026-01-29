// Nexorium Core - Lane Utilities
// Lane management, collapse state, and node counting

import type { FlowMapStageKey, FlowMapDomain } from '@/types/flow-map-v2';
import type { DomainLane } from '@/types/flow-map-manual';

// ============================================
// LANE STATE TYPES
// ============================================

export interface LaneState {
  collapsed: boolean;
  visible: boolean;
  locked: boolean;
}

export type StageLaneStates = Record<FlowMapStageKey, LaneState>;
export type DomainLaneStates = Record<DomainLane, LaneState>;

// ============================================
// DEFAULT LANE STATES
// ============================================

const defaultLaneState: LaneState = {
  collapsed: false,
  visible: true,
  locked: false,
};

export const defaultStageLaneStates: StageLaneStates = {
  DEV: { ...defaultLaneState },
  SIT: { ...defaultLaneState },
  UAT: { ...defaultLaneState },
  NFT: { ...defaultLaneState },
  PREPROD: { ...defaultLaneState },
  PROD_RO: { ...defaultLaneState },
};

export const defaultDomainLaneStates: DomainLaneStates = {
  CSS: { ...defaultLaneState },
  BSS: { ...defaultLaneState },
  OSS: { ...defaultLaneState },
  NETWORK: { ...defaultLaneState },
  EXTERNAL: { ...defaultLaneState },
};

// ============================================
// LANE SUMMARY
// ============================================

export interface LaneSummary {
  nodeCount: number;
  warningCount: number;
  connectionCount: number;
}

export function calculateLaneSummary<T extends { id: string }>(
  nodes: T[],
  getNodeLane: (node: T) => string,
  targetLane: string,
  getNodeWarning?: (node: T) => boolean
): LaneSummary {
  const laneNodes = nodes.filter((n) => getNodeLane(n) === targetLane);
  return {
    nodeCount: laneNodes.length,
    warningCount: getNodeWarning ? laneNodes.filter(getNodeWarning).length : 0,
    connectionCount: 0, // Can be calculated if edge data is provided
  };
}

// ============================================
// COLLAPSED LANE DIMENSIONS
// ============================================

export const LANE_HEADER_HEIGHT = 48;
export const LANE_COLLAPSED_WIDTH = 60;
export const LANE_MIN_WIDTH = 200;
export const LANE_DEFAULT_WIDTH = 300;

export interface LaneDimensions {
  x: number;
  width: number;
  height: number;
  isCollapsed: boolean;
}

export function calculateLaneDimensions(
  laneIndex: number,
  states: Record<string, LaneState>,
  laneKeys: string[],
  totalWidth: number,
  totalHeight: number
): LaneDimensions {
  const laneKey = laneKeys[laneIndex];
  const state = states[laneKey];
  const isCollapsed = state?.collapsed ?? false;

  // Calculate x position based on previous lanes
  let x = 0;
  for (let i = 0; i < laneIndex; i++) {
    const prevKey = laneKeys[i];
    const prevState = states[prevKey];
    if (prevState?.visible !== false) {
      x += prevState?.collapsed ? LANE_COLLAPSED_WIDTH : getLaneWidth(totalWidth, laneKeys, states, i);
    }
  }

  const width = isCollapsed ? LANE_COLLAPSED_WIDTH : getLaneWidth(totalWidth, laneKeys, states, laneIndex);

  return {
    x,
    width,
    height: totalHeight,
    isCollapsed,
  };
}

function getLaneWidth(
  totalWidth: number,
  laneKeys: string[],
  states: Record<string, LaneState>,
  laneIndex: number
): number {
  // Count visible non-collapsed lanes
  const visibleExpandedLanes = laneKeys.filter((key) => {
    const state = states[key];
    return state?.visible !== false && !state?.collapsed;
  });

  // Calculate collapsed lanes total width
  const collapsedWidth = laneKeys.reduce((acc, key) => {
    const state = states[key];
    if (state?.visible !== false && state?.collapsed) {
      return acc + LANE_COLLAPSED_WIDTH;
    }
    return acc;
  }, 0);

  const availableWidth = Math.max(totalWidth - collapsedWidth, 0);
  const expandedLaneWidth = visibleExpandedLanes.length > 0
    ? Math.max(availableWidth / visibleExpandedLanes.length, LANE_MIN_WIDTH)
    : LANE_DEFAULT_WIDTH;

  return expandedLaneWidth;
}

// ============================================
// PERSISTENCE
// ============================================

const STAGE_LANE_STATE_KEY = 'nexorium-stage-lane-states';
const DOMAIN_LANE_STATE_KEY = 'nexorium-domain-lane-states';

export function saveStageLaneStates(states: StageLaneStates): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STAGE_LANE_STATE_KEY, JSON.stringify(states));
  }
}

export function loadStageLaneStates(): StageLaneStates {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STAGE_LANE_STATE_KEY);
    if (saved) {
      try {
        return { ...defaultStageLaneStates, ...JSON.parse(saved) };
      } catch {
        return defaultStageLaneStates;
      }
    }
  }
  return defaultStageLaneStates;
}

export function saveDomainLaneStates(states: DomainLaneStates): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DOMAIN_LANE_STATE_KEY, JSON.stringify(states));
  }
}

export function loadDomainLaneStates(): DomainLaneStates {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(DOMAIN_LANE_STATE_KEY);
    if (saved) {
      try {
        return { ...defaultDomainLaneStates, ...JSON.parse(saved) };
      } catch {
        return defaultDomainLaneStates;
      }
    }
  }
  return defaultDomainLaneStates;
}
