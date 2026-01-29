// Nexorium Core - Environment-Scoped Manual Edges API
// GET (list) and POST (create) routes for manual edges within an environment

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

// Validation schema for creating an edge
const createEdgeSchema = z.object({
  sourceNodeId: z.string().uuid(),
  targetNodeId: z.string().uuid(),
  edgeType: z.enum(['API', 'EVENT', 'FILE', 'DB', 'MANUAL']),
  label: z.string().max(100).optional().nullable(),
  metadata: z.any().optional().nullable(),
});

// GET /api/environments/[id]/map/edges - List all manual edges for an environment
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: environmentId } = await params;

    // Verify environment exists
    const environment = await prisma.environment.findUnique({
      where: { id: environmentId },
    });

    if (!environment) {
      return NextResponse.json(
        { error: 'Environment not found' },
        { status: 404 }
      );
    }

    const edges = await prisma.manualFlowMapEdge.findMany({
      where: { environmentId },
      include: {
        sourceNode: true,
        targetNode: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(edges);
  } catch (error) {
    console.error('Failed to fetch environment manual edges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manual edges' },
      { status: 500 }
    );
  }
}

// POST /api/environments/[id]/map/edges - Create a new manual edge in an environment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: environmentId } = await params;
    const body = await request.json();
    const validated = createEdgeSchema.parse(body);

    // Verify environment exists
    const environment = await prisma.environment.findUnique({
      where: { id: environmentId },
    });

    if (!environment) {
      return NextResponse.json(
        { error: 'Environment not found' },
        { status: 404 }
      );
    }

    // Check if source and target nodes exist in this environment
    const [sourceNode, targetNode] = await Promise.all([
      prisma.manualFlowMapNode.findFirst({
        where: { id: validated.sourceNodeId, environmentId },
      }),
      prisma.manualFlowMapNode.findFirst({
        where: { id: validated.targetNodeId, environmentId },
      }),
    ]);

    if (!sourceNode) {
      return NextResponse.json(
        { error: 'Source node not found in this environment' },
        { status: 400 }
      );
    }

    if (!targetNode) {
      return NextResponse.json(
        { error: 'Target node not found in this environment' },
        { status: 400 }
      );
    }

    // Check if edge already exists
    const existingEdge = await prisma.manualFlowMapEdge.findUnique({
      where: {
        sourceNodeId_targetNodeId: {
          sourceNodeId: validated.sourceNodeId,
          targetNodeId: validated.targetNodeId,
        },
      },
    });

    if (existingEdge) {
      return NextResponse.json(
        { error: 'Edge already exists between these nodes' },
        { status: 409 }
      );
    }

    const edge = await prisma.manualFlowMapEdge.create({
      data: {
        sourceNodeId: validated.sourceNodeId,
        targetNodeId: validated.targetNodeId,
        edgeType: validated.edgeType,
        label: validated.label,
        metadata: validated.metadata as Prisma.InputJsonValue | undefined,
        environmentId,
      },
    });

    return NextResponse.json(edge, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Failed to create environment manual edge:', error);
    return NextResponse.json(
      { error: 'Failed to create manual edge' },
      { status: 500 }
    );
  }
}
