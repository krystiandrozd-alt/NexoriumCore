// TelEnvIQ - Blueprint Service
// Core business logic for blueprint management and comparison

import prisma from '@/lib/db';
import { BlueprintStatus, Prisma } from '@prisma/client';

export interface BlueprintSpec {
  components: Array<{
    componentId: string;
    componentName: string;
    requiredVersion?: string;
    versionPattern?: string;
    isRequired: boolean;
  }>;
  connections: Array<{
    fromComponentId: string;
    toComponentId: string;
    protocolType: string;
    isRequired: boolean;
  }>;
  rules: Array<{
    name: string;
    condition: string;
    severity: string;
  }>;
}

export interface BlueprintDiffResult {
  aligned: boolean;
  summary: {
    alignedCount: number;
    driftedCount: number;
    missingCount: number;
    extraCount: number;
  };
  componentDiffs: Array<{
    componentId: string;
    componentName: string;
    status: 'aligned' | 'drifted' | 'missing' | 'extra';
    expectedVersion?: string;
    actualVersion?: string;
    message: string;
  }>;
  connectionDiffs: Array<{
    fromComponent: string;
    toComponent: string;
    status: 'aligned' | 'missing' | 'extra';
    message: string;
  }>;
}

// Get all blueprints
export async function getBlueprints(filters?: {
  status?: BlueprintStatus;
  targetStageId?: string;
}) {
  return prisma.blueprint.findMany({
    where: {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.targetStageId && { targetStageId: filters.targetStageId }),
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: {
          alignmentComparisons: true,
          releaseItems: true,
        },
      },
    },
  });
}

// Get blueprint by ID
export async function getBlueprint(id: string) {
  return prisma.blueprint.findUnique({
    where: { id },
    include: {
      alignmentComparisons: {
        take: 10,
        orderBy: { comparedAt: 'desc' },
      },
      releaseItems: {
        include: {
          release: true,
          component: true,
        },
      },
    },
  });
}

// Create a new blueprint
export async function createBlueprint(data: {
  name: string;
  description?: string;
  targetStageId?: string;
  specJson: BlueprintSpec;
  createdBy?: string;
}) {
  return prisma.blueprint.create({
    data: {
      name: data.name,
      description: data.description,
      targetStageId: data.targetStageId,
      specJson: data.specJson as unknown as Prisma.InputJsonValue,
      createdBy: data.createdBy,
      status: BlueprintStatus.DRAFT,
    },
  });
}

// Update a blueprint
export async function updateBlueprint(
  id: string,
  data: {
    name?: string;
    description?: string;
    status?: BlueprintStatus;
    specJson?: BlueprintSpec;
    approvedBy?: string;
  }
) {
  const updateData: Prisma.BlueprintUpdateInput = {
    ...(data.name && { name: data.name }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.status && { status: data.status }),
    ...(data.approvedBy && { approvedBy: data.approvedBy }),
  };

  if (data.specJson) {
    updateData.specJson = data.specJson as unknown as Prisma.InputJsonValue;
  }

  // If approving, set approval timestamp and deprecate other approved blueprints for same stage
  if (data.status === BlueprintStatus.APPROVED) {
    updateData.approvedAt = new Date();

    const blueprint = await prisma.blueprint.findUnique({
      where: { id },
      select: { targetStageId: true },
    });

    if (blueprint?.targetStageId) {
      await prisma.blueprint.updateMany({
        where: {
          targetStageId: blueprint.targetStageId,
          status: BlueprintStatus.APPROVED,
          id: { not: id },
        },
        data: { status: BlueprintStatus.DEPRECATED },
      });
    }
  }

  return prisma.blueprint.update({
    where: { id },
    data: updateData,
  });
}

// Delete a blueprint
export async function deleteBlueprint(id: string): Promise<void> {
  const blueprint = await prisma.blueprint.findUnique({
    where: { id },
    select: { status: true },
  });

  if (blueprint?.status === BlueprintStatus.APPROVED) {
    throw new Error('Cannot delete approved blueprint. Deprecate it first.');
  }

  await prisma.blueprint.delete({ where: { id } });
}

// Compare blueprint against environment snapshot
export async function compareBlueprintToSnapshot(
  blueprintId: string,
  snapshotId: string
): Promise<BlueprintDiffResult> {
  const [blueprint, snapshot] = await Promise.all([
    prisma.blueprint.findUnique({ where: { id: blueprintId } }),
    prisma.environmentSnapshot.findUnique({ where: { id: snapshotId } }),
  ]);

  if (!blueprint || !snapshot) {
    throw new Error('Blueprint or snapshot not found');
  }

  const spec = blueprint.specJson as unknown as BlueprintSpec;
  const snapshotData = snapshot.snapshotData as {
    components?: Array<{ id: string; name: string; version?: string }>;
    connections?: Array<{ fromId: string; toId: string; protocol: string }>;
  };

  const componentDiffs: BlueprintDiffResult['componentDiffs'] = [];
  const connectionDiffs: BlueprintDiffResult['connectionDiffs'] = [];

  let alignedCount = 0;
  let driftedCount = 0;
  let missingCount = 0;
  let extraCount = 0;

  // Check expected components
  const snapshotComponentMap = new Map(
    (snapshotData.components ?? []).map((c) => [c.id, c])
  );

  for (const expected of spec.components) {
    const actual = snapshotComponentMap.get(expected.componentId);

    if (!actual) {
      componentDiffs.push({
        componentId: expected.componentId,
        componentName: expected.componentName,
        status: 'missing',
        expectedVersion: expected.requiredVersion,
        message: `Component ${expected.componentName} is missing from snapshot`,
      });
      missingCount++;
    } else if (expected.requiredVersion && actual.version !== expected.requiredVersion) {
      componentDiffs.push({
        componentId: expected.componentId,
        componentName: expected.componentName,
        status: 'drifted',
        expectedVersion: expected.requiredVersion,
        actualVersion: actual.version,
        message: `Version drift: expected ${expected.requiredVersion}, found ${actual.version}`,
      });
      driftedCount++;
    } else {
      componentDiffs.push({
        componentId: expected.componentId,
        componentName: expected.componentName,
        status: 'aligned',
        expectedVersion: expected.requiredVersion,
        actualVersion: actual.version,
        message: 'Component is aligned',
      });
      alignedCount++;
    }

    snapshotComponentMap.delete(expected.componentId);
  }

  // Check for extra components not in blueprint
  for (const [id, comp] of Array.from(snapshotComponentMap.entries())) {
    componentDiffs.push({
      componentId: id,
      componentName: comp.name,
      status: 'extra',
      actualVersion: comp.version,
      message: `Component ${comp.name} exists but is not in blueprint`,
    });
    extraCount++;
  }

  // Check connections
  const snapshotConnectionSet = new Set(
    (snapshotData.connections ?? []).map(
      (c) => `${c.fromId}:${c.toId}:${c.protocol}`
    )
  );

  for (const expected of spec.connections) {
    const key = `${expected.fromComponentId}:${expected.toComponentId}:${expected.protocolType}`;
    if (snapshotConnectionSet.has(key)) {
      connectionDiffs.push({
        fromComponent: expected.fromComponentId,
        toComponent: expected.toComponentId,
        status: 'aligned',
        message: 'Connection exists',
      });
      snapshotConnectionSet.delete(key);
    } else if (expected.isRequired) {
      connectionDiffs.push({
        fromComponent: expected.fromComponentId,
        toComponent: expected.toComponentId,
        status: 'missing',
        message: 'Required connection is missing',
      });
    }
  }

  // Store comparison result
  await prisma.alignmentComparison.create({
    data: {
      comparisonType: 'BLUEPRINT_VS_SNAPSHOT',
      blueprintId,
      snapshotId,
      status: driftedCount > 0 || missingCount > 0 ? 'DRIFTED' : 'ALIGNED',
      alignedCount,
      driftedCount,
      missingCount,
      extraCount,
      detailsJson: { componentDiffs, connectionDiffs } as unknown as Prisma.InputJsonValue,
    },
  });

  return {
    aligned: driftedCount === 0 && missingCount === 0,
    summary: { alignedCount, driftedCount, missingCount, extraCount },
    componentDiffs,
    connectionDiffs,
  };
}

// Get the current approved blueprint for a stage
export async function getApprovedBlueprintForStage(stageId: string) {
  return prisma.blueprint.findFirst({
    where: {
      targetStageId: stageId,
      status: BlueprintStatus.APPROVED,
    },
    orderBy: { approvedAt: 'desc' },
  });
}
