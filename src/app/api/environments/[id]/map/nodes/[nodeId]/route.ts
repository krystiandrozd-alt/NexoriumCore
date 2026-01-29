// Nexorium Core - Environment-Scoped Manual Node API
// GET, PATCH, DELETE routes for individual nodes within an environment

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

// Validation schema for updating a node
const updateNodeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  nodeType: z.enum([
    'SERVER',
    'DATABASE',
    'API_SERVICE',
    'QUEUE_EVENT_BUS',
    'LOAD_BALANCER',
    'CLOUD',
    'STORAGE',
    'EXTERNAL_SYSTEM',
    'NOTE',
  ]).optional(),
  domain: z.enum(['BSS', 'OSS', 'NETWORK', 'EXTERNAL']).optional().nullable(),
  domainLane: z.enum(['CSS', 'BSS', 'OSS', 'NETWORK', 'EXTERNAL']).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  scope: z.enum(['GLOBAL', 'DEV', 'SIT', 'UAT', 'NFT', 'PREPROD']).optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  metadata: z.any().optional().nullable(),
});

// GET /api/environments/[id]/map/nodes/[nodeId] - Get a single node
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; nodeId: string }> }
) {
  try {
    const { id: environmentId, nodeId } = await params;

    const node = await prisma.manualFlowMapNode.findFirst({
      where: {
        id: nodeId,
        environmentId,
      },
      include: {
        outgoingEdges: true,
        incomingEdges: true,
      },
    });

    if (!node) {
      return NextResponse.json(
        { error: 'Manual node not found in this environment' },
        { status: 404 }
      );
    }

    return NextResponse.json(node);
  } catch (error) {
    console.error('Failed to fetch manual node:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manual node' },
      { status: 500 }
    );
  }
}

// PATCH /api/environments/[id]/map/nodes/[nodeId] - Update a node
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; nodeId: string }> }
) {
  try {
    const { id: environmentId, nodeId } = await params;
    const body = await request.json();
    const validated = updateNodeSchema.parse(body);

    // Check if node exists in this environment
    const existing = await prisma.manualFlowMapNode.findFirst({
      where: {
        id: nodeId,
        environmentId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Manual node not found in this environment' },
        { status: 404 }
      );
    }

    const updateData: Prisma.ManualFlowMapNodeUpdateInput = {};
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.nodeType !== undefined) updateData.nodeType = validated.nodeType;
    if (validated.domain !== undefined) updateData.domain = validated.domain;
    if (validated.domainLane !== undefined) updateData.domainLane = validated.domainLane;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.scope !== undefined) updateData.scope = validated.scope;
    if (validated.positionX !== undefined) updateData.positionX = validated.positionX;
    if (validated.positionY !== undefined) updateData.positionY = validated.positionY;
    if (validated.metadata !== undefined) {
      updateData.metadata = validated.metadata as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
    }

    const node = await prisma.manualFlowMapNode.update({
      where: { id: nodeId },
      data: updateData,
    });

    return NextResponse.json(node);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Failed to update manual node:', error);
    return NextResponse.json(
      { error: 'Failed to update manual node' },
      { status: 500 }
    );
  }
}

// DELETE /api/environments/[id]/map/nodes/[nodeId] - Delete a node
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; nodeId: string }> }
) {
  try {
    const { id: environmentId, nodeId } = await params;

    // Check if node exists in this environment
    const existing = await prisma.manualFlowMapNode.findFirst({
      where: {
        id: nodeId,
        environmentId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Manual node not found in this environment' },
        { status: 404 }
      );
    }

    // Delete the node (edges will be cascade deleted)
    await prisma.manualFlowMapNode.delete({
      where: { id: nodeId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete manual node:', error);
    return NextResponse.json(
      { error: 'Failed to delete manual node' },
      { status: 500 }
    );
  }
}
