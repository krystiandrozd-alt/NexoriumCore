// Nexorium Core - Manual Flow Map Nodes API
// GET (list) and POST (create) routes

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import type { ManualNodeScope, Prisma } from '@prisma/client';

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
  description: z.string().max(500).optional().nullable(),
  scope: z.enum(['GLOBAL', 'DEV', 'SIT', 'UAT', 'NFT', 'PREPROD']).default('GLOBAL'),
  positionX: z.number(),
  positionY: z.number(),
  metadata: z.any().optional().nullable(),
});

// GET /api/flow-map/manual/nodes - List all manual nodes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope');

    const where = scope && scope !== 'all'
      ? { scope: { in: ['GLOBAL', scope] as ManualNodeScope[] } }
      : {};

    const nodes = await prisma.manualFlowMapNode.findMany({
      where,
      include: {
        outgoingEdges: true,
        incomingEdges: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(nodes);
  } catch (error) {
    console.error('Failed to fetch manual nodes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manual nodes' },
      { status: 500 }
    );
  }
}

// POST /api/flow-map/manual/nodes - Create a new manual node
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createNodeSchema.parse(body);

    const node = await prisma.manualFlowMapNode.create({
      data: {
        name: validated.name,
        nodeType: validated.nodeType,
        domain: validated.domain,
        description: validated.description,
        scope: validated.scope,
        positionX: validated.positionX,
        positionY: validated.positionY,
        metadata: validated.metadata as Prisma.InputJsonValue | undefined,
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
    console.error('Failed to create manual node:', error);
    return NextResponse.json(
      { error: 'Failed to create manual node' },
      { status: 500 }
    );
  }
}
