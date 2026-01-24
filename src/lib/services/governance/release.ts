// TelEnvIQ - Release Service
// Core business logic for release management

import prisma from '@/lib/db';
import { ReleaseStatus, Prisma } from '@prisma/client';

export interface ReleaseItemData {
  blueprintId?: string;
  componentId?: string;
  targetVersion: string;
  notes?: string;
}

export interface ReleaseAlignmentResult {
  releaseId: string;
  releaseName: string;
  environmentId: string;
  environmentName: string;
  aligned: boolean;
  summary: {
    totalItems: number;
    alignedItems: number;
    pendingItems: number;
    mismatchedItems: number;
  };
  items: Array<{
    componentId: string;
    componentName: string;
    targetVersion: string;
    deployedVersion: string | null;
    status: 'aligned' | 'pending' | 'mismatched';
    message: string;
  }>;
}

// Get all releases
export async function getReleases(filters?: {
  status?: ReleaseStatus;
}) {
  return prisma.release.findMany({
    where: {
      ...(filters?.status && { status: filters.status }),
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: {
          items: true,
          alignmentComparisons: true,
        },
      },
    },
  });
}

// Get release by ID with items
export async function getRelease(id: string) {
  return prisma.release.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          blueprint: true,
          component: true,
        },
      },
      alignmentComparisons: {
        take: 10,
        orderBy: { comparedAt: 'desc' },
      },
    },
  });
}

// Create a new release
export async function createRelease(data: {
  name: string;
  version: string;
  description?: string;
  targetDate?: Date;
  createdBy?: string;
  items?: ReleaseItemData[];
}) {
  return prisma.release.create({
    data: {
      name: data.name,
      version: data.version,
      description: data.description,
      targetDate: data.targetDate,
      createdBy: data.createdBy,
      status: ReleaseStatus.PLANNING,
      items: data.items
        ? {
            create: data.items.map((item) => ({
              blueprintId: item.blueprintId,
              componentId: item.componentId,
              targetVersion: item.targetVersion,
              notes: item.notes,
            })),
          }
        : undefined,
    },
    include: {
      items: {
        include: {
          blueprint: true,
          component: true,
        },
      },
    },
  });
}

// Update a release
export async function updateRelease(
  id: string,
  data: {
    name?: string;
    version?: string;
    description?: string;
    status?: ReleaseStatus;
    targetDate?: Date;
    deployedAt?: Date;
  }
) {
  return prisma.release.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.version && { version: data.version }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status && { status: data.status }),
      ...(data.targetDate !== undefined && { targetDate: data.targetDate }),
      ...(data.deployedAt !== undefined && { deployedAt: data.deployedAt }),
    },
  });
}

// Delete a release
export async function deleteRelease(id: string): Promise<void> {
  const release = await prisma.release.findUnique({
    where: { id },
    select: { status: true },
  });

  if (release?.status === ReleaseStatus.DEPLOYED) {
    throw new Error('Cannot delete deployed release');
  }

  // Delete items first
  await prisma.releaseItem.deleteMany({ where: { releaseId: id } });
  await prisma.release.delete({ where: { id } });
}

// Add item to release
export async function addReleaseItem(releaseId: string, item: ReleaseItemData) {
  return prisma.releaseItem.create({
    data: {
      releaseId,
      blueprintId: item.blueprintId,
      componentId: item.componentId,
      targetVersion: item.targetVersion,
      notes: item.notes,
    },
    include: {
      blueprint: true,
      component: true,
    },
  });
}

// Remove item from release
export async function removeReleaseItem(itemId: string): Promise<void> {
  await prisma.releaseItem.delete({ where: { id: itemId } });
}

// Update release item
export async function updateReleaseItem(
  itemId: string,
  data: { targetVersion?: string; notes?: string }
) {
  return prisma.releaseItem.update({
    where: { id: itemId },
    data: {
      ...(data.targetVersion && { targetVersion: data.targetVersion }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });
}

// Check release alignment against an environment
export async function checkReleaseAlignment(
  releaseId: string,
  environmentId: string
): Promise<ReleaseAlignmentResult> {
  const [release, environment] = await Promise.all([
    prisma.release.findUnique({
      where: { id: releaseId },
      include: {
        items: {
          include: { component: true },
        },
      },
    }),
    prisma.environment.findUnique({
      where: { id: environmentId },
      include: {
        componentInstances: {
          include: {
            component: true,
            deployedVersions: {
              orderBy: { capturedAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    }),
  ]);

  if (!release || !environment) {
    throw new Error('Release or environment not found');
  }

  // Build map of deployed versions by component
  const deployedVersionMap = new Map<string, string>();
  for (const instance of environment.componentInstances) {
    const latestVersion = instance.deployedVersions[0];
    if (latestVersion) {
      deployedVersionMap.set(instance.componentId, latestVersion.projectVersion);
    }
  }

  const items: ReleaseAlignmentResult['items'] = [];
  let alignedItems = 0;
  let pendingItems = 0;
  let mismatchedItems = 0;

  for (const item of release.items) {
    if (!item.componentId) continue;

    const deployedVersion = deployedVersionMap.get(item.componentId) ?? null;
    const componentName = item.component?.name ?? 'Unknown';

    if (!deployedVersion) {
      items.push({
        componentId: item.componentId,
        componentName,
        targetVersion: item.targetVersion,
        deployedVersion: null,
        status: 'pending',
        message: `Component ${componentName} not deployed in environment`,
      });
      pendingItems++;
    } else if (deployedVersion === item.targetVersion) {
      items.push({
        componentId: item.componentId,
        componentName,
        targetVersion: item.targetVersion,
        deployedVersion,
        status: 'aligned',
        message: 'Version matches target',
      });
      alignedItems++;
    } else {
      items.push({
        componentId: item.componentId,
        componentName,
        targetVersion: item.targetVersion,
        deployedVersion,
        status: 'mismatched',
        message: `Version mismatch: expected ${item.targetVersion}, found ${deployedVersion}`,
      });
      mismatchedItems++;
    }
  }

  const result: ReleaseAlignmentResult = {
    releaseId: release.id,
    releaseName: `${release.name} v${release.version}`,
    environmentId: environment.id,
    environmentName: environment.name,
    aligned: mismatchedItems === 0 && pendingItems === 0,
    summary: {
      totalItems: release.items.length,
      alignedItems,
      pendingItems,
      mismatchedItems,
    },
    items,
  };

  // Store comparison result
  await prisma.alignmentComparison.create({
    data: {
      comparisonType: 'SNAPSHOT_VS_RELEASE',
      environmentId,
      releaseId,
      status: result.aligned ? 'ALIGNED' : mismatchedItems > 0 ? 'DRIFTED' : 'PARTIAL',
      alignedCount: alignedItems,
      driftedCount: mismatchedItems,
      missingCount: pendingItems,
      extraCount: 0,
      detailsJson: { items: result.items } as unknown as Prisma.InputJsonValue,
    },
  });

  return result;
}

// Get releases that target a specific component
export async function getReleasesForComponent(componentId: string) {
  return prisma.release.findMany({
    where: {
      items: {
        some: { componentId },
      },
    },
    include: {
      items: {
        where: { componentId },
      },
    },
    orderBy: { targetDate: 'desc' },
  });
}

// Mark release as deployed
export async function markReleaseDeployed(id: string) {
  return prisma.release.update({
    where: { id },
    data: {
      status: ReleaseStatus.DEPLOYED,
      deployedAt: new Date(),
    },
  });
}
