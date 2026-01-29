// Nexorium Core - Enrichment Service
// Versioned manual enrichment management with rollback support

import prisma from '@/lib/db';
import type { EnrichmentEdit, EnrichmentStatus } from '@/types';
import { createAuditLog } from './audit';

// Create a new enrichment (manual edit with versioning)
export async function createEnrichment(data: {
  nodeId: string;
  fieldName: string;
  newValue: unknown;
  reason?: string;
  editedBy: string;
}): Promise<EnrichmentEdit> {
  const node = await prisma.node.findUnique({
    where: { id: data.nodeId },
    select: {
      id: true,
      environmentId: true,
      name: true,
      telcoLayer: true,
      telcoSubsystem: true,
      owner: true,
      criticality: true,
      metadata: true,
    },
  });

  if (!node) {
    throw new Error(`Node with id ${data.nodeId} not found`);
  }

  // Get the current value for the field
  const previousValue = (node as Record<string, unknown>)[data.fieldName];

  // Mark any existing active enrichment for this field as superseded
  const existingActive = await prisma.enrichmentEdit.findFirst({
    where: {
      nodeId: data.nodeId,
      fieldName: data.fieldName,
      status: 'ACTIVE',
    },
  });

  // Create the new enrichment in a transaction
  const enrichment = await prisma.$transaction(async (tx) => {
    // Create the new enrichment
    const newEnrichment = await tx.enrichmentEdit.create({
      data: {
        nodeId: data.nodeId,
        fieldName: data.fieldName,
        previousValue: previousValue as object ?? null,
        newValue: data.newValue as object,
        reason: data.reason,
        editedBy: data.editedBy,
        status: 'ACTIVE',
      },
    });

    // Mark the existing one as superseded
    if (existingActive) {
      await tx.enrichmentEdit.update({
        where: { id: existingActive.id },
        data: {
          status: 'SUPERSEDED',
          supersededById: newEnrichment.id,
        },
      });
    }

    // Apply the enrichment to the node
    await tx.node.update({
      where: { id: data.nodeId },
      data: { [data.fieldName]: data.newValue },
    });

    return newEnrichment;
  });

  // Log the enrichment
  await createAuditLog({
    environmentId: node.environmentId,
    action: 'ENRICHMENT_ADDED',
    actorName: data.editedBy,
    targetType: 'NODE',
    targetId: node.id,
    targetName: node.name,
    details: {
      fieldName: data.fieldName,
      previousValue,
      newValue: data.newValue,
      reason: data.reason,
    },
  });

  return enrichment as EnrichmentEdit;
}

// Revert an enrichment to the previous value
export async function revertEnrichment(
  enrichmentId: string,
  revertedBy: string
): Promise<EnrichmentEdit> {
  const enrichment = await prisma.enrichmentEdit.findUnique({
    where: { id: enrichmentId },
    include: { node: true },
  });

  if (!enrichment) {
    throw new Error(`Enrichment with id ${enrichmentId} not found`);
  }

  if (enrichment.status !== 'ACTIVE') {
    throw new Error('Can only revert active enrichments');
  }

  // Revert in a transaction
  const revertedEnrichment = await prisma.$transaction(async (tx) => {
    // Update enrichment status
    const updated = await tx.enrichmentEdit.update({
      where: { id: enrichmentId },
      data: { status: 'REVERTED' },
    });

    // Restore the previous value on the node
    await tx.node.update({
      where: { id: enrichment.nodeId },
      data: { [enrichment.fieldName]: enrichment.previousValue },
    });

    return updated;
  });

  // Log the revert
  await createAuditLog({
    environmentId: enrichment.node.environmentId,
    action: 'ENRICHMENT_REVERTED',
    actorName: revertedBy,
    targetType: 'NODE',
    targetId: enrichment.nodeId,
    targetName: enrichment.node.name,
    details: {
      enrichmentId,
      fieldName: enrichment.fieldName,
      revertedValue: enrichment.newValue,
      restoredValue: enrichment.previousValue,
    },
  });

  return revertedEnrichment as EnrichmentEdit;
}

// Get enrichment history for a node
export async function getNodeEnrichments(
  nodeId: string,
  options: {
    fieldName?: string;
    status?: EnrichmentStatus;
    limit?: number;
    offset?: number;
  } = {}
) {
  const { fieldName, status, limit = 50, offset = 0 } = options;

  const where: Record<string, unknown> = { nodeId };
  if (fieldName) where.fieldName = fieldName;
  if (status) where.status = status;

  const [enrichments, total] = await Promise.all([
    prisma.enrichmentEdit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.enrichmentEdit.count({ where }),
  ]);

  return {
    items: enrichments,
    total,
    hasMore: offset + enrichments.length < total,
  };
}

// Get a single enrichment by ID
export async function getEnrichment(id: string): Promise<EnrichmentEdit | null> {
  return prisma.enrichmentEdit.findUnique({
    where: { id },
    include: { node: true },
  }) as Promise<EnrichmentEdit | null>;
}

// Search enrichments across environment
export async function searchEnrichments(options: {
  environmentId?: string;
  fieldName?: string;
  editedBy?: string;
  status?: EnrichmentStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const {
    environmentId,
    fieldName,
    editedBy,
    status,
    startDate,
    endDate,
    limit = 50,
    offset = 0,
  } = options;

  const where: Record<string, unknown> = {};

  if (environmentId) {
    where.node = { environmentId };
  }
  if (fieldName) where.fieldName = fieldName;
  if (editedBy) where.editedBy = editedBy;
  if (status) where.status = status;
  if (startDate || endDate) {
    where.createdAt = {
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate }),
    };
  }

  const [enrichments, total] = await Promise.all([
    prisma.enrichmentEdit.findMany({
      where,
      include: {
        node: {
          select: {
            id: true,
            name: true,
            environmentId: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.enrichmentEdit.count({ where }),
  ]);

  return {
    items: enrichments,
    total,
    hasMore: offset + enrichments.length < total,
  };
}

// Check if a node has active enrichments (used to protect from auto-discovery overwrite)
export async function hasActiveEnrichments(nodeId: string): Promise<boolean> {
  const count = await prisma.enrichmentEdit.count({
    where: {
      nodeId,
      status: 'ACTIVE',
    },
  });
  return count > 0;
}

// Get list of enriched fields for a node
export async function getEnrichedFields(nodeId: string): Promise<string[]> {
  const enrichments = await prisma.enrichmentEdit.findMany({
    where: {
      nodeId,
      status: 'ACTIVE',
    },
    select: { fieldName: true },
    distinct: ['fieldName'],
  });

  return enrichments.map((e) => e.fieldName);
}
