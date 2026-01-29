// Nexorium Core - Single Simulation API
// GET /api/cost/simulations/[id] - Get simulation details
// DELETE /api/cost/simulations/[id] - Delete simulation

import { NextRequest, NextResponse } from 'next/server';
import { getSimulation, deleteSimulation } from '@/lib/services/cost-engine';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  const auth = await requirePermission(Permission.VIEW_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await context.params;
    const simulation = await getSimulation(id);

    if (!simulation) {
      return NextResponse.json(
        { success: false, error: 'Simulation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: simulation });
  } catch (error) {
    console.error('Failed to fetch simulation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch simulation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  const auth = await requirePermission(Permission.EDIT_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await context.params;
    await deleteSimulation(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete simulation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete simulation' },
      { status: 500 }
    );
  }
}
