// Nexorium Core - Cost Computation API
// POST /api/cost/compute - Compute costs for environments

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { computeEnvironmentCosts, saveEnvironmentCostAllocation } from '@/lib/services/cost-engine';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const ComputeCostSchema = z.object({
  costModelId: z.string().uuid(),
  environmentIds: z.array(z.string().uuid()).optional(),
  familyFilter: z.string().optional(),
  stageFilter: z.enum(['DEV', 'SIT', 'UAT', 'NFT', 'PREPROD', 'PROD_RO']).optional(),
  hostingTypeFilter: z.enum(['CLOUD', 'ON_PREM', 'HYBRID', 'THIRD_PARTY', 'EDGE']).optional(),
  periodStart: z.string().datetime().optional(),
  periodEnd: z.string().datetime().optional(),
  quantityOverrides: z.record(z.string(), z.number()).optional(),
  saveAllocation: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  const auth = await requirePermission(Permission.VIEW_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const validation = ComputeCostSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      costModelId,
      environmentIds,
      familyFilter,
      stageFilter,
      hostingTypeFilter,
      periodStart,
      periodEnd,
      quantityOverrides,
      saveAllocation,
    } = validation.data;

    const costs = await computeEnvironmentCosts({
      costModelId,
      environmentIds,
      familyFilter,
      stageFilter,
      hostingTypeFilter,
      periodStart: periodStart ? new Date(periodStart) : undefined,
      periodEnd: periodEnd ? new Date(periodEnd) : undefined,
      quantityOverrides,
    });

    // Optionally save allocations
    if (saveAllocation && periodStart && periodEnd) {
      for (const cost of costs) {
        await saveEnvironmentCostAllocation(
          cost,
          costModelId,
          new Date(periodStart),
          new Date(periodEnd)
        );
      }
    }

    // Calculate totals
    const totalCost = costs.reduce((sum, c) => sum + c.totalCost, 0);

    return NextResponse.json({
      success: true,
      data: {
        environments: costs,
        totalCost,
        environmentCount: costs.length,
        currency: costs[0]?.currency || 'USD',
        computedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to compute costs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to compute costs' },
      { status: 500 }
    );
  }
}
