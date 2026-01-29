// Nexorium Core - Environment Service
// Core business logic for environment management

import prisma from '@/lib/db';
import type { Environment, EnvironmentType, EnvironmentStats, NodeType, Protocol } from '@/types';
import type { DiscoveryPayload } from '@/lib/connectors/base';

// Get all environments
export async function getEnvironments() {
  return prisma.environment.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      stage: true,
      project: true,
      _count: {
        select: {
          nodes: true,
          edges: true,
        },
      },
    },
  });
}

// Get single environment with full topology
export async function getEnvironment(id: string) {
  return prisma.environment.findUnique({
    where: { id },
    include: {
      nodes: {
        include: {
          databaseMetadata: {
            include: {
              testDataSet: {
                include: {
                  refreshHistory: {
                    orderBy: { refreshDate: 'desc' },
                    take: 5,
                  },
                },
              },
            },
          },
        },
      },
      edges: true,
    },
  });
}

// Create new environment
export async function createEnvironment(data: {
  name: string;
  type: EnvironmentType;
  description?: string;
  stageId?: string;
  projectId?: string;
}) {
  return prisma.environment.create({
    data: {
      name: data.name,
      type: data.type,
      description: data.description,
      stageId: data.stageId,
      projectId: data.projectId,
    },
    include: {
      stage: true,
      project: true,
      _count: {
        select: {
          nodes: true,
          edges: true,
        },
      },
    },
  });
}

// Update environment
export async function updateEnvironment(
  id: string,
  data: Partial<Pick<Environment, 'name' | 'type' | 'description'>>
): Promise<Environment> {
  return prisma.environment.update({
    where: { id },
    data,
  });
}

// Delete environment
export async function deleteEnvironment(id: string): Promise<void> {
  await prisma.environment.delete({
    where: { id },
  });
}

// Apply discovery results to environment
export async function applyDiscoveryResults(
  environmentId: string,
  payload: DiscoveryPayload,
  source: string
): Promise<{ nodesCreated: number; edgesCreated: number; nodesUpdated: number }> {
  let nodesCreated = 0;
  let nodesUpdated = 0;
  let edgesCreated = 0;

  // Map to track created node IDs by name
  const nodeIdMap = new Map<string, string>();

  // Process nodes
  for (const discoveredNode of payload.nodes) {
    const existingNode = await prisma.node.findFirst({
      where: {
        environmentId,
        name: discoveredNode.name,
      },
    });

    if (existingNode) {
      // Update existing node
      await prisma.node.update({
        where: { id: existingNode.id },
        data: {
          type: discoveredNode.type,
          owner: discoveredNode.owner,
          criticality: discoveredNode.criticality || 'MEDIUM',
          lastSeenAt: new Date(),
          metadata: discoveredNode.metadata as object,
        },
      });
      nodeIdMap.set(discoveredNode.name, existingNode.id);
      nodesUpdated++;
    } else {
      // Create new node
      const newNode = await prisma.node.create({
        data: {
          environmentId,
          name: discoveredNode.name,
          type: discoveredNode.type,
          owner: discoveredNode.owner,
          criticality: discoveredNode.criticality || 'MEDIUM',
          lastSeenAt: new Date(),
          metadata: discoveredNode.metadata as object,
        },
      });
      nodeIdMap.set(discoveredNode.name, newNode.id);
      nodesCreated++;
    }
  }

  // Process edges
  for (const discoveredEdge of payload.edges) {
    const sourceId = nodeIdMap.get(discoveredEdge.sourceNodeName);
    const targetId = nodeIdMap.get(discoveredEdge.targetNodeName);

    if (!sourceId || !targetId) {
      continue; // Skip edges with missing nodes
    }

    const existingEdge = await prisma.edge.findFirst({
      where: {
        environmentId,
        sourceNodeId: sourceId,
        targetNodeId: targetId,
        protocol: discoveredEdge.protocol,
      },
    });

    if (!existingEdge) {
      await prisma.edge.create({
        data: {
          environmentId,
          sourceNodeId: sourceId,
          targetNodeId: targetId,
          protocol: discoveredEdge.protocol,
          port: discoveredEdge.port,
          pathOrTopic: discoveredEdge.pathOrTopic,
          confidenceScore: 1.0,
          lastObservedAt: new Date(),
          metadata: discoveredEdge.metadata as object,
        },
      });
      edgesCreated++;
    } else {
      await prisma.edge.update({
        where: { id: existingEdge.id },
        data: {
          lastObservedAt: new Date(),
          port: discoveredEdge.port,
          pathOrTopic: discoveredEdge.pathOrTopic,
          metadata: discoveredEdge.metadata as object,
        },
      });
    }
  }

  // Process databases
  if (payload.databases) {
    for (const dbInfo of payload.databases) {
      const nodeId = nodeIdMap.get(dbInfo.nodeName);
      if (!nodeId) continue;

      const existingDb = await prisma.databaseMetadata.findUnique({
        where: { nodeId },
      });

      if (!existingDb) {
        await prisma.databaseMetadata.create({
          data: {
            nodeId,
            engine: dbInfo.engine,
            version: dbInfo.version,
            host: dbInfo.host,
            port: dbInfo.port,
          },
        });
      } else {
        await prisma.databaseMetadata.update({
          where: { nodeId },
          data: {
            engine: dbInfo.engine,
            version: dbInfo.version,
            host: dbInfo.host,
            port: dbInfo.port,
          },
        });
      }
    }
  }

  // Store evidence
  await prisma.evidence.createMany({
    data: [
      {
        entityType: 'NODE',
        entityId: environmentId,
        source,
        timestamp: new Date(),
        confidence: 1.0,
        payload: {
          nodesDiscovered: payload.nodes.length,
          edgesDiscovered: payload.edges.length,
        },
      },
    ],
  });

  return { nodesCreated, edgesCreated, nodesUpdated };
}

// Get environment statistics
export async function getEnvironmentStats(environmentId: string): Promise<EnvironmentStats> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalNodes,
    totalEdges,
    nodesByType,
    edgesByProtocol,
    staleNodes,
    staleEdges,
    criticalNodes,
    databaseCount,
    datasetsNeedingRefresh,
  ] = await Promise.all([
    prisma.node.count({ where: { environmentId } }),
    prisma.edge.count({ where: { environmentId } }),
    prisma.node.groupBy({
      by: ['type'],
      where: { environmentId },
      _count: true,
    }),
    prisma.edge.groupBy({
      by: ['protocol'],
      where: { environmentId },
      _count: true,
    }),
    prisma.node.count({
      where: {
        environmentId,
        lastSeenAt: { lt: thirtyDaysAgo },
      },
    }),
    prisma.edge.count({
      where: {
        environmentId,
        lastObservedAt: { lt: thirtyDaysAgo },
      },
    }),
    prisma.node.count({
      where: {
        environmentId,
        criticality: 'CRITICAL',
      },
    }),
    prisma.databaseMetadata.count({
      where: {
        node: { environmentId },
      },
    }),
    prisma.testDataSet.count({
      where: {
        database: {
          node: { environmentId },
        },
        OR: [
          { lastRefreshDate: null },
          { lastRefreshDate: { lt: thirtyDaysAgo } },
        ],
      },
    }),
  ]);

  // Convert grouped results to records
  const nodesByTypeRecord: Record<NodeType, number> = {
    APPLICATION: 0,
    SERVICE: 0,
    DATABASE: 0,
    GATEWAY: 0,
    EXTERNAL: 0,
    RUNTIME: 0,
    MESSAGE_QUEUE: 0,
    LOAD_BALANCER: 0,
  };
  for (const item of nodesByType) {
    nodesByTypeRecord[item.type as NodeType] = item._count;
  }

  const edgesByProtocolRecord: Record<Protocol, number> = {
    REST: 0,
    GRPC: 0,
    MQ: 0,
    JDBC: 0,
    SFTP: 0,
    EVENT: 0,
    WEBSOCKET: 0,
    SOAP: 0,
    GRAPHQL: 0,
  };
  for (const item of edgesByProtocol) {
    edgesByProtocolRecord[item.protocol as Protocol] = item._count;
  }

  return {
    totalNodes,
    totalEdges,
    nodesByType: nodesByTypeRecord,
    edgesByProtocol: edgesByProtocolRecord,
    staleNodes,
    staleEdges,
    criticalNodes,
    databaseCount,
    datasetsNeedingRefresh,
  };
}

// Get unique owners in environment
export async function getEnvironmentOwners(environmentId: string): Promise<string[]> {
  const result = await prisma.node.findMany({
    where: {
      environmentId,
      owner: { not: null },
    },
    select: { owner: true },
    distinct: ['owner'],
  });

  return result.map(r => r.owner!).filter(Boolean);
}
