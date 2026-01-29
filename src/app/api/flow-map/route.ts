// Nexorium Core - Flow Map V2 API
// Returns environment flow data from database

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import type { FlowMapV2Data, FlowMapV2Environment, FlowMapV2Integration, FlowMapV2Stage, FlowMapLinkType } from '@/types/flow-map-v2';
import { stageColors } from '@/types/flow-map-v2';

export async function GET() {
  try {
    const [environments, links, stages] = await Promise.all([
      prisma.environment.findMany({
        include: {
          stage: true,
          networkContexts: {
            take: 1,
          },
          _count: {
            select: {
              componentInstances: true,
              connections: true,
            },
          },
        },
        orderBy: { name: 'asc' },
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

    // Map environments to V2 format
    const mappedEnvironments: FlowMapV2Environment[] = environments.map((env) => {
      const networkContext = env.networkContexts[0];

      return {
        id: env.id,
        name: env.name,
        type: env.type,
        stageKey: env.stage?.key as FlowMapV2Environment['stageKey'] ?? null,
        stageName: env.stage?.name ?? null,
        systemCount: env._count.componentInstances,
        connectionCount: env._count.connections,
        description: env.description ?? undefined,
        hostingPlatform: networkContext?.cloudProvider ?? networkContext?.hostingType ?? undefined,
        vpc: networkContext?.vpcVnet ?? undefined,
        subnet: networkContext?.subnetCidr ?? undefined,
        updatedAt: env.updatedAt,
      };
    });

    // Map links to V2 format
    const mappedIntegrations: FlowMapV2Integration[] = links.map((link) => ({
      id: link.id,
      sourceId: link.upstreamEnvironmentId,
      targetId: link.downstreamEnvironmentId,
      linkType: link.linkType as FlowMapLinkType,
      isActive: link.isActive,
      notes: link.notes ?? undefined,
    }));

    // Map stages to V2 format
    const mappedStages: FlowMapV2Stage[] = stages.map((stage) => ({
      id: stage.id,
      key: stage.key as FlowMapV2Stage['key'],
      name: stage.name,
      color: stage.color ?? stageColors[stage.key as keyof typeof stageColors] ?? '#64748b',
      sortOrder: stage.sortOrder,
      environmentCount: stage._count.environments,
    }));

    const data: FlowMapV2Data = {
      environments: mappedEnvironments,
      integrations: mappedIntegrations,
      stages: mappedStages,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching flow map data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flow map data' },
      { status: 500 }
    );
  }
}
