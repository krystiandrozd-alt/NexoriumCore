// TelEnvIQ - Environment Cost API
// GET /api/environments/[id]/cost - Get cost data for an environment
// PUT /api/environments/[id]/cost - Update cost override

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getEnvironmentCostOverride,
  upsertEnvironmentCostOverride,
  deleteEnvironmentCostOverride,
  getEnvironmentCostAllocations,
  computeEnvironmentCosts,
} from '@/lib/services/cost-engine';
import prisma from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const costModelId = searchParams.get('costModelId');

    // Get environment to verify it exists
    const environment = await prisma.environment.findUnique({
      where: { id },
      select: { id: true, name: true, type: true },
    });

    if (!environment) {
      return NextResponse.json(
        { success: false, error: 'Environment not found' },
        { status: 404 }
      );
    }

    // Get cost override
    const override = await getEnvironmentCostOverride(id);

    // Get historical allocations
    const allocations = await getEnvironmentCostAllocations(id);

    // If costModelId provided, compute current cost
    let currentCost = null;
    if (costModelId) {
      const costs = await computeEnvironmentCosts({
        costModelId,
        environmentIds: [id],
      });
      currentCost = costs[0] || null;
    }

    return NextResponse.json({
      success: true,
      data: {
        environment,
        override,
        allocations,
        currentCost,
      },
    });
  } catch (error) {
    console.error('Failed to fetch environment cost:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch environment cost' },
      { status: 500 }
    );
  }
}

const UpdateCostOverrideSchema = z.object({
  currency: z.string().length(3).optional(),
  fixedMonthlyCost: z.number().min(0).nullable().optional(),
  notes: z.string().optional(),
  editedBy: z.string().optional(),
});

export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const validation = UpdateCostOverrideSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const override = await upsertEnvironmentCostOverride(id, validation.data);
    return NextResponse.json({ success: true, data: override });
  } catch (error) {
    console.error('Failed to update cost override:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cost override' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const editedBy = searchParams.get('editedBy') || undefined;

    await deleteEnvironmentCostOverride(id, editedBy);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete cost override:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete cost override' },
      { status: 500 }
    );
  }
}
