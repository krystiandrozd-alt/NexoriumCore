// TelEnvIQ - Cost Rollups API
// POST /api/cost/rollups - Get aggregated cost rollups

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCostRollups } from '@/lib/services/cost-engine';

const RollupsSchema = z.object({
  costModelId: z.string().uuid(),
  environmentIds: z.array(z.string().uuid()).optional(),
  familyFilter: z.string().optional(),
  stageFilter: z.enum(['DEV', 'SIT', 'UAT', 'NFT', 'PREPROD', 'PROD_RO']).optional(),
  hostingTypeFilter: z.enum(['CLOUD', 'ON_PREM', 'HYBRID', 'THIRD_PARTY', 'EDGE']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = RollupsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const rollups = await getCostRollups(validation.data);

    return NextResponse.json({
      success: true,
      data: rollups,
    });
  } catch (error) {
    console.error('Failed to compute rollups:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to compute rollups' },
      { status: 500 }
    );
  }
}
