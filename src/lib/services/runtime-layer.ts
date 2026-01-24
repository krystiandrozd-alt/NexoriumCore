// TelEnvIQ - Runtime Layer Service
// Virtualization and runtime layer management

import prisma from '@/lib/db';
import type { RuntimeLayer, VirtualizationType } from '@/types';

// Create runtime layer for a node
export async function createRuntimeLayer(data: {
  nodeId: string;
  virtualizationType: VirtualizationType;
  runtimeName?: string;
  runtimeVersion?: string;
  orchestrator?: string;
  clusterName?: string;
  namespace?: string;
  resourceLimits?: Record<string, unknown>;
}): Promise<RuntimeLayer> {
  const result = await prisma.runtimeLayer.create({
    data: {
      nodeId: data.nodeId,
      virtualizationType: data.virtualizationType,
      runtimeName: data.runtimeName,
      runtimeVersion: data.runtimeVersion,
      orchestrator: data.orchestrator,
      clusterName: data.clusterName,
      namespace: data.namespace,
      resourceLimits: data.resourceLimits as object,
    },
    include: {
      node: {
        select: {
          id: true,
          name: true,
          type: true,
          environmentId: true,
        },
      },
    },
  });
  return result as unknown as RuntimeLayer;
}

// Get runtime layer by node ID
export async function getRuntimeLayerByNodeId(nodeId: string): Promise<RuntimeLayer | null> {
  const result = await prisma.runtimeLayer.findUnique({
    where: { nodeId },
    include: {
      node: {
        select: {
          id: true,
          name: true,
          type: true,
          environmentId: true,
        },
      },
    },
  });
  return result as unknown as RuntimeLayer | null;
}

// Get runtime layer by ID
export async function getRuntimeLayer(id: string): Promise<RuntimeLayer | null> {
  const result = await prisma.runtimeLayer.findUnique({
    where: { id },
    include: {
      node: {
        select: {
          id: true,
          name: true,
          type: true,
          environmentId: true,
        },
      },
    },
  });
  return result as unknown as RuntimeLayer | null;
}

// Update runtime layer
export async function updateRuntimeLayer(
  id: string,
  data: Partial<Omit<RuntimeLayer, 'id' | 'nodeId' | 'createdAt' | 'updatedAt' | 'node'>>
): Promise<RuntimeLayer> {
  const result = await prisma.runtimeLayer.update({
    where: { id },
    data: {
      ...(data.virtualizationType && { virtualizationType: data.virtualizationType }),
      ...(data.runtimeName !== undefined && { runtimeName: data.runtimeName }),
      ...(data.runtimeVersion !== undefined && { runtimeVersion: data.runtimeVersion }),
      ...(data.orchestrator !== undefined && { orchestrator: data.orchestrator }),
      ...(data.clusterName !== undefined && { clusterName: data.clusterName }),
      ...(data.namespace !== undefined && { namespace: data.namespace }),
      ...(data.resourceLimits !== undefined && { resourceLimits: data.resourceLimits as object }),
    },
    include: {
      node: {
        select: {
          id: true,
          name: true,
          type: true,
          environmentId: true,
        },
      },
    },
  });
  return result as unknown as RuntimeLayer;
}

// Delete runtime layer
export async function deleteRuntimeLayer(id: string): Promise<void> {
  await prisma.runtimeLayer.delete({
    where: { id },
  });
}

// Delete runtime layer by node ID
export async function deleteRuntimeLayerByNodeId(nodeId: string): Promise<void> {
  await prisma.runtimeLayer.deleteMany({
    where: { nodeId },
  });
}

// List runtime layers with filtering
export async function listRuntimeLayers(options: {
  environmentId?: string;
  virtualizationType?: VirtualizationType;
  orchestrator?: string;
  clusterName?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const { environmentId, virtualizationType, orchestrator, clusterName, limit = 50, offset = 0 } = options;

  const where: Record<string, unknown> = {};

  if (virtualizationType) where.virtualizationType = virtualizationType;
  if (orchestrator) where.orchestrator = orchestrator;
  if (clusterName) where.clusterName = clusterName;
  if (environmentId) {
    where.node = { environmentId };
  }

  const [layers, total] = await Promise.all([
    prisma.runtimeLayer.findMany({
      where,
      include: {
        node: {
          select: {
            id: true,
            name: true,
            type: true,
            environmentId: true,
            environment: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.runtimeLayer.count({ where }),
  ]);

  return {
    items: layers,
    total,
    hasMore: offset + layers.length < total,
  };
}

// Get runtime layer summary by type
export async function getRuntimeLayerSummary(environmentId?: string) {
  const where = environmentId ? { node: { environmentId } } : {};

  const byType = await prisma.runtimeLayer.groupBy({
    by: ['virtualizationType'],
    where,
    _count: { virtualizationType: true },
  });

  const byOrchestrator = await prisma.runtimeLayer.groupBy({
    by: ['orchestrator'],
    where: { ...where, orchestrator: { not: null } },
    _count: { orchestrator: true },
  });

  const byClustor = await prisma.runtimeLayer.groupBy({
    by: ['clusterName'],
    where: { ...where, clusterName: { not: null } },
    _count: { clusterName: true },
  });

  return {
    byVirtualizationType: Object.fromEntries(
      byType.map((t) => [t.virtualizationType, t._count.virtualizationType])
    ),
    byOrchestrator: Object.fromEntries(
      byOrchestrator.map((o) => [o.orchestrator!, o._count.orchestrator])
    ),
    byCluster: Object.fromEntries(
      byClustor.map((c) => [c.clusterName!, c._count.clusterName])
    ),
  };
}

// Get nodes by cluster
export async function getNodesByCluster(clusterName: string) {
  return prisma.runtimeLayer.findMany({
    where: { clusterName },
    include: {
      node: {
        include: {
          databaseMetadata: true,
          environment: {
            select: { id: true, name: true, type: true },
          },
        },
      },
    },
  });
}

// Get nodes by namespace
export async function getNodesByNamespace(namespace: string, clusterName?: string) {
  const where: Record<string, unknown> = { namespace };
  if (clusterName) where.clusterName = clusterName;

  return prisma.runtimeLayer.findMany({
    where,
    include: {
      node: {
        include: {
          databaseMetadata: true,
          environment: {
            select: { id: true, name: true, type: true },
          },
        },
      },
    },
  });
}
