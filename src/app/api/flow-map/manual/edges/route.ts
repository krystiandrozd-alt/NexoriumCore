// Nexorium Core - Manual Flow Map Edges API
// GET (list) and POST (create) routes

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

// GET /api/flow-map/manual/edges - List all manual edges
export async function GET() {
  try {
    const edges = await prisma.manualFlowMapEdge.findMany({
      include: {
        sourceNode: true,
        targetNode: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(edges);
  } catch (error) {
    console.error('Failed to fetch manual edges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manual edges' },
      { status: 500 }
    );
  }
}

// POST /api/flow-map/manual/edges - Create a new manual edge
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createEdgeSchema.parse(body);

    // Check if source and target nodes exist
    const [sourceNode, targetNode] = await Promise.all([
      prisma.manualFlowMapNode.findUnique({ where: { id: validated.sourceNodeId } }),
      prisma.manualFlowMapNode.findUnique({ where: { id: validated.targetNodeId } }),
    ]);

    if (!sourceNode) {
      return NextResponse.json(
        { error: 'Source node not found' },
        { status: 400 }
      );
    }

    if (!targetNode) {
      return NextResponse.json(
        { error: 'Target node not found' },
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
    console.error('Failed to create manual edge:', error);
    return NextResponse.json(
      { error: 'Failed to create manual edge' },
      { status: 500 }
    );
  }
}
