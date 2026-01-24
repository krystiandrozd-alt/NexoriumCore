// TelEnvIQ - Flow Map Service
// Core business logic for flow map computation and stage management

import prisma from '@/lib/db';
import { StageKey, EnvironmentLinkType } from '@prisma/client';

export interface FlowMapNode {
  id: string;
  name: string;
  type: string;
  stageKey: StageKey | null;
  stageName: string | null;
  nodeCount: number;
  edgeCount: number;
}

export interface FlowMapEdge {
  id: string;
  sourceId: string;
  targetId: string;
  linkType: EnvironmentLinkType;
  isActive: boolean;
}

export interface FlowMapData {
  nodes: FlowMapNode[];
  edges: FlowMapEdge[];
  stages: Array<{
    id: string;
    key: StageKey;
    name: string;
    color: string | null;
    sortOrder: number;
    environmentCount: number;
  }>;
}

// Get complete flow map data
export async function getFlowMap(): Promise<FlowMapData> {
  const [environments, links, stages] = await Promise.all([
    prisma.environment.findMany({
      include: {
        stage: true,
        _count: {
          select: {
            nodes: true,
            edges: true,
          },
        },
      },
    }),
    prisma.environmentLink.findMany({
      where: { isActive: true },
    }),
    prisma.stage.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { environments: true },
        },
      },
    }),
  ]);

  const nodes: FlowMapNode[] = environments.map((env) => ({
    id: env.id,
    name: env.name,
    type: env.type,
    stageKey: env.stage?.key ?? null,
    stageName: env.stage?.name ?? null,
    nodeCount: env._count.nodes,
    edgeCount: env._count.edges,
  }));

  const edges: FlowMapEdge[] = links.map((link) => ({
    id: link.id,
    sourceId: link.upstreamEnvironmentId,
    targetId: link.downstreamEnvironmentId,
    linkType: link.linkType,
    isActive: link.isActive,
  }));

  const stagesData = stages.map((s) => ({
    id: s.id,
    key: s.key,
    name: s.name,
    color: s.color,
    sortOrder: s.sortOrder,
    environmentCount: s._count.environments,
  }));

  return { nodes, edges, stages: stagesData };
}

// Get environments grouped by stage
export async function getEnvironmentsByStage(): Promise<Map<StageKey, FlowMapNode[]>> {
  const environments = await prisma.environment.findMany({
    include: {
      stage: true,
      _count: {
        select: {
          nodes: true,
          edges: true,
        },
      },
    },
  });

  const grouped = new Map<StageKey, FlowMapNode[]>();

  for (const env of environments) {
    const stageKey = env.stage?.key;
    if (!stageKey) continue;

    const node: FlowMapNode = {
      id: env.id,
      name: env.name,
      type: env.type,
      stageKey: stageKey,
      stageName: env.stage?.name ?? null,
      nodeCount: env._count.nodes,
      edgeCount: env._count.edges,
    };

    const existing = grouped.get(stageKey) ?? [];
    existing.push(node);
    grouped.set(stageKey, existing);
  }

  return grouped;
}

// Get upstream environments for a given environment
export async function getUpstreamEnvironments(environmentId: string): Promise<FlowMapNode[]> {
  const links = await prisma.environmentLink.findMany({
    where: {
      downstreamEnvironmentId: environmentId,
      isActive: true,
    },
    include: {
      upstreamEnvironment: {
        include: {
          stage: true,
          _count: {
            select: { nodes: true, edges: true },
          },
        },
      },
    },
  });

  return links.map((link) => ({
    id: link.upstreamEnvironment.id,
    name: link.upstreamEnvironment.name,
    type: link.upstreamEnvironment.type,
    stageKey: link.upstreamEnvironment.stage?.key ?? null,
    stageName: link.upstreamEnvironment.stage?.name ?? null,
    nodeCount: link.upstreamEnvironment._count.nodes,
    edgeCount: link.upstreamEnvironment._count.edges,
  }));
}

// Get downstream environments for a given environment
export async function getDownstreamEnvironments(environmentId: string): Promise<FlowMapNode[]> {
  const links = await prisma.environmentLink.findMany({
    where: {
      upstreamEnvironmentId: environmentId,
      isActive: true,
    },
    include: {
      downstreamEnvironment: {
        include: {
          stage: true,
          _count: {
            select: { nodes: true, edges: true },
          },
        },
      },
    },
  });

  return links.map((link) => ({
    id: link.downstreamEnvironment.id,
    name: link.downstreamEnvironment.name,
    type: link.downstreamEnvironment.type,
    stageKey: link.downstreamEnvironment.stage?.key ?? null,
    stageName: link.downstreamEnvironment.stage?.name ?? null,
    nodeCount: link.downstreamEnvironment._count.nodes,
    edgeCount: link.downstreamEnvironment._count.edges,
  }));
}

// Validate if a link between two environments is allowed by flow templates
export async function validateFlowLink(
  upstreamEnvironmentId: string,
  downstreamEnvironmentId: string
): Promise<{ isValid: boolean; message: string }> {
  const [upstream, downstream] = await Promise.all([
    prisma.environment.findUnique({
      where: { id: upstreamEnvironmentId },
      include: { stage: true },
    }),
    prisma.environment.findUnique({
      where: { id: downstreamEnvironmentId },
      include: { stage: true },
    }),
  ]);

  if (!upstream || !downstream) {
    return { isValid: false, message: 'One or both environments not found' };
  }

  if (!upstream.stage || !downstream.stage) {
    return { isValid: true, message: 'Environments without stages can be linked freely' };
  }

  // Check if downstream stage comes after upstream stage in any active template
  const templates = await prisma.flowTemplate.findMany({
    where: { status: 'ACTIVE' },
    include: {
      stages: {
        orderBy: { sortOrder: 'asc' },
        include: { stage: true },
      },
    },
  });

  for (const template of templates) {
    const upstreamIndex = template.stages.findIndex(
      (s) => s.stage.key === upstream.stage?.key
    );
    const downstreamIndex = template.stages.findIndex(
      (s) => s.stage.key === downstream.stage?.key
    );

    if (upstreamIndex !== -1 && downstreamIndex !== -1) {
      if (downstreamIndex > upstreamIndex) {
        return { isValid: true, message: `Valid per template: ${template.name}` };
      }
    }
  }

  // If no template validates it, check if stages have logical ordering
  if (upstream.stage.sortOrder < downstream.stage.sortOrder) {
    return { isValid: true, message: 'Valid based on stage order' };
  }

  return {
    isValid: false,
    message: `Cannot link ${upstream.stage.name} to ${downstream.stage.name} - invalid flow direction`,
  };
}

// Get the promotion path for an environment
export async function getPromotionPath(
  environmentId: string
): Promise<FlowMapNode[]> {
  const path: FlowMapNode[] = [];
  const visited = new Set<string>();

  let currentId = environmentId;

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);

    const downstream = await prisma.environmentLink.findFirst({
      where: {
        upstreamEnvironmentId: currentId,
        isActive: true,
        linkType: EnvironmentLinkType.PROMOTION,
      },
      include: {
        downstreamEnvironment: {
          include: {
            stage: true,
            _count: { select: { nodes: true, edges: true } },
          },
        },
      },
    });

    if (!downstream) break;

    const env = downstream.downstreamEnvironment;
    path.push({
      id: env.id,
      name: env.name,
      type: env.type,
      stageKey: env.stage?.key ?? null,
      stageName: env.stage?.name ?? null,
      nodeCount: env._count.nodes,
      edgeCount: env._count.edges,
    });

    currentId = env.id;
  }

  return path;
}
