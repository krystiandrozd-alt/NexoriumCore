// TelEnvIQ - Connector Runs API
// GET /api/connectors/runs - Get connector run history

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const environmentId = searchParams.get('environmentId');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const runs = await prisma.connectorRun.findMany({
      where: environmentId ? { environmentId } : undefined,
      orderBy: { startedAt: 'desc' },
      take: limit,
      include: {
        environment: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: runs });
  } catch (error) {
    console.error('Failed to fetch connector runs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch connector runs' },
      { status: 500 }
    );
  }
}
