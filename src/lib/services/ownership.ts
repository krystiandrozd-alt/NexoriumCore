// Nexorium Core - Environment Ownership Service
// Project and ownership tracking for environments

import prisma from '@/lib/db';
import type { EnvironmentOwnership } from '@/types';
import { createAuditLog } from './governance/audit';

// Create or update environment ownership
export async function upsertEnvironmentOwnership(
  environmentId: string,
  data: {
    projectName: string;
    projectCode?: string;
    ownerTeam: string;
    ownerEmail?: string;
    technicalLead?: string;
    technicalLeadEmail?: string;
    businessUnit?: string;
    costCenter?: string;
    expiryDate?: Date;
  },
  updatedBy?: string
): Promise<EnvironmentOwnership> {
  const existing = await prisma.environmentOwnership.findUnique({
    where: { environmentId },
  });

  const ownership = await prisma.environmentOwnership.upsert({
    where: { environmentId },
    create: {
      environmentId,
      ...data,
    },
    update: data,
    include: {
      environment: {
        select: { id: true, name: true, type: true },
      },
    },
  });

  // Log the change
  await createAuditLog({
    environmentId,
    action: 'OWNERSHIP_CHANGED',
    actorName: updatedBy,
    targetType: 'ENVIRONMENT',
    targetId: environmentId,
    details: {
      action: existing ? 'UPDATED' : 'CREATED',
      previousOwnership: existing
        ? {
            projectName: existing.projectName,
            ownerTeam: existing.ownerTeam,
          }
        : null,
      newOwnership: {
        projectName: data.projectName,
        ownerTeam: data.ownerTeam,
      },
    },
  });

  return ownership as EnvironmentOwnership;
}

// Get environment ownership
export async function getEnvironmentOwnership(environmentId: string): Promise<EnvironmentOwnership | null> {
  return prisma.environmentOwnership.findUnique({
    where: { environmentId },
    include: {
      environment: {
        select: { id: true, name: true, type: true },
      },
    },
  }) as Promise<EnvironmentOwnership | null>;
}

// Delete environment ownership
export async function deleteEnvironmentOwnership(environmentId: string): Promise<void> {
  await prisma.environmentOwnership.delete({
    where: { environmentId },
  });
}

// List environments by ownership
export async function listEnvironmentsByOwnership(options: {
  projectName?: string;
  ownerTeam?: string;
  businessUnit?: string;
  technicalLead?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const { projectName, ownerTeam, businessUnit, technicalLead, limit = 50, offset = 0 } = options;

  const where: Record<string, unknown> = {};
  if (projectName) where.projectName = { contains: projectName, mode: 'insensitive' };
  if (ownerTeam) where.ownerTeam = { contains: ownerTeam, mode: 'insensitive' };
  if (businessUnit) where.businessUnit = businessUnit;
  if (technicalLead) where.technicalLead = { contains: technicalLead, mode: 'insensitive' };

  const [ownerships, total] = await Promise.all([
    prisma.environmentOwnership.findMany({
      where,
      include: {
        environment: {
          include: {
            _count: {
              select: { nodes: true, edges: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.environmentOwnership.count({ where }),
  ]);

  return {
    items: ownerships,
    total,
    hasMore: offset + ownerships.length < total,
  };
}

// Get environments for a specific project
export async function getProjectEnvironments(projectName: string) {
  return prisma.environmentOwnership.findMany({
    where: { projectName },
    include: {
      environment: {
        include: {
          _count: {
            select: { nodes: true, edges: true },
          },
        },
      },
    },
  });
}

// Get environments for a specific team
export async function getTeamEnvironments(ownerTeam: string) {
  return prisma.environmentOwnership.findMany({
    where: { ownerTeam },
    include: {
      environment: {
        include: {
          _count: {
            select: { nodes: true, edges: true },
          },
        },
      },
    },
  });
}

// Get expiring environments
export async function getExpiringEnvironments(withinDays: number = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + withinDays);

  return prisma.environmentOwnership.findMany({
    where: {
      expiryDate: {
        lte: futureDate,
        gte: new Date(),
      },
    },
    include: {
      environment: {
        select: { id: true, name: true, type: true },
      },
    },
    orderBy: { expiryDate: 'asc' },
  });
}

// Get expired environments
export async function getExpiredEnvironments() {
  return prisma.environmentOwnership.findMany({
    where: {
      expiryDate: {
        lt: new Date(),
      },
    },
    include: {
      environment: {
        select: { id: true, name: true, type: true },
      },
    },
    orderBy: { expiryDate: 'asc' },
  });
}

// Get ownership summary
export async function getOwnershipSummary() {
  const [byProject, byTeam, byBusinessUnit, expiringCount] = await Promise.all([
    prisma.environmentOwnership.groupBy({
      by: ['projectName'],
      _count: { projectName: true },
    }),
    prisma.environmentOwnership.groupBy({
      by: ['ownerTeam'],
      _count: { ownerTeam: true },
    }),
    prisma.environmentOwnership.groupBy({
      by: ['businessUnit'],
      where: { businessUnit: { not: null } },
      _count: { businessUnit: true },
    }),
    prisma.environmentOwnership.count({
      where: {
        expiryDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          gte: new Date(),
        },
      },
    }),
  ]);

  return {
    byProject: Object.fromEntries(byProject.map((p) => [p.projectName, p._count.projectName])),
    byTeam: Object.fromEntries(byTeam.map((t) => [t.ownerTeam, t._count.ownerTeam])),
    byBusinessUnit: Object.fromEntries(
      byBusinessUnit.map((b) => [b.businessUnit!, b._count.businessUnit])
    ),
    expiringWithin30Days: expiringCount,
  };
}

// Get unique projects
export async function getUniqueProjects(): Promise<string[]> {
  const projects = await prisma.environmentOwnership.findMany({
    select: { projectName: true },
    distinct: ['projectName'],
    orderBy: { projectName: 'asc' },
  });
  return projects.map((p) => p.projectName);
}

// Get unique teams
export async function getUniqueTeams(): Promise<string[]> {
  const teams = await prisma.environmentOwnership.findMany({
    select: { ownerTeam: true },
    distinct: ['ownerTeam'],
    orderBy: { ownerTeam: 'asc' },
  });
  return teams.map((t) => t.ownerTeam);
}
