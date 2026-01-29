// Nexorium Core - 5-Layer Model Topology API
// GET /api/environments/[id]/topology5 - Get topology data using 5-layer canonical model

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import {
  analyzeGraphTopology,
  isEntryNode,
  isExitNode,
  computeLayerPositions,
} from '@/lib/utils/graph-analysis';
import type { Graph5LayerNode, Graph5LayerEdge, GraphAnalysisResult, ArchitectureLayer } from '@/types';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.VIEW_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;

    // Parse filters
    const layerFilter = searchParams.get('layer') as ArchitectureLayer | null;
    const capabilityFilter = searchParams.get('capability');
    const showInfra = searchParams.get('showInfra') !== 'false'; // Default true

    // Fetch environment with entry/exit overrides
    const environment = await prisma.environment.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        entryComponentInstanceId: true,
        exitComponentInstanceId: true,
      },
    });

    if (!environment) {
      return NextResponse.json(
        { success: false, error: 'Environment not found' },
        { status: 404 }
      );
    }

    // Build component filter
    const componentFilter: Record<string, unknown> = {};
    if (layerFilter) {
      componentFilter.layer = layerFilter;
    }
    if (capabilityFilter) {
      componentFilter.capabilityType = capabilityFilter;
    }

    // Fetch component instances with full relations
    const componentInstances = await prisma.componentInstance.findMany({
      where: {
        environmentId: id,
        component: Object.keys(componentFilter).length > 0 ? componentFilter : undefined,
      },
      include: {
        component: true,
        host: true,
        endpoints: {
          take: 1, // Get primary endpoint
          orderBy: { createdAt: 'asc' },
        },
        deployedVersions: {
          take: 1, // Get latest version
          orderBy: { capturedAt: 'desc' },
        },
      },
    });

    // Fetch connections
    const connections = await prisma.connection.findMany({
      where: { environmentId: id },
      include: {
        fromComponentInstance: {
          include: { component: true },
        },
        toComponentInstance: {
          include: { component: true },
        },
      },
    });

    // Filter out INFRA nodes if not showing
    let filteredInstances = componentInstances;
    if (!showInfra) {
      filteredInstances = componentInstances.filter(
        (ci) => ci.component.layer !== 'INFRA'
      );
    }

    const instanceIds = new Set(filteredInstances.map((ci) => ci.id));

    // Filter connections to only include those with visible nodes
    const filteredConnections = connections.filter(
      (conn) =>
        instanceIds.has(conn.fromComponentInstanceId) &&
        instanceIds.has(conn.toComponentInstanceId)
    );

    // Compute graph analysis
    const graphAnalysis: GraphAnalysisResult = analyzeGraphTopology(
      filteredInstances.map((ci) => ({ id: ci.id })),
      filteredConnections.map((conn) => ({
        fromId: conn.fromComponentInstanceId,
        toId: conn.toComponentInstanceId,
      })),
      environment.entryComponentInstanceId,
      environment.exitComponentInstanceId
    );

    // Compute auto-layout positions
    const nodesWithLayer = filteredInstances.map((ci) => ({
      id: ci.id,
      layer: ci.component.layer,
    }));
    const positions = computeLayerPositions(
      nodesWithLayer,
      filteredConnections.map((conn) => ({
        fromId: conn.fromComponentInstanceId,
        toId: conn.toComponentInstanceId,
      }))
    );

    // Transform to graph format
    const graphNodes: Graph5LayerNode[] = filteredInstances.map((ci) => {
      const pos = positions.get(ci.id) || { x: 100, y: 100 };
      const primaryEndpoint = ci.endpoints[0];
      const latestVersion = ci.deployedVersions[0];

      return {
        id: ci.id,
        type: 'custom5layer',
        position: pos,
        data: {
          label: ci.displayName || ci.component.name,
          displayName: ci.displayName,
          componentName: ci.component.name,
          layer: ci.component.layer,
          capabilityType: ci.component.capabilityType,
          hostname: ci.host?.hostname || null,
          primaryEndpoint: primaryEndpoint
            ? { port: primaryEndpoint.port, scheme: primaryEndpoint.scheme }
            : null,
          projectVersion: latestVersion?.projectVersion || null,
          isEntry: isEntryNode(ci.id, graphAnalysis),
          isExit: isExitNode(ci.id, graphAnalysis),
          sourceSystem: ci.sourceSystem || null,
          ingestedAt: ci.ingestedAt || null,
        },
      };
    });

    const graphEdges: Graph5LayerEdge[] = filteredConnections.map((conn) => ({
      id: conn.id,
      source: conn.fromComponentInstanceId,
      target: conn.toComponentInstanceId,
      type: 'custom5layer',
      animated: conn.confidence === 'LOW',
      data: {
        protocolType: conn.protocolType,
        protocolDetail: conn.protocolDetail,
        port: conn.port,
        origin: conn.origin,
        confidence: conn.confidence,
        sourceSystem: conn.sourceSystem || null,
      },
    }));

    // Count by layer for stats
    const nodesByLayer: Partial<Record<ArchitectureLayer, number>> = {};
    for (const ci of filteredInstances) {
      const layer = ci.component.layer;
      nodesByLayer[layer] = (nodesByLayer[layer] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      data: {
        nodes: graphNodes,
        edges: graphEdges,
        analysis: graphAnalysis,
        meta: {
          totalNodes: componentInstances.length,
          filteredNodes: filteredInstances.length,
          totalEdges: connections.length,
          filteredEdges: filteredConnections.length,
          nodesByLayer,
          entryOverride: environment.entryComponentInstanceId,
          exitOverride: environment.exitComponentInstanceId,
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch 5-layer topology:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch topology' },
      { status: 500 }
    );
  }
}
