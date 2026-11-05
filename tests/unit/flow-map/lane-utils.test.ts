// Nexorium Core - Lane Utils Unit Tests

import { describe, it, expect } from 'vitest';
import {
  calculateLaneSummary,
  calculateLaneDimensions,
  defaultStageLaneStates,
  defaultDomainLaneStates,
  LANE_HEADER_HEIGHT,
  LANE_COLLAPSED_WIDTH,
  LANE_MIN_WIDTH,
  type LaneState,
} from '@/lib/flow-map/lane-utils';

describe('lane-utils', () => {
  describe('calculateLaneSummary', () => {
    interface TestNode {
      id: string;
      lane: string;
      hasWarning?: boolean;
    }

    const nodes: TestNode[] = [
      { id: '1', lane: 'DEV', hasWarning: false },
      { id: '2', lane: 'DEV', hasWarning: true },
      { id: '3', lane: 'DEV', hasWarning: false },
      { id: '4', lane: 'SIT', hasWarning: true },
      { id: '5', lane: 'SIT', hasWarning: true },
    ];

    it('counts nodes in specified lane', () => {
      const summary = calculateLaneSummary(
        nodes,
        (n) => n.lane,
        'DEV'
      );

      expect(summary.nodeCount).toBe(3);
    });

    it('counts warnings when getter provided', () => {
      const summary = calculateLaneSummary(
        nodes,
        (n) => n.lane,
        'DEV',
        (n) => n.hasWarning ?? false
      );

      expect(summary.warningCount).toBe(1);
    });

    it('returns zero for empty lane', () => {
      const summary = calculateLaneSummary(
        nodes,
        (n) => n.lane,
        'UAT'
      );

      expect(summary.nodeCount).toBe(0);
      expect(summary.warningCount).toBe(0);
    });

    it('returns zero warnings when no getter', () => {
      const summary = calculateLaneSummary(
        nodes,
        (n) => n.lane,
        'SIT'
      );

      expect(summary.nodeCount).toBe(2);
      expect(summary.warningCount).toBe(0);
    });
  });

  describe('calculateLaneDimensions', () => {
    const laneKeys = ['DEV', 'SIT', 'UAT'];
    const defaultStates: Record<string, LaneState> = {
      DEV: { collapsed: false, visible: true, locked: false },
      SIT: { collapsed: false, visible: true, locked: false },
      UAT: { collapsed: false, visible: true, locked: false },
    };

    it('calculates dimensions for first lane', () => {
      const dims = calculateLaneDimensions(
        0,
        defaultStates,
        laneKeys,
        900,
        600
      );

      expect(dims.x).toBe(0);
      expect(dims.width).toBe(300); // 900 / 3
      expect(dims.isCollapsed).toBe(false);
    });

    it('calculates dimensions for middle lane', () => {
      const dims = calculateLaneDimensions(
        1,
        defaultStates,
        laneKeys,
        900,
        600
      );

      expect(dims.x).toBe(300);
      expect(dims.width).toBe(300);
    });

    it('uses collapsed width for collapsed lanes', () => {
      const statesWithCollapsed = {
        ...defaultStates,
        DEV: { collapsed: true, visible: true, locked: false },
      };

      const dims = calculateLaneDimensions(
        0,
        statesWithCollapsed,
        laneKeys,
        900,
        600
      );

      expect(dims.width).toBe(LANE_COLLAPSED_WIDTH);
      expect(dims.isCollapsed).toBe(true);
    });

    it('adjusts following lanes when one is collapsed', () => {
      const statesWithCollapsed = {
        ...defaultStates,
        DEV: { collapsed: true, visible: true, locked: false },
      };

      const sitDims = calculateLaneDimensions(
        1,
        statesWithCollapsed,
        laneKeys,
        900,
        600
      );

      expect(sitDims.x).toBe(LANE_COLLAPSED_WIDTH);
      // Remaining space (900 - 60) / 2 expanded lanes
      expect(sitDims.width).toBeGreaterThan(LANE_MIN_WIDTH);
    });

    it('respects minimum lane width', () => {
      // With many lanes, each should still have min width
      const manyLaneKeys = ['A', 'B', 'C', 'D', 'E', 'F'];
      const manyStates: Record<string, LaneState> = {};
      manyLaneKeys.forEach((k) => {
        manyStates[k] = { collapsed: false, visible: true, locked: false };
      });

      const dims = calculateLaneDimensions(
        0,
        manyStates,
        manyLaneKeys,
        600, // Not enough for 6 lanes at default width
        600
      );

      expect(dims.width).toBeGreaterThanOrEqual(LANE_MIN_WIDTH);
    });
  });

  describe('defaultStageLaneStates', () => {
    it('has all expected stage keys', () => {
      expect(defaultStageLaneStates).toHaveProperty('DEV');
      expect(defaultStageLaneStates).toHaveProperty('SIT');
      expect(defaultStageLaneStates).toHaveProperty('UAT');
      expect(defaultStageLaneStates).toHaveProperty('NFT');
      expect(defaultStageLaneStates).toHaveProperty('PREPROD');
      expect(defaultStageLaneStates).toHaveProperty('PROD_RO');
    });

    it('defaults to visible and not collapsed', () => {
      Object.values(defaultStageLaneStates).forEach((state) => {
        expect(state.visible).toBe(true);
        expect(state.collapsed).toBe(false);
        expect(state.locked).toBe(false);
      });
    });
  });

  describe('defaultDomainLaneStates', () => {
    it('has all expected domain keys', () => {
      expect(defaultDomainLaneStates).toHaveProperty('CSS');
      expect(defaultDomainLaneStates).toHaveProperty('BSS');
      expect(defaultDomainLaneStates).toHaveProperty('OSS');
      expect(defaultDomainLaneStates).toHaveProperty('NETWORK');
      expect(defaultDomainLaneStates).toHaveProperty('EXTERNAL');
    });

    it('defaults to visible and not collapsed', () => {
      Object.values(defaultDomainLaneStates).forEach((state) => {
        expect(state.visible).toBe(true);
        expect(state.collapsed).toBe(false);
        expect(state.locked).toBe(false);
      });
    });
  });

  describe('constants', () => {
    it('has reasonable header height', () => {
      expect(LANE_HEADER_HEIGHT).toBe(48);
    });

    it('has reasonable collapsed width', () => {
      expect(LANE_COLLAPSED_WIDTH).toBe(60);
    });

    it('has reasonable minimum width', () => {
      expect(LANE_MIN_WIDTH).toBe(200);
    });
  });
});
