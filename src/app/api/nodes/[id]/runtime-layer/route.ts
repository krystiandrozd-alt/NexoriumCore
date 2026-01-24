// TelEnvIQ - Node Runtime Layer API
// GET /api/nodes/[id]/runtime-layer - Get node runtime layer
// PUT /api/nodes/[id]/runtime-layer - Create/Update runtime layer
// DELETE /api/nodes/[id]/runtime-layer - Delete runtime layer

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getRuntimeLayerByNodeId,
  createRuntimeLayer,
  updateRuntimeLayer,
  deleteRuntimeLayerByNodeId,
} from '@/lib/services/runtime-layer';

const RuntimeLayerSchema = z.object({
  virtualizationType: z.enum(['VM', 'CONTAINER', 'CNF', 'VNF', 'BARE_METAL']),
  runtimeName: z.string().optional(),
  runtimeVersion: z.string().optional(),
  orchestrator: z.string().optional(),
  clusterName: z.string().optional(),
  namespace: z.string().optional(),
  resourceLimits: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const layer = await getRuntimeLayerByNodeId(id);

    if (!layer) {
      return NextResponse.json(
        { success: true, data: null },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true, data: layer });
  } catch (error) {
    console.error('Failed to fetch runtime layer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch runtime layer' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = RuntimeLayerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check if layer exists
    const existing = await getRuntimeLayerByNodeId(id);

    let layer;
    if (existing) {
      layer = await updateRuntimeLayer(existing.id, validation.data);
    } else {
      layer = await createRuntimeLayer({
        nodeId: id,
        ...validation.data,
      });
    }

    return NextResponse.json({ success: true, data: layer });
  } catch (error) {
    console.error('Failed to update runtime layer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update runtime layer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteRuntimeLayerByNodeId(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete runtime layer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete runtime layer' },
      { status: 500 }
    );
  }
}
