// Nexorium Core - Cost Simulations API
// GET /api/cost/simulations - List all simulations
// POST /api/cost/simulations - Run a new simulation
// POST /api/cost/simulations?save=true - Run and save simulation

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSimulations, runSimulation, saveSimulation } from '@/lib/services/cost-engine';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const RunSimulationSchema = z.object({
  baseCostModelId: z.string().uuid(),
  addEnvCount: z.number().int().min(0).optional(),
  envFamily: z.string().optional(),
  envStage: z.enum(['DEV', 'SIT', 'UAT', 'NFT', 'PREPROD', 'PROD_RO']).optional(),
  scalingFactor: z.number().min(0).optional(),
});

const SaveSimulationSchema = RunSimulationSchema.extend({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  createdBy: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requirePermission(Permission.VIEW_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const costModelId = searchParams.get('costModelId') || undefined;

    const simulations = await getSimulations(costModelId);
    return NextResponse.json({ success: true, data: simulations });
  } catch (error) {
    console.error('Failed to fetch simulations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch simulations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(Permission.EDIT_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const shouldSave = searchParams.get('save') === 'true';

    const body = await request.json();
    const schema = shouldSave ? SaveSimulationSchema : RunSimulationSchema;
    const validation = schema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const params = validation.data;

    // Run the simulation
    const result = await runSimulation({
      baseCostModelId: params.baseCostModelId,
      addEnvCount: params.addEnvCount,
      envFamily: params.envFamily,
      envStage: params.envStage,
      scalingFactor: params.scalingFactor,
    });

    // Optionally save the simulation
    if (shouldSave && 'name' in params) {
      const saveParams = params as z.infer<typeof SaveSimulationSchema>;
      const savedSimulation = await saveSimulation({
        name: saveParams.name,
        description: saveParams.description,
        baseCostModelId: saveParams.baseCostModelId,
        currency: result.currency,
        params: {
          baseCostModelId: saveParams.baseCostModelId,
          addEnvCount: saveParams.addEnvCount,
          envFamily: saveParams.envFamily,
          envStage: saveParams.envStage,
          scalingFactor: saveParams.scalingFactor,
        },
        result,
        createdBy: saveParams.createdBy,
      });

      return NextResponse.json({
        success: true,
        data: {
          simulation: savedSimulation,
          result,
        },
      }, { status: 201 });
    }

    return NextResponse.json({
      success: true,
      data: { result },
    });
  } catch (error) {
    console.error('Failed to run simulation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run simulation' },
      { status: 500 }
    );
  }
}
