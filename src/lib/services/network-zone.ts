// Nexorium Core - Network Zone Service
// Network zone and connectivity management

import prisma from '@/lib/db';
import type {
  NetworkZone,
  NetworkZoneConnection,
  NetworkZoneType,
  ConnectivityPolicy,
  BridgeMechanism,
} from '@/types';

// Create a new network zone
export async function createNetworkZone(data: {
  name: string;
  type: NetworkZoneType;
  description?: string;
  vlanRange?: string;
  cidrBlocks?: string[];
}): Promise<NetworkZone> {
  return prisma.networkZone.create({
    data: {
      name: data.name,
      type: data.type,
      description: data.description,
      vlanRange: data.vlanRange,
      cidrBlocks: data.cidrBlocks || [],
    },
  }) as Promise<NetworkZone>;
}

// Get a network zone by ID
export async function getNetworkZone(id: string): Promise<NetworkZone | null> {
  return prisma.networkZone.findUnique({
    where: { id },
    include: {
      nodes: {
        select: {
          id: true,
          name: true,
          type: true,
          environmentId: true,
        },
      },
      outgoingConnections: {
        include: {
          targetZone: {
            select: { id: true, name: true, type: true },
          },
        },
      },
      incomingConnections: {
        include: {
          sourceZone: {
            select: { id: true, name: true, type: true },
          },
        },
      },
    },
  }) as Promise<NetworkZone | null>;
}

// Get network zone by name
export async function getNetworkZoneByName(name: string): Promise<NetworkZone | null> {
  return prisma.networkZone.findUnique({
    where: { name },
  }) as Promise<NetworkZone | null>;
}

// List all network zones
export async function listNetworkZones(options: {
  type?: NetworkZoneType;
  limit?: number;
  offset?: number;
} = {}) {
  const { type, limit = 50, offset = 0 } = options;

  const where: Record<string, unknown> = {};
  if (type) where.type = type;

  const [zones, total] = await Promise.all([
    prisma.networkZone.findMany({
      where,
      orderBy: { name: 'asc' },
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: { nodes: true },
        },
      },
    }),
    prisma.networkZone.count({ where }),
  ]);

  return {
    items: zones,
    total,
    hasMore: offset + zones.length < total,
  };
}

// Update a network zone
export async function updateNetworkZone(
  id: string,
  data: Partial<Pick<NetworkZone, 'name' | 'type' | 'description' | 'vlanRange' | 'cidrBlocks'>>
): Promise<NetworkZone> {
  return prisma.networkZone.update({
    where: { id },
    data,
  }) as Promise<NetworkZone>;
}

// Delete a network zone
export async function deleteNetworkZone(id: string): Promise<void> {
  await prisma.networkZone.delete({
    where: { id },
  });
}

// Assign a node to a network zone
export async function assignNodeToZone(nodeId: string, zoneId: string): Promise<void> {
  await prisma.node.update({
    where: { id: nodeId },
    data: { networkZoneId: zoneId },
  });
}

// Remove a node from its network zone
export async function removeNodeFromZone(nodeId: string): Promise<void> {
  await prisma.node.update({
    where: { id: nodeId },
    data: { networkZoneId: null },
  });
}

// Get nodes in a zone
export async function getZoneNodes(zoneId: string) {
  return prisma.node.findMany({
    where: { networkZoneId: zoneId },
    include: {
      databaseMetadata: true,
      environment: {
        select: { id: true, name: true, type: true },
      },
    },
  });
}

// Create a connection between zones
export async function createZoneConnection(data: {
  sourceZoneId: string;
  targetZoneId: string;
  policy: ConnectivityPolicy;
  bridgeMechanism?: BridgeMechanism;
  bridgeNodeName?: string;
  notes?: string;
}): Promise<NetworkZoneConnection> {
  return prisma.networkZoneConnection.create({
    data: {
      sourceZoneId: data.sourceZoneId,
      targetZoneId: data.targetZoneId,
      policy: data.policy,
      bridgeMechanism: data.bridgeMechanism,
      bridgeNodeName: data.bridgeNodeName,
      notes: data.notes,
    },
    include: {
      sourceZone: true,
      targetZone: true,
    },
  }) as Promise<NetworkZoneConnection>;
}

// Get zone connections
export async function getZoneConnections(zoneId: string): Promise<{
  outgoing: NetworkZoneConnection[];
  incoming: NetworkZoneConnection[];
}> {
  const [outgoing, incoming] = await Promise.all([
    prisma.networkZoneConnection.findMany({
      where: { sourceZoneId: zoneId },
      include: {
        sourceZone: true,
        targetZone: true,
      },
    }),
    prisma.networkZoneConnection.findMany({
      where: { targetZoneId: zoneId },
      include: {
        sourceZone: true,
        targetZone: true,
      },
    }),
  ]);

  return {
    outgoing: outgoing as NetworkZoneConnection[],
    incoming: incoming as NetworkZoneConnection[],
  };
}

// Update a zone connection
export async function updateZoneConnection(
  id: string,
  data: Partial<Pick<NetworkZoneConnection, 'policy' | 'bridgeMechanism' | 'bridgeNodeName' | 'notes'>>
): Promise<NetworkZoneConnection> {
  return prisma.networkZoneConnection.update({
    where: { id },
    data,
    include: {
      sourceZone: true,
      targetZone: true,
    },
  }) as Promise<NetworkZoneConnection>;
}

// Delete a zone connection
export async function deleteZoneConnection(id: string): Promise<void> {
  await prisma.networkZoneConnection.delete({
    where: { id },
  });
}

// Check if direct connection is allowed between two zones
export async function isDirectConnectionAllowed(
  sourceZoneId: string,
  targetZoneId: string
): Promise<{ allowed: boolean; policy?: ConnectivityPolicy; bridgeMechanism?: BridgeMechanism }> {
  const connection = await prisma.networkZoneConnection.findUnique({
    where: {
      sourceZoneId_targetZoneId: {
        sourceZoneId,
        targetZoneId,
      },
    },
  });

  if (!connection) {
    return { allowed: false };
  }

  return {
    allowed: connection.policy !== 'NO_DIRECT_ACCESS',
    policy: connection.policy as ConnectivityPolicy,
    bridgeMechanism: connection.bridgeMechanism as BridgeMechanism | undefined,
  };
}

// Get zone connectivity matrix
export async function getConnectivityMatrix() {
  const zones = await prisma.networkZone.findMany({
    select: { id: true, name: true, type: true },
  });

  const connections = await prisma.networkZoneConnection.findMany({
    select: {
      sourceZoneId: true,
      targetZoneId: true,
      policy: true,
      bridgeMechanism: true,
    },
  });

  const matrix: Record<string, Record<string, { policy: ConnectivityPolicy; bridge?: BridgeMechanism }>> = {};

  for (const zone of zones) {
    matrix[zone.id] = {};
  }

  for (const conn of connections) {
    matrix[conn.sourceZoneId][conn.targetZoneId] = {
      policy: conn.policy as ConnectivityPolicy,
      bridge: conn.bridgeMechanism as BridgeMechanism | undefined,
    };
  }

  return {
    zones,
    matrix,
  };
}
