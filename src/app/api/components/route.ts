// TelEnvIQ - Components List API
// GET /api/components - Get all components (catalog)

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const layer = searchParams.get('layer');
    const capability = searchParams.get('capability');

    const whereClause: Record<string, unknown> = {};
    if (layer) {
      whereClause.layer = layer;
    }
    if (capability) {
      whereClause.capabilityType = capability;
    }

    const components = await prisma.component.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: {
        _count: {
          select: {
            instances: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: components,
    });
  } catch (error) {
    console.error('Failed to fetch components:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch components' },
      { status: 500 }
    );
  }
}
