// Nexorium Core - Playground Graph API
// GET /api/playground/graph - Get graph data for renderer playground

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import {
  generateSyntheticGraph,
  generateSmallSampleGraph,
  generateMediumSampleGraph,
  generateLargeSampleGraph,
} from '@/graph/model/sampleData';
import { serializeGraph } from '@/graph/model/mapping';
import type {
  CanonicalGraphNode,
  CanonicalGraphEdge,
  CanonicalEnvironmentGraph,
  PlaygroundNodeType,
  PlaygroundHostingType,
  PlaygroundNetworkZone,
  PlaygroundTelcoLayer,
  PlaygroundHealthStatus,
  PlaygroundProtocol,
} from '@/graph/model/types';

const QuerySchema = z.object({
  environmentId: z.string().optional(),
  synthetic: z.string().optional(),
});

/**
 * Map database node type to playground type
 */
function mapNodeType(type: string): PlaygroundNodeType {
  const mapping: Record<string, PlaygroundNodeType> = {
    APPLICATION: 'application',
    SERVICE: 'service',
    DATABASE: 'database',
    GATEWAY: 'gateway',
    EXTERNAL: 'external',
    RUNTIME: 'runtime',
    MESSAGE_QUEUE: 'service',
    LOAD_BALANCER: 'gateway',
  };
  return mapping[type] || 'application';
}

/**
 * Map database protocol to playground protocol
 */
function mapProtocol(protocol: string): PlaygroundProtocol {
  const mapping: Record<string, PlaygroundProtocol> = {
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
 * Fetch and transform environment data from database
 */
async function getEnvironmentGraph(environmentId: string): Promise<CanonicalEnvironmentGraph | null> {
  const environment = await prisma.environment.findUnique({
    where: { id: environmentId },
    include: {
      nodes: {
        include: {
          networkZone: true,
          hostingDomains: {
            include: {
              hostingDomain: true,
            },
            where: {
              isPrimary: true,
            },
          },
        },
      },
      edges: true,
    },
  });

  if (!environment) {
    return null;
  }

  // Transform nodes
  const nodes: CanonicalGraphNode[] = environment.nodes.map((node: {
    id: string;
    name: string;
    type: string;
    lastSeenAt: Date;
    owner?: string | null;
    criticality: string;
    telcoLayer?: string | null;
    telcoSubsystem?: string | null;
    networkZone?: { type: string } | null;
    hostingDomains?: Array<{ hostingDomain?: { hostingType?: string } | null }>;
  }) => {
    // Get primary hosting type
    const primaryHosting = node.hostingDomains?.[0]?.hostingDomain?.hostingType;
    const hostingType: PlaygroundHostingType = primaryHosting
      ? (primaryHosting.toLowerCase() as PlaygroundHostingType)
      : 'unknown';

    // Get network zone
    const zoneType = node.networkZone?.type;
    const networkZone: PlaygroundNetworkZone = zoneType
      ? (zoneType.toLowerCase().replace('_', '') as PlaygroundNetworkZone)
      : 'unknown';

    // Get telco layer
    const telcoLayer: PlaygroundTelcoLayer = node.telcoLayer
      ? (node.telcoLayer as PlaygroundTelcoLayer)
      : 'Unknown';

    // Determine health status
    const lastSeen = node.lastSeenAt;
    const isStale = lastSeen && (Date.now() - lastSeen.getTime()) > 7 * 24 * 60 * 60 * 1000;
    const health: PlaygroundHealthStatus = isStale ? 'degraded' : 'up';

    return {
      id: node.id,
      label: node.name,
      type: mapNodeType(node.type),
      hostingType,
      networkZone,
      telcoLayer,
      health,
      confidence: 0.9,
      lastSeenAt: node.lastSeenAt,
      meta: {
        owner: node.owner,
        criticality: node.criticality,
        telcoSubsystem: node.telcoSubsystem,
      },
    };
  });

  // Transform edges
  const edges: CanonicalGraphEdge[] = environment.edges.map((edge: {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    protocol: string;
    port?: number | null;
    pathOrTopic?: string | null;
    confidenceScore: number;
    lastObservedAt: Date;
  }) => {
    const isStale = edge.lastObservedAt &&
      (Date.now() - edge.lastObservedAt.getTime()) > 7 * 24 * 60 * 60 * 1000;

    return {
      id: edge.id,
      source: edge.sourceNodeId,
      target: edge.targetNodeId,
      protocol: mapProtocol(edge.protocol),
      port: edge.port ?? undefined,
      label: edge.pathOrTopic ?? undefined,
      confidence: edge.confidenceScore,
      lastObservedAt: edge.lastObservedAt,
      stale: isStale ?? false,
    };
  });

  return {
    environmentId: environment.id,
    environmentName: environment.name,
    environmentType: environment.type,
    nodes,
    edges,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const validation = QuerySchema.safeParse(params);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    const { environmentId, synthetic } = validation.data;

    let graph: CanonicalEnvironmentGraph;

    if (environmentId) {
      // Fetch from database
      const dbGraph = await getEnvironmentGraph(environmentId);
      if (!dbGraph) {
        return NextResponse.json(
          { success: false, error: 'Environment not found' },
          { status: 404 }
        );
      }
      graph = dbGraph;
    } else if (synthetic) {
      // Generate synthetic data
      const nodeCount = parseInt(synthetic, 10);
      if (isNaN(nodeCount) || nodeCount < 1) {
        return NextResponse.json(
          { success: false, error: 'Invalid synthetic node count' },
          { status: 400 }
        );
      }

      // Use preset generators for common sizes
      if (nodeCount <= 25) {
        graph = generateSmallSampleGraph();
      } else if (nodeCount <= 500) {
        graph = generateMediumSampleGraph();
      } else if (nodeCount >= 1000) {
        graph = generateLargeSampleGraph();
      } else {
        graph = generateSyntheticGraph(nodeCount);
      }
    } else {
      // Default to small synthetic graph
      graph = generateSmallSampleGraph();
    }

    return NextResponse.json({
      success: true,
      data: serializeGraph(graph),
    });
  } catch (error) {
    console.error('Failed to fetch graph data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch graph data' },
      { status: 500 }
    );
  }
}
