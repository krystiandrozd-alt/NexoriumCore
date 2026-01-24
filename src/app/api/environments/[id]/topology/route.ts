// TelEnvIQ - Environment Topology API
// GET /api/environments/[id]/topology - Get topology data for graph visualization

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateNodePosition, daysSince, getStalenessLevel } from '@/lib/utils';
import type { GraphNode, GraphEdge, GraphFilters } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;

    // Parse filters from query params
    const filters: GraphFilters = {
      owner: searchParams.get('owner') || undefined,
      protocol: searchParams.get('protocol') as GraphFilters['protocol'] || undefined,
      nodeType: searchParams.get('nodeType') as GraphFilters['nodeType'] || undefined,
      showStale: searchParams.get('showStale') === 'true',
      minConfidence: searchParams.get('minConfidence')
        ? parseFloat(searchParams.get('minConfidence')!)
        : undefined,
      stalenessThreshold: searchParams.get('stalenessThreshold')
        ? parseInt(searchParams.get('stalenessThreshold')!)
        : 30,
    };

    // Fetch nodes with optional filters
    const nodeWhereClause: Record<string, unknown> = { environmentId: id };
    if (filters.owner) nodeWhereClause.owner = filters.owner;
    if (filters.nodeType) nodeWhereClause.type = filters.nodeType;

    const nodes = await prisma.node.findMany({
      where: nodeWhereClause,
      include: {
        databaseMetadata: {
          include: {
            testDataSet: true,
          },
        },
      },
    });

    // Fetch edges
    const edgeWhereClause: Record<string, unknown> = { environmentId: id };
    if (filters.protocol) edgeWhereClause.protocol = filters.protocol;
    if (filters.minConfidence) {
      edgeWhereClause.confidenceScore = { gte: filters.minConfidence };
    }

    const edges = await prisma.edge.findMany({
      where: edgeWhereClause,
    });

    // Determine staleness threshold
    const stalenessThreshold = filters.stalenessThreshold || 30;
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - stalenessThreshold);

    // Transform nodes to graph format
    const graphNodes: GraphNode[] = nodes.map((node, index) => {
      const isStale = node.lastSeenAt < thresholdDate;
      const position = generateNodePosition(index, nodes.length);

      // Check test data staleness for databases
      let dataStale = false;
      if (node.databaseMetadata?.testDataSet) {
        const days = daysSince(node.databaseMetadata.testDataSet.lastRefreshDate);
        dataStale = getStalenessLevel(days) === 'stale' || getStalenessLevel(days) === 'critical';
      }

      return {
        id: node.id,
        type: 'custom',
        position,
        data: {
          label: node.name,
          nodeType: node.type,
          owner: node.owner,
          criticality: node.criticality,
          lastSeenAt: node.lastSeenAt,
          databaseMetadata: node.databaseMetadata as GraphNode['data']['databaseMetadata'],
          isStale: isStale || dataStale,
        },
      };
    });

    // Filter edges to only include those with both nodes present
    const nodeIds = new Set(nodes.map(n => n.id));

    // Transform edges to graph format
    const graphEdges: GraphEdge[] = edges
      .filter(edge => nodeIds.has(edge.sourceNodeId) && nodeIds.has(edge.targetNodeId))
      .map(edge => {
        const isStale = edge.lastObservedAt < thresholdDate;

        return {
          id: edge.id,
          source: edge.sourceNodeId,
          target: edge.targetNodeId,
          type: 'custom',
          animated: edge.confidenceScore < 0.7,
          data: {
            protocol: edge.protocol,
            port: edge.port,
            pathOrTopic: edge.pathOrTopic,
            confidenceScore: edge.confidenceScore,
            isStale,
          },
        };
      });

    // Filter out stale items if not showing stale
    let filteredNodes = graphNodes;
    let filteredEdges = graphEdges;

    if (!filters.showStale) {
      filteredNodes = graphNodes.filter(n => !n.data.isStale);
      const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
      filteredEdges = graphEdges.filter(
        e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target) && !e.data.isStale
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        nodes: filteredNodes,
        edges: filteredEdges,
        meta: {
          totalNodes: graphNodes.length,
          totalEdges: graphEdges.length,
          filteredNodes: filteredNodes.length,
          filteredEdges: filteredEdges.length,
          staleNodes: graphNodes.filter(n => n.data.isStale).length,
          staleEdges: graphEdges.filter(e => e.data.isStale).length,
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch topology:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch topology' },
      { status: 500 }
    );
  }
}
