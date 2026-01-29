/**
 * Mappers from existing Nexorium Core types to canonical graph types
 */

import type {
  GraphNode,
  GraphEdge,
  NodeType,
  Protocol,
  TelcoLayer,
  HostingType,
  NetworkZoneType,
} from '@/types';
import type {
  CanonicalGraphNode,
  CanonicalGraphEdge,
  CanonicalEnvironmentGraph,
  PlaygroundNodeType,
  PlaygroundHostingType,
  PlaygroundNetworkZone,
  PlaygroundTelcoLayer,
  PlaygroundProtocol,
  PlaygroundHealthStatus,
} from './types';

/**
 * Map existing NodeType to PlaygroundNodeType
 */
function mapNodeType(nodeType: NodeType): PlaygroundNodeType {
  const mapping: Record<NodeType, PlaygroundNodeType> = {
    APPLICATION: 'application',
    SERVICE: 'service',
    DATABASE: 'database',
    GATEWAY: 'gateway',
    EXTERNAL: 'external',
    RUNTIME: 'runtime',
    MESSAGE_QUEUE: 'service',
    LOAD_BALANCER: 'gateway',
  };
  return mapping[nodeType] || 'application';
}

/**
 * Map existing HostingType to PlaygroundHostingType
 */
function mapHostingType(hostingType?: HostingType | null): PlaygroundHostingType {
  if (!hostingType) return 'unknown';
  const mapping: Record<HostingType, PlaygroundHostingType> = {
    CLOUD: 'cloud',
    ON_PREM: 'onprem',
    HYBRID: 'hybrid',
    THIRD_PARTY: 'thirdparty',
    EDGE: 'cloud', // Edge maps to cloud for simplicity
  };
  return mapping[hostingType] || 'unknown';
}

/**
 * Map existing NetworkZoneType to PlaygroundNetworkZone
 */
function mapNetworkZone(zoneType?: NetworkZoneType | null): PlaygroundNetworkZone {
  if (!zoneType) return 'unknown';
  const mapping: Record<NetworkZoneType, PlaygroundNetworkZone> = {
    PROD: 'prod',
    NON_PROD: 'nonprod',
    DMZ: 'dmz',
    PARTNER: 'partner',
    INTERNET: 'internet',
    SECURE_CORE: 'securecore',
    LAB: 'lab',
  };
  return mapping[zoneType] || 'unknown';
}

/**
 * Map existing TelcoLayer to PlaygroundTelcoLayer
 */
function mapTelcoLayer(layer?: TelcoLayer | null): PlaygroundTelcoLayer {
  if (!layer) return 'Unknown';
  const mapping: Record<TelcoLayer, PlaygroundTelcoLayer> = {
    BSS: 'BSS',
    OSS: 'OSS',
    NETWORK: 'Network',
    SHARED: 'Shared',
    EXTERNAL: 'External',
  };
  return mapping[layer] || 'Unknown';
}

/**
 * Map existing Protocol to PlaygroundProtocol
 */
function mapProtocol(protocol: Protocol): PlaygroundProtocol {
  const mapping: Record<Protocol, PlaygroundProtocol> = {
    REST: 'REST',
    GRPC: 'REST',
    MQ: 'MQ',
    JDBC: 'JDBC',
    SFTP: 'SFTP',
    EVENT: 'EVENT',
    WEBSOCKET: 'EVENT',
    SOAP: 'REST',
    GRAPHQL: 'REST',
  };
  return mapping[protocol] || 'OTHER';
}

/**
 * Derive health status from node data
 */
function deriveHealthStatus(node: GraphNode): PlaygroundHealthStatus {
  // Check staleness first
  if (node.data.isStale) return 'degraded';

  // Check policy violations
  if (node.data.hasPolicyViolations) return 'degraded';

  // Default to up if no issues
  return 'up';
}

/**
 * Map an existing GraphNode to CanonicalGraphNode
 */
export function mapExistingNodeToCanonical(node: GraphNode): CanonicalGraphNode {
  const primaryHostingDomain = node.data.hostingDomains?.find((hd) => hd.isPrimary);
  const hostingType = primaryHostingDomain?.hostingDomain?.hostingType;

  return {
    id: node.id,
    label: node.data.label,
    type: mapNodeType(node.data.nodeType),
    hostingType: mapHostingType(hostingType),
    networkZone: mapNetworkZone(node.data.networkZone?.type),
    telcoLayer: mapTelcoLayer(node.data.telcoLayer),
    health: deriveHealthStatus(node),
    confidence: 0.9, // Default high confidence for DB-sourced nodes
    lastSeenAt: node.data.lastSeenAt,
    meta: {
      owner: node.data.owner,
      criticality: node.data.criticality,
      telcoSubsystem: node.data.telcoSubsystem,
      hasEnrichments: node.data.hasEnrichments,
      hasPolicyViolations: node.data.hasPolicyViolations,
      dataClassification: node.data.dataClassification,
      derivedFromProdClone: node.data.derivedFromProdClone,
      databaseMetadata: node.data.databaseMetadata,
      runtimeLayer: node.data.runtimeLayer,
      position: node.position,
    },
  };
}

/**
 * Map an existing GraphEdge to CanonicalGraphEdge
 */
export function mapExistingEdgeToCanonical(edge: GraphEdge): CanonicalGraphEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    protocol: mapProtocol(edge.data.protocol),
    port: edge.data.port ?? undefined,
    label: edge.data.pathOrTopic ?? undefined,
    confidence: edge.data.confidenceScore,
    stale: edge.data.isStale ?? false,
  };
}

/**
 * Map a full environment with nodes and edges to canonical format
 */
export function mapEnvironmentToCanonical(
  env: { id: string; name: string; type: string },
  nodes: GraphNode[],
  edges: GraphEdge[]
): CanonicalEnvironmentGraph {
  return {
    environmentId: env.id,
    environmentName: env.name,
    environmentType: env.type,
    nodes: nodes.map(mapExistingNodeToCanonical),
    edges: edges.map(mapExistingEdgeToCanonical),
  };
}

/**
 * Serialize canonical graph for API response
 */
export function serializeGraph(graph: CanonicalEnvironmentGraph): unknown {
  return {
    ...graph,
    nodes: graph.nodes.map((node) => ({
      ...node,
      lastSeenAt: node.lastSeenAt?.toISOString() ?? null,
    })),
    edges: graph.edges.map((edge) => ({
      ...edge,
      lastObservedAt: edge.lastObservedAt?.toISOString(),
    })),
  };
}

/**
 * Deserialize API response to canonical graph
 */
export function deserializeGraph(data: unknown): CanonicalEnvironmentGraph {
  const raw = data as {
    environmentId?: string;
    environmentName?: string;
    environmentType?: string;
    nodes: Array<{
      id: string;
      label: string;
      type: PlaygroundNodeType;
      hostingType: PlaygroundHostingType;
      networkZone: PlaygroundNetworkZone;
      telcoLayer: PlaygroundTelcoLayer;
      health: PlaygroundHealthStatus;
      confidence: number;
      lastSeenAt: string | null;
      meta: Record<string, unknown>;
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      protocol: PlaygroundProtocol;
      port?: number;
      label?: string;
      confidence: number;
      lastObservedAt?: string;
      stale: boolean;
    }>;
  };

  return {
    environmentId: raw.environmentId,
    environmentName: raw.environmentName,
    environmentType: raw.environmentType,
    nodes: raw.nodes.map((node) => ({
      ...node,
      lastSeenAt: node.lastSeenAt ? new Date(node.lastSeenAt) : null,
    })),
    edges: raw.edges.map((edge) => ({
      ...edge,
      lastObservedAt: edge.lastObservedAt ? new Date(edge.lastObservedAt) : undefined,
    })),
  };
}
