// TelEnvIQ - Hosting Domain Service
// Cloud/on-prem hosting abstraction management

import prisma from '@/lib/db';
import type { HostingDomain, NodeHostingDomain, HostingType, CloudProvider } from '@/types';

// Create a hosting domain
export async function createHostingDomain(data: {
  name: string;
  hostingType: HostingType;
  cloudProvider?: CloudProvider;
  region?: string;
  accountId?: string;
  dataCenter?: string;
  description?: string;
}): Promise<HostingDomain> {
  return prisma.hostingDomain.create({
    data: {
      name: data.name,
      hostingType: data.hostingType,
      cloudProvider: data.cloudProvider,
      region: data.region,
      accountId: data.accountId,
      dataCenter: data.dataCenter,
      description: data.description,
    },
  }) as Promise<HostingDomain>;
}

// Get hosting domain by ID
export async function getHostingDomain(id: string): Promise<HostingDomain | null> {
  return prisma.hostingDomain.findUnique({
    where: { id },
    include: {
      nodes: {
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
      },
    },
  }) as Promise<HostingDomain | null>;
}

// Get hosting domain by name
export async function getHostingDomainByName(name: string): Promise<HostingDomain | null> {
  return prisma.hostingDomain.findUnique({
    where: { name },
  }) as Promise<HostingDomain | null>;
}

// List hosting domains
export async function listHostingDomains(options: {
  hostingType?: HostingType;
  cloudProvider?: CloudProvider;
  limit?: number;
  offset?: number;
} = {}) {
  const { hostingType, cloudProvider, limit = 50, offset = 0 } = options;

  const where: Record<string, unknown> = {};
  if (hostingType) where.hostingType = hostingType;
  if (cloudProvider) where.cloudProvider = cloudProvider;

  const [domains, total] = await Promise.all([
    prisma.hostingDomain.findMany({
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
    prisma.hostingDomain.count({ where }),
  ]);

  return {
    items: domains,
    total,
    hasMore: offset + domains.length < total,
  };
}

// Update hosting domain
export async function updateHostingDomain(
  id: string,
  data: Partial<Omit<HostingDomain, 'id' | 'createdAt' | 'updatedAt' | 'nodes'>>
): Promise<HostingDomain> {
  return prisma.hostingDomain.update({
    where: { id },
    data,
  }) as Promise<HostingDomain>;
}

// Delete hosting domain
export async function deleteHostingDomain(id: string): Promise<void> {
  await prisma.hostingDomain.delete({
    where: { id },
  });
}

// Assign node to hosting domain
export async function assignNodeToHostingDomain(data: {
  nodeId: string;
  hostingDomainId: string;
  isPrimary?: boolean;
  notes?: string;
}): Promise<NodeHostingDomain> {
  // If this is primary, unset any existing primary for this node
  if (data.isPrimary) {
    await prisma.nodeHostingDomain.updateMany({
      where: { nodeId: data.nodeId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  const result = await prisma.nodeHostingDomain.create({
    data: {
      nodeId: data.nodeId,
      hostingDomainId: data.hostingDomainId,
      isPrimary: data.isPrimary ?? true,
      notes: data.notes,
    },
    include: {
      node: {
        select: { id: true, name: true, type: true },
      },
      hostingDomain: true,
    },
  });
  return result as unknown as NodeHostingDomain;
}

// Remove node from hosting domain
export async function removeNodeFromHostingDomain(nodeId: string, hostingDomainId: string): Promise<void> {
  await prisma.nodeHostingDomain.delete({
    where: {
      nodeId_hostingDomainId: {
        nodeId,
        hostingDomainId,
      },
    },
  });
}

// Get hosting domains for a node
export async function getNodeHostingDomains(nodeId: string): Promise<NodeHostingDomain[]> {
  return prisma.nodeHostingDomain.findMany({
    where: { nodeId },
    include: {
      hostingDomain: true,
    },
  }) as Promise<NodeHostingDomain[]>;
}

// Get nodes in a hosting domain
export async function getHostingDomainNodes(hostingDomainId: string) {
  return prisma.nodeHostingDomain.findMany({
    where: { hostingDomainId },
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

// Set primary hosting domain for a node
export async function setPrimaryHostingDomain(nodeId: string, hostingDomainId: string): Promise<void> {
  await prisma.$transaction([
    prisma.nodeHostingDomain.updateMany({
      where: { nodeId, isPrimary: true },
      data: { isPrimary: false },
    }),
    prisma.nodeHostingDomain.update({
      where: {
        nodeId_hostingDomainId: {
          nodeId,
          hostingDomainId,
        },
      },
      data: { isPrimary: true },
    }),
  ]);
}

// Get hosting domain summary
export async function getHostingDomainSummary(environmentId?: string) {
  const whereClause = environmentId
    ? { nodes: { some: { node: { environmentId } } } }
    : {};

  const byType = await prisma.hostingDomain.groupBy({
    by: ['hostingType'],
    where: whereClause,
    _count: { hostingType: true },
  });

  const byProvider = await prisma.hostingDomain.groupBy({
    by: ['cloudProvider'],
    where: { ...whereClause, cloudProvider: { not: null } },
    _count: { cloudProvider: true },
  });

  const byRegion = await prisma.hostingDomain.groupBy({
    by: ['region'],
    where: { ...whereClause, region: { not: null } },
    _count: { region: true },
  });

  return {
    byHostingType: Object.fromEntries(
      byType.map((t) => [t.hostingType, t._count.hostingType])
    ),
    byCloudProvider: Object.fromEntries(
      byProvider.map((p) => [p.cloudProvider!, p._count.cloudProvider])
    ),
    byRegion: Object.fromEntries(
      byRegion.map((r) => [r.region!, r._count.region])
    ),
  };
}

// Find hosting domains with nodes across multiple environments
export async function findCrossEnvironmentHostingDomains() {
  const domains = await prisma.hostingDomain.findMany({
    include: {
      nodes: {
        include: {
          node: {
            select: {
              environmentId: true,
              environment: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });

  return domains
    .map((domain) => {
      const environments = new Set(domain.nodes.map((n) => n.node.environmentId));
      return {
        ...domain,
        environmentCount: environments.size,
        environments: Array.from(environments),
      };
    })
    .filter((d) => d.environmentCount > 1);
}
