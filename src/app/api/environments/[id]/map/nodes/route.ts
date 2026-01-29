// Nexorium Core - Environment-Scoped Manual Nodes API
// GET (list) and POST (create) routes for manual nodes within an environment

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

// Validation schema for creating a node
const createNodeSchema = z.object({
  name: z.string().min(1).max(100),
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
  ]),
  domain: z.enum(['BSS', 'OSS', 'NETWORK', 'EXTERNAL']).optional().nullable(),
  domainLane: z.enum(['CSS', 'BSS', 'OSS', 'NETWORK', 'EXTERNAL']).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  scope: z.enum(['GLOBAL', 'DEV', 'SIT', 'UAT', 'NFT', 'PREPROD']).optional().default('GLOBAL'),
  positionX: z.number(),
  positionY: z.number(),
  metadata: z.any().optional().nullable(),
});

// GET /api/environments/[id]/map/nodes - List all manual nodes for an environment
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

    const nodes = await prisma.manualFlowMapNode.findMany({
      where: { environmentId },
      include: {
        outgoingEdges: true,
        incomingEdges: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(nodes);
  } catch (error) {
    console.error('Failed to fetch environment manual nodes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manual nodes' },
      { status: 500 }
    );
  }
}

// POST /api/environments/[id]/map/nodes - Create a new manual node in an environment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: environmentId } = await params;
    const body = await request.json();
    const validated = createNodeSchema.parse(body);

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

    const node = await prisma.manualFlowMapNode.create({
      data: {
        name: validated.name,
        nodeType: validated.nodeType,
        domain: validated.domain,
        domainLane: validated.domainLane,
        description: validated.description,
        scope: validated.scope,
        positionX: validated.positionX,
        positionY: validated.positionY,
        metadata: validated.metadata as Prisma.InputJsonValue | undefined,
        environmentId,
      },
    });

    return NextResponse.json(node, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Failed to create environment manual node:', error);
    return NextResponse.json(
      { error: 'Failed to create manual node' },
      { status: 500 }
    );
  }
}
