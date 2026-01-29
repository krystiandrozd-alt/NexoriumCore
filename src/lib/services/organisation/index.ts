// Nexorium Core - Organisation Service
// Core business logic for people, RACI mappings, and orphaned asset detection

import prisma from '@/lib/db';
import { RACIRole, PersonStatus, AssetEntityType } from '@prisma/client';

export interface PersonData {
  email: string;
  displayName: string;
  department?: string;
  team?: string;
  role?: string;
  phone?: string;
  status?: PersonStatus;
  externalId?: string;
}

export interface RACIMappingData {
  personId: string;
  entityType: AssetEntityType;
  entityId: string;
  raciRole: RACIRole;
  notes?: string;
  assignedBy?: string;
  expiresAt?: Date;
}

export interface OrphanedAssetData {
  entityType: AssetEntityType;
  entityId: string;
  entityName: string;
  reason: string;
}

export interface RACIMatrix {
  entityType: AssetEntityType;
  entityId: string;
  entityName: string;
  responsible: string[];
  accountable: string[];
  consulted: string[];
  informed: string[];
}

// ==================== PEOPLE ====================

// Get all people
export async function getPeople(filters?: {
  status?: PersonStatus;
  department?: string;
  team?: string;
}) {
  return prisma.person.findMany({
    where: {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.department && { department: filters.department }),
      ...(filters?.team && { team: filters.team }),
    },
    orderBy: { displayName: 'asc' },
    include: {
      _count: {
        select: { raciMappings: true },
      },
    },
  });
}

// Get person by ID
export async function getPerson(id: string) {
  return prisma.person.findUnique({
    where: { id },
    include: {
      raciMappings: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

// Get person by email
export async function getPersonByEmail(email: string) {
  return prisma.person.findUnique({
    where: { email },
    include: {
      raciMappings: true,
    },
  });
}

// Create a person
export async function createPerson(data: PersonData) {
  return prisma.person.create({
    data: {
      email: data.email,
      displayName: data.displayName,
      department: data.department,
      team: data.team,
      role: data.role,
      phone: data.phone,
      status: data.status ?? PersonStatus.ACTIVE,
      externalId: data.externalId,
    },
  });
}

// Update a person
export async function updatePerson(id: string, data: Partial<PersonData>) {
  return prisma.person.update({
    where: { id },
    data: {
      ...(data.email && { email: data.email }),
      ...(data.displayName && { displayName: data.displayName }),
      ...(data.department !== undefined && { department: data.department }),
      ...(data.team !== undefined && { team: data.team }),
      ...(data.role !== undefined && { role: data.role }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.status && { status: data.status }),
      ...(data.externalId !== undefined && { externalId: data.externalId }),
    },
  });
}

// Delete a person
export async function deletePerson(id: string): Promise<void> {
  // First delete RACI mappings
  await prisma.rACIMapping.deleteMany({ where: { personId: id } });
  await prisma.person.delete({ where: { id } });
}

// ==================== RACI MAPPINGS ====================

// Get all RACI mappings
export async function getRACIMappings(filters?: {
  entityType?: AssetEntityType;
  entityId?: string;
  personId?: string;
  raciRole?: RACIRole;
}) {
  return prisma.rACIMapping.findMany({
    where: {
      ...(filters?.entityType && { entityType: filters.entityType }),
      ...(filters?.entityId && { entityId: filters.entityId }),
      ...(filters?.personId && { personId: filters.personId }),
      ...(filters?.raciRole && { raciRole: filters.raciRole }),
    },
    include: {
      person: {
        select: {
          id: true,
          email: true,
          displayName: true,
          department: true,
          team: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Get RACI mapping by ID
export async function getRACIMapping(id: string) {
  return prisma.rACIMapping.findUnique({
    where: { id },
    include: {
      person: true,
    },
  });
}

// Create a RACI mapping
export async function createRACIMapping(data: RACIMappingData) {
  // Check if person exists
  const person = await prisma.person.findUnique({
    where: { id: data.personId },
  });

  if (!person) {
    throw new Error('Person not found');
  }

  // Check for duplicate
  const existing = await prisma.rACIMapping.findFirst({
    where: {
      personId: data.personId,
      entityType: data.entityType,
      entityId: data.entityId,
      raciRole: data.raciRole,
    },
  });

  if (existing) {
    throw new Error('RACI mapping already exists');
  }

  return prisma.rACIMapping.create({
    data: {
      personId: data.personId,
      entityType: data.entityType,
      entityId: data.entityId,
      raciRole: data.raciRole,
      notes: data.notes,
      assignedBy: data.assignedBy,
      expiresAt: data.expiresAt,
    },
    include: {
      person: true,
    },
  });
}

// Update a RACI mapping
export async function updateRACIMapping(
  id: string,
  data: { notes?: string; expiresAt?: Date | null }
) {
  return prisma.rACIMapping.update({
    where: { id },
    data: {
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.expiresAt !== undefined && { expiresAt: data.expiresAt }),
    },
    include: {
      person: true,
    },
  });
}

// Delete a RACI mapping
export async function deleteRACIMapping(id: string): Promise<void> {
  await prisma.rACIMapping.delete({ where: { id } });
}

// Get RACI matrix for an entity
export async function getRACIMatrixForEntity(
  entityType: AssetEntityType,
  entityId: string
): Promise<RACIMatrix> {
  const mappings = await prisma.rACIMapping.findMany({
    where: { entityType, entityId },
    include: {
      person: {
        select: { displayName: true },
      },
    },
  });

  // Get entity name
  let entityName = 'Unknown';
  if (entityType === AssetEntityType.ENVIRONMENT) {
    const env = await prisma.environment.findUnique({
      where: { id: entityId },
      select: { name: true },
    });
    entityName = env?.name ?? entityName;
  } else if (entityType === AssetEntityType.COMPONENT) {
    const comp = await prisma.component.findUnique({
      where: { id: entityId },
      select: { name: true },
    });
    entityName = comp?.name ?? entityName;
  }

  const matrix: RACIMatrix = {
    entityType,
    entityId,
    entityName,
    responsible: [],
    accountable: [],
    consulted: [],
    informed: [],
  };

  for (const mapping of mappings) {
    const name = mapping.person.displayName;
    switch (mapping.raciRole) {
      case RACIRole.RESPONSIBLE:
        matrix.responsible.push(name);
        break;
      case RACIRole.ACCOUNTABLE:
        matrix.accountable.push(name);
        break;
      case RACIRole.CONSULTED:
        matrix.consulted.push(name);
        break;
      case RACIRole.INFORMED:
        matrix.informed.push(name);
        break;
    }
  }

  return matrix;
}

// ==================== ORPHANED ASSETS ====================

// Detect orphaned assets (assets without RACI mappings)
export async function detectOrphanedAssets(): Promise<OrphanedAssetData[]> {
  const orphans: OrphanedAssetData[] = [];

  // Find environments without RACI mappings
  const environments = await prisma.environment.findMany({
    select: { id: true, name: true },
  });

  for (const env of environments) {
    const mappings = await prisma.rACIMapping.findMany({
      where: {
        entityType: AssetEntityType.ENVIRONMENT,
        entityId: env.id,
      },
    });

    if (mappings.length === 0) {
      orphans.push({
        entityType: AssetEntityType.ENVIRONMENT,
        entityId: env.id,
        entityName: env.name,
        reason: 'No RACI assignments',
      });
    } else if (!mappings.some((m) => m.raciRole === RACIRole.ACCOUNTABLE)) {
      orphans.push({
        entityType: AssetEntityType.ENVIRONMENT,
        entityId: env.id,
        entityName: env.name,
        reason: 'No Accountable person assigned',
      });
    }
  }

  // Find components without RACI mappings
  const components = await prisma.component.findMany({
    select: { id: true, name: true },
  });

  for (const comp of components) {
    const mappings = await prisma.rACIMapping.findMany({
      where: {
        entityType: AssetEntityType.COMPONENT,
        entityId: comp.id,
      },
    });

    if (mappings.length === 0) {
      orphans.push({
        entityType: AssetEntityType.COMPONENT,
        entityId: comp.id,
        entityName: comp.name,
        reason: 'No RACI assignments',
      });
    }
  }

  return orphans.sort((a, b) => {
    if (a.entityType !== b.entityType) {
      return a.entityType.localeCompare(b.entityType);
    }
    return a.entityName.localeCompare(b.entityName);
  });
}

// Record an orphaned asset for tracking
export async function recordOrphanedAsset(data: OrphanedAssetData) {
  return prisma.orphanedAsset.upsert({
    where: {
      entityType_entityId: {
        entityType: data.entityType,
        entityId: data.entityId,
      },
    },
    create: {
      entityType: data.entityType,
      entityId: data.entityId,
      entityName: data.entityName,
    },
    update: {
      entityName: data.entityName,
    },
  });
}

// Resolve an orphaned asset
export async function resolveOrphanedAsset(
  entityType: AssetEntityType,
  entityId: string,
  resolvedBy: string,
  notes?: string
) {
  return prisma.orphanedAsset.update({
    where: {
      entityType_entityId: { entityType, entityId },
    },
    data: {
      resolvedAt: new Date(),
      resolvedBy,
      notes,
    },
  });
}

// Get all recorded orphaned assets
export async function getRecordedOrphanedAssets(includeResolved: boolean = false) {
  return prisma.orphanedAsset.findMany({
    where: includeResolved ? {} : { resolvedAt: null },
    orderBy: { detectedAt: 'desc' },
  });
}

// ==================== OWNERSHIP VIEWS ====================

// Get ownership summary for all environments
export async function getEnvironmentOwnershipSummary() {
  const environments = await prisma.environment.findMany({
    select: { id: true, name: true, type: true },
  });

  const results = [];

  for (const env of environments) {
    const mappings = await prisma.rACIMapping.findMany({
      where: {
        entityType: AssetEntityType.ENVIRONMENT,
        entityId: env.id,
      },
      include: {
        person: {
          select: { displayName: true, email: true },
        },
      },
    });

    const accountable = mappings.find((m) => m.raciRole === RACIRole.ACCOUNTABLE);
    const responsible = mappings.filter((m) => m.raciRole === RACIRole.RESPONSIBLE);

    results.push({
      environmentId: env.id,
      environmentName: env.name,
      environmentType: env.type,
      accountablePerson: accountable?.person.displayName ?? null,
      accountableEmail: accountable?.person.email ?? null,
      responsibleCount: responsible.length,
      totalMappings: mappings.length,
      hasAccountable: !!accountable,
    });
  }

  return results;
}

// Get people by RACI role for an entity
export async function getPeopleByRole(
  entityType: AssetEntityType,
  entityId: string,
  role: RACIRole
) {
  return prisma.rACIMapping.findMany({
    where: {
      entityType,
      entityId,
      raciRole: role,
    },
    include: {
      person: true,
    },
  });
}
