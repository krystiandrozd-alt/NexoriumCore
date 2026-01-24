// TelEnvIQ - Cost Models API
// GET /api/cost-models - List all cost models
// POST /api/cost-models - Create new cost model

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCostModels, createCostModel } from '@/lib/services/cost-engine';

const CreateCostModelSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  currency: z.string().length(3).default('USD'),
  period: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']).default('MONTHLY'),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const costModels = await getCostModels();
    return NextResponse.json({ success: true, data: costModels });
  } catch (error) {
    console.error('Failed to fetch cost models:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cost models' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = CreateCostModelSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const costModel = await createCostModel(validation.data);
    return NextResponse.json({ success: true, data: costModel }, { status: 201 });
  } catch (error) {
    console.error('Failed to create cost model:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create cost model' },
      { status: 500 }
    );
  }
}
