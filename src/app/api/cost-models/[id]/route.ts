// TelEnvIQ - Single Cost Model API
// GET /api/cost-models/[id] - Get cost model with items
// PUT /api/cost-models/[id] - Update cost model
// DELETE /api/cost-models/[id] - Delete cost model

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCostModel, updateCostModel, deleteCostModel } from '@/lib/services/cost-engine';

const UpdateCostModelSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  currency: z.string().length(3).optional(),
  period: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const costModel = await getCostModel(id);

    if (!costModel) {
      return NextResponse.json(
        { success: false, error: 'Cost model not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: costModel });
  } catch (error) {
    console.error('Failed to fetch cost model:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cost model' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const validation = UpdateCostModelSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const costModel = await updateCostModel(id, validation.data);
    return NextResponse.json({ success: true, data: costModel });
  } catch (error) {
    console.error('Failed to update cost model:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cost model' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    await deleteCostModel(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete cost model:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete cost model' },
      { status: 500 }
    );
  }
}
