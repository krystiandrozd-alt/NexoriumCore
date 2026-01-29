// Nexorium Core - Manual Flow Map Edge API
// PATCH and DELETE routes for individual edges

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

// Validation schema for updating an edge
const updateEdgeSchema = z.object({
  edgeType: z.enum(['API', 'EVENT', 'FILE', 'DB', 'MANUAL']).optional(),
  label: z.string().max(100).optional().nullable(),
  metadata: z.any().optional().nullable(),
});

// PATCH /api/flow-map/manual/edges/[id] - Update an edge
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateEdgeSchema.parse(body);

    // Check if edge exists
    const existing = await prisma.manualFlowMapEdge.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Manual edge not found' },
        { status: 404 }
      );
    }

    const updateData: Prisma.ManualFlowMapEdgeUpdateInput = {};
    if (validated.edgeType !== undefined) updateData.edgeType = validated.edgeType;
    if (validated.label !== undefined) updateData.label = validated.label;
    if (validated.metadata !== undefined) {
      updateData.metadata = validated.metadata as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
    }

    const edge = await prisma.manualFlowMapEdge.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(edge);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Failed to update manual edge:', error);
    return NextResponse.json(
      { error: 'Failed to update manual edge' },
      { status: 500 }
    );
  }
}

// DELETE /api/flow-map/manual/edges/[id] - Delete an edge
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if edge exists
    const existing = await prisma.manualFlowMapEdge.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Manual edge not found' },
        { status: 404 }
      );
    }

    await prisma.manualFlowMapEdge.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete manual edge:', error);
    return NextResponse.json(
      { error: 'Failed to delete manual edge' },
      { status: 500 }
    );
  }
}
