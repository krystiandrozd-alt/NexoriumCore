// Nexorium Core - Project Service
// Core business logic for project management

import prisma from '@/lib/db';

export interface ProjectWithEnvironments {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  status: string;
  ownerTeam: string | null;
  ownerEmail: string | null;
  businessUnit: string | null;
  costCenter: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  environments: Array<{
    id: string;
    name: string;
    type: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    stageId: string | null;
    stage: {
      id: string;
      key: string;
      name: string;
      color: string | null;
    } | null;
    _count: {
      nodes: number;
      edges: number;
    };
  }>;
  _count: {
    environments: number;
  };
}

// Get all projects with their environments
export async function getProjects(): Promise<ProjectWithEnvironments[]> {
  return prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      environments: {
        orderBy: { name: 'asc' },
        include: {
          stage: true,
          _count: {
            select: {
              nodes: true,
              edges: true,
            },
          },
        },
      },
      _count: {
        select: {
          environments: true,
        },
      },
    },
  });
}

// Get single project with environments
export async function getProject(id: string): Promise<ProjectWithEnvironments | null> {
  return prisma.project.findUnique({
    where: { id },
    include: {
      environments: {
        orderBy: { name: 'asc' },
        include: {
          stage: true,
          _count: {
            select: {
              nodes: true,
              edges: true,
            },
          },
        },
      },
      _count: {
        select: {
          environments: true,
        },
      },
    },
  });
}

// Create new project
export async function createProject(data: {
  name: string;
  code?: string;
  description?: string;
  ownerTeam?: string;
  ownerEmail?: string;
  businessUnit?: string;
  costCenter?: string;
  createdBy?: string;
}) {
  return prisma.project.create({
    data: {
      name: data.name,
      code: data.code,
      description: data.description,
      ownerTeam: data.ownerTeam,
      ownerEmail: data.ownerEmail,
      businessUnit: data.businessUnit,
      costCenter: data.costCenter,
      createdBy: data.createdBy,
    },
    include: {
      environments: {
        include: {
          stage: true,
          _count: {
            select: {
              nodes: true,
              edges: true,
            },
          },
        },
      },
      _count: {
        select: {
          environments: true,
        },
      },
    },
  });
}

// Update project
export async function updateProject(
  id: string,
  data: Partial<{
    name: string;
    code: string;
    description: string;
    status: 'ACTIVE' | 'ARCHIVED' | 'PLANNING';
    ownerTeam: string;
    ownerEmail: string;
    businessUnit: string;
    costCenter: string;
  }>
) {
  return prisma.project.update({
    where: { id },
    data,
    include: {
      environments: {
        include: {
          stage: true,
          _count: {
            select: {
              nodes: true,
              edges: true,
            },
          },
        },
      },
      _count: {
        select: {
          environments: true,
        },
      },
    },
  });
}

// Delete project (only if no environments)
export async function deleteProject(id: string): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      _count: {
        select: { environments: true },
      },
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  if (project._count.environments > 0) {
    throw new Error('Cannot delete project with existing environments');
  }

  await prisma.project.delete({
    where: { id },
  });
}
