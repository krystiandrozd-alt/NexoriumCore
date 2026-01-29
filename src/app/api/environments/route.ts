// Nexorium Core - Environments API
// GET /api/environments - List all environments
// POST /api/environments - Create new environment

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getEnvironments, createEnvironment } from '@/lib/services/environment';

const CreateEnvironmentSchema = z.object({
  name: z.string().min(2, 'Environment name must be at least 2 characters').max(255),
  type: z.enum(['DEV', 'SIT', 'UAT', 'NFT', 'PREPROD', 'PROD_RO']),
  description: z.string().max(1000).optional(),
  stageId: z.string().uuid().optional(),
  projectId: z.string().uuid('Project is required'),
});

export async function GET() {
  try {
    const environments = await getEnvironments();
    return NextResponse.json({ success: true, data: environments });
  } catch (error) {
    console.error('Failed to fetch environments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch environments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = CreateEnvironmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const environment = await createEnvironment(validation.data);
    return NextResponse.json({ success: true, data: environment }, { status: 201 });
  } catch (error) {
    console.error('Failed to create environment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create environment' },
      { status: 500 }
    );
  }
}
