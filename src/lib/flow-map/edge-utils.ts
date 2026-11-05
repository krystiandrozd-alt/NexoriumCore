// Nexorium Core - Flow Map Edge Utilities
// Edge type resolution, styling, validation, and routing

import type { ManualNodeType } from '@/types/flow-map-manual';

// ============================================
// EDGE TYPES
// ============================================

export type EnhancedEdgeType =
  | 'integration'   // Default solid line
  | 'data-sync'     // Animated pulse (dashed, moving)
  | 'promotion'     // Directional with subtle glow
  | 'reference'     // Dashed, lighter
  | 'blocked';      // Red/disabled style

export type EdgeRoutingMode = 'smooth' | 'orthogonal';

// ============================================
// EDGE STYLE CONFIGURATION
// ============================================

export interface EdgeStyleConfig {
  color: string;
  strokeWidth: number;
  strokeDasharray: string;
  animated: boolean;
  animationType?: 'pulse' | 'flow' | 'dash';
  animationDuration?: number; // ms
  glowColor?: string;
  glowIntensity?: number;
  label: string;
  description: string;
}

export const edgeStyleConfigs: Record<EnhancedEdgeType, EdgeStyleConfig> = {
  integration: {
    color: '#8b5cf6', // violet-500
    strokeWidth: 2,
    strokeDasharray: '0',
    animated: false,
    label: 'Integration',
    description: 'Standard system integration',
  },
  'data-sync': {
    color: '#06b6d4', // cyan-500
    strokeWidth: 2,
    strokeDasharray: '8 4',
    animated: true,
    animationType: 'dash',
    animationDuration: 1000,
    label: 'Data Sync',
    description: 'Data synchronization flow',
  },
  promotion: {
    color: '#22c55e', // green-500
    strokeWidth: 2.5,
    strokeDasharray: '0',
    animated: true,
    animationType: 'flow',
    animationDuration: 2000,
    glowColor: '#22c55e',
    glowIntensity: 0.3,
    label: 'Promotion',
    description: 'Environment promotion path',
  },
  reference: {
    color: '#94a3b8', // slate-400
    strokeWidth: 1.5,
    strokeDasharray: '4 4',
    animated: false,
    label: 'Reference',
    description: 'Reference or lookup dependency',
  },
  blocked: {
    color: '#ef4444', // red-500
    strokeWidth: 2,
    strokeDasharray: '6 6',
    animated: false,
    label: 'Blocked',
    description: 'Blocked or disabled connection',
  },
};

// ============================================
// EDGE STYLE RESOLVER
// ============================================

export interface ResolvedEdgeStyle {
  stroke: string;
  strokeWidth: number;
  strokeDasharray: string;
  strokeLinecap: 'round' | 'butt' | 'square';
  opacity: number;
  filter?: string;
  animation?: string;
  className?: string;
}

export function resolveEdgeStyle(
  edgeType: EnhancedEdgeType,
  options: {
    selected?: boolean;
    hovered?: boolean;
    reduceMotion?: boolean;
  } = {}
): ResolvedEdgeStyle {
  const config = edgeStyleConfigs[edgeType];
  const { selected, hovered, reduceMotion } = options;

  let strokeWidth = config.strokeWidth;
  let opacity = 1;
  let filter: string | undefined;
  let animation: string | undefined;
  let className: string | undefined;

  // Selection effects
  if (selected) {
    strokeWidth += 1;
    if (config.glowColor) {
      filter = `drop-shadow(0 0 4px ${config.glowColor})`;
    }
  }

  // Hover effects
  if (hovered && !selected) {
    strokeWidth += 0.5;
    opacity = 1;
  }

  // Animation (if not reduced motion)
  if (config.animated && !reduceMotion) {
    switch (config.animationType) {
      case 'dash':
        className = 'edge-animated-dash';
        break;
      case 'flow':
        className = 'edge-animated-flow';
        break;
      case 'pulse':
        className = 'edge-animated-pulse';
        break;
    }
  }

  // Blocked edge styling
  if (edgeType === 'blocked') {
    opacity = 0.7;
  }

  return {
    stroke: config.color,
    strokeWidth,
    strokeDasharray: config.strokeDasharray,
    strokeLinecap: 'round',
    opacity,
    filter,
    animation,
    className,
  };
}

// ============================================
// EDGE TYPE RESOLVER (Auto-assignment)
// ============================================

export interface EdgeTypeHint {
  sourceType?: ManualNodeType;
  targetType?: ManualNodeType;
  protocol?: string;
  isPromotion?: boolean;
  isBlocked?: boolean;
}

/**
 * Automatically determine edge type based on source/target node types
 * and other context hints
 */
export function resolveEdgeType(hint: EdgeTypeHint): EnhancedEdgeType {
  const { sourceType, targetType, protocol, isPromotion, isBlocked } = hint;

  // Explicit flags take precedence
  if (isBlocked) return 'blocked';
  if (isPromotion) return 'promotion';

  // Protocol-based hints
  if (protocol) {
    const lowerProtocol = protocol.toLowerCase();
    if (lowerProtocol.includes('sync') || lowerProtocol.includes('replication')) {
      return 'data-sync';
    }
  }

  // Node type combinations
  if (sourceType && targetType) {
    // Database connections are often data-sync
    if (sourceType === 'DATABASE' || targetType === 'DATABASE') {
      if (sourceType === 'DATABASE' && targetType === 'DATABASE') {
        return 'data-sync';
      }
    }

    // Queue/event bus connections
    if (sourceType === 'QUEUE_EVENT_BUS' || targetType === 'QUEUE_EVENT_BUS') {
      return 'data-sync';
    }

    // External system connections are references
    if (sourceType === 'EXTERNAL_SYSTEM' || targetType === 'EXTERNAL_SYSTEM') {
      return 'reference';
    }

    // Note connections are references
    if (sourceType === 'NOTE' || targetType === 'NOTE') {
      return 'reference';
    }
  }

  // Default to integration
  return 'integration';
}

// ============================================
// CONNECTION VALIDATION
// ============================================

export interface ConnectionValidationResult {
  valid: boolean;
  reason?: string;
  suggestedEdgeType?: EnhancedEdgeType;
}

export interface ConnectionValidationInput {
  sourceType: ManualNodeType;
  targetType: ManualNodeType;
  sourceLane?: string;
  targetLane?: string;
  enforceDirectionRules?: boolean;
  enforceLaneConstraints?: boolean;
}

/**
 * Validate if a connection between two nodes is allowed
 */
export function validateConnection(
  input: ConnectionValidationInput
): ConnectionValidationResult {
  const { sourceType, targetType, sourceLane, targetLane, enforceDirectionRules, enforceLaneConstraints } = input;

  // Self-connection not allowed (except for notes)
  if (sourceType === targetType && sourceType !== 'NOTE') {
    // Same type connections are allowed, this is just a placeholder
  }

  // Notes can only have reference connections
  if (sourceType === 'NOTE' || targetType === 'NOTE') {
    return {
      valid: true,
      suggestedEdgeType: 'reference',
    };
  }

  // Direction rules (if enforced)
  if (enforceDirectionRules) {
    // Storage typically receives data, not sends
    if (sourceType === 'STORAGE' && targetType === 'API_SERVICE') {
      return {
        valid: true,
        reason: 'Storage to API typically implies read operations',
        suggestedEdgeType: 'reference',
      };
    }
  }

  // Lane constraints (if enforced)
  if (enforceLaneConstraints && sourceLane && targetLane) {
    // Cross-lane connections might need special edge types
    if (sourceLane !== targetLane) {
      // Connections from NETWORK to other lanes are typically integrations
      if (sourceLane === 'NETWORK' || targetLane === 'NETWORK') {
        return {
          valid: true,
          suggestedEdgeType: 'integration',
        };
      }
    }
  }

  // All other connections are valid
  return {
    valid: true,
    suggestedEdgeType: resolveEdgeType({ sourceType, targetType }),
  };
}

// ============================================
// ROUTING UTILITIES
// ============================================

/**
 * Calculate curvature based on routing mode and edge distance
 */
export function calculateCurvature(
  routingMode: EdgeRoutingMode,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
): number {
  if (routingMode === 'orthogonal') {
    return 0; // Step edges will handle this differently
  }

  // Smooth routing - adjust curvature based on distance
  const dx = Math.abs(targetX - sourceX);
  const dy = Math.abs(targetY - sourceY);
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Reduce curvature for short distances, increase for long
  if (distance < 100) return 0.15;
  if (distance < 300) return 0.2;
  if (distance < 500) return 0.25;
  return 0.3;
}

/**
 * Generate orthogonal path points for step routing
 */
export function generateOrthogonalPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  sourcePosition: 'left' | 'right' | 'top' | 'bottom',
  targetPosition: 'left' | 'right' | 'top' | 'bottom',
  _offset: number = 40
): string {
  const isHorizontalSource = sourcePosition === 'left' || sourcePosition === 'right';
  const isHorizontalTarget = targetPosition === 'left' || targetPosition === 'right';

  // Calculate midpoints based on positions
  let midX: number;
  let midY: number;

  if (isHorizontalSource && isHorizontalTarget) {
    // Both horizontal - create horizontal-first path
    midX = (sourceX + targetX) / 2;
    return `M ${sourceX} ${sourceY} H ${midX} V ${targetY} H ${targetX}`;
  } else if (!isHorizontalSource && !isHorizontalTarget) {
    // Both vertical - create vertical-first path
    midY = (sourceY + targetY) / 2;
    return `M ${sourceX} ${sourceY} V ${midY} H ${targetX} V ${targetY}`;
  } else if (isHorizontalSource) {
    // Source horizontal, target vertical
    return `M ${sourceX} ${sourceY} H ${targetX} V ${targetY}`;
  } else {
    // Source vertical, target horizontal
    return `M ${sourceX} ${sourceY} V ${targetY} H ${targetX}`;
  }
}

// ============================================
// MARKER DEFINITIONS
// ============================================

export interface MarkerConfig {
  id: string;
  color: string;
  width: number;
  height: number;
}

export function getMarkerConfig(edgeType: EnhancedEdgeType): MarkerConfig {
  const config = edgeStyleConfigs[edgeType];
  return {
    id: `marker-${edgeType}`,
    color: config.color,
    width: 12,
    height: 12,
  };
}

// ============================================
// EDGE LABEL UTILITIES
// ============================================

export function truncateLabel(label: string, maxLength: number = 20): string {
  if (label.length <= maxLength) return label;
  return label.slice(0, maxLength - 3) + '...';
}

export function formatProtocolLabel(protocol: string): string {
  // Common protocol formatting
  const formattedProtocols: Record<string, string> = {
    http: 'HTTP',
    https: 'HTTPS',
    rest: 'REST',
    soap: 'SOAP',
    grpc: 'gRPC',
    graphql: 'GraphQL',
    websocket: 'WebSocket',
    ws: 'WebSocket',
    amqp: 'AMQP',
    mqtt: 'MQTT',
    kafka: 'Kafka',
    jdbc: 'JDBC',
    odbc: 'ODBC',
  };

  const lower = protocol.toLowerCase();
  return formattedProtocols[lower] || protocol.toUpperCase();
}
