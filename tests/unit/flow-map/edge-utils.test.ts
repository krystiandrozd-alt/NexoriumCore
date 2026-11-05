// Nexorium Core - Edge Utils Unit Tests

import { describe, it, expect } from 'vitest';
import {
  resolveEdgeStyle,
  resolveEdgeType,
  validateConnection,
  truncateLabel,
  formatProtocolLabel,
  calculateCurvature,
} from '@/lib/flow-map/edge-utils';

describe('edge-utils', () => {
  describe('resolveEdgeStyle', () => {
    it('returns default style for integration edge type', () => {
      const style = resolveEdgeStyle('integration');
      expect(style.stroke).toBe('#8b5cf6');
      expect(style.strokeWidth).toBe(2);
      expect(style.strokeDasharray).toBe('0');
      expect(style.opacity).toBe(1);
    });

    it('increases stroke width when selected', () => {
      const normalStyle = resolveEdgeStyle('integration');
      const selectedStyle = resolveEdgeStyle('integration', { selected: true });
      expect(selectedStyle.strokeWidth).toBeGreaterThan(normalStyle.strokeWidth);
    });

    it('returns animated class for data-sync edges', () => {
      const style = resolveEdgeStyle('data-sync', { reduceMotion: false });
      expect(style.className).toBe('edge-animated-dash');
    });

    it('disables animation when reduceMotion is true', () => {
      const style = resolveEdgeStyle('data-sync', { reduceMotion: true });
      expect(style.className).toBeUndefined();
    });

    it('reduces opacity for blocked edges', () => {
      const style = resolveEdgeStyle('blocked');
      expect(style.opacity).toBeLessThan(1);
    });

    it('applies filter for selected promotion edge', () => {
      const style = resolveEdgeStyle('promotion', { selected: true });
      expect(style.filter).toBeDefined();
    });
  });

  describe('resolveEdgeType', () => {
    it('returns blocked when isBlocked hint is true', () => {
      const result = resolveEdgeType({ isBlocked: true });
      expect(result).toBe('blocked');
    });

    it('returns promotion when isPromotion hint is true', () => {
      const result = resolveEdgeType({ isPromotion: true });
      expect(result).toBe('promotion');
    });

    it('returns data-sync for database-to-database connections', () => {
      const result = resolveEdgeType({
        sourceType: 'DATABASE',
        targetType: 'DATABASE',
      });
      expect(result).toBe('data-sync');
    });

    it('returns data-sync for queue connections', () => {
      const result = resolveEdgeType({
        sourceType: 'SERVER',
        targetType: 'QUEUE_EVENT_BUS',
      });
      expect(result).toBe('data-sync');
    });

    it('returns reference for external system connections', () => {
      const result = resolveEdgeType({
        sourceType: 'API_SERVICE',
        targetType: 'EXTERNAL_SYSTEM',
      });
      expect(result).toBe('reference');
    });

    it('returns reference for note connections', () => {
      const result = resolveEdgeType({
        sourceType: 'NOTE',
        targetType: 'SERVER',
      });
      expect(result).toBe('reference');
    });

    it('returns integration as default', () => {
      const result = resolveEdgeType({
        sourceType: 'SERVER',
        targetType: 'API_SERVICE',
      });
      expect(result).toBe('integration');
    });

    it('returns data-sync for sync protocol', () => {
      const result = resolveEdgeType({
        protocol: 'db-sync',
      });
      expect(result).toBe('data-sync');
    });
  });

  describe('validateConnection', () => {
    it('returns valid for regular connections', () => {
      const result = validateConnection({
        sourceType: 'SERVER',
        targetType: 'DATABASE',
      });
      expect(result.valid).toBe(true);
    });

    it('suggests reference type for note connections', () => {
      const result = validateConnection({
        sourceType: 'NOTE',
        targetType: 'SERVER',
      });
      expect(result.valid).toBe(true);
      expect(result.suggestedEdgeType).toBe('reference');
    });

    it('suggests integration for cross-lane network connections', () => {
      const result = validateConnection({
        sourceType: 'SERVER',
        targetType: 'LOAD_BALANCER',
        sourceLane: 'NETWORK',
        targetLane: 'BSS',
        enforceLaneConstraints: true,
      });
      expect(result.valid).toBe(true);
      expect(result.suggestedEdgeType).toBe('integration');
    });
  });

  describe('truncateLabel', () => {
    it('returns original label if within limit', () => {
      expect(truncateLabel('Short', 20)).toBe('Short');
    });

    it('truncates long labels with ellipsis', () => {
      const result = truncateLabel('This is a very long label', 15);
      expect(result).toBe('This is a ve...');
      expect(result.length).toBe(15);
    });

    it('uses default max length of 20', () => {
      const longLabel = 'A very very very very long label';
      const result = truncateLabel(longLabel);
      expect(result.length).toBe(20);
    });
  });

  describe('formatProtocolLabel', () => {
    it('formats common protocols correctly', () => {
      expect(formatProtocolLabel('http')).toBe('HTTP');
      expect(formatProtocolLabel('https')).toBe('HTTPS');
      expect(formatProtocolLabel('rest')).toBe('REST');
      expect(formatProtocolLabel('grpc')).toBe('gRPC');
      expect(formatProtocolLabel('graphql')).toBe('GraphQL');
    });

    it('uppercases unknown protocols', () => {
      expect(formatProtocolLabel('custom')).toBe('CUSTOM');
    });

    it('is case-insensitive', () => {
      expect(formatProtocolLabel('HTTPS')).toBe('HTTPS');
      expect(formatProtocolLabel('Kafka')).toBe('Kafka');
    });
  });

  describe('calculateCurvature', () => {
    it('returns 0 for orthogonal routing', () => {
      const result = calculateCurvature('orthogonal', 0, 0, 100, 100);
      expect(result).toBe(0);
    });

    it('returns low curvature for short distances', () => {
      const result = calculateCurvature('smooth', 0, 0, 50, 50);
      expect(result).toBe(0.15);
    });

    it('returns medium curvature for medium distances', () => {
      const result = calculateCurvature('smooth', 0, 0, 200, 100);
      expect(result).toBe(0.2);
    });

    it('returns higher curvature for long distances', () => {
      const result = calculateCurvature('smooth', 0, 0, 400, 300);
      expect(result).toBe(0.3);
    });
  });
});
