// TelEnvIQ - Run Connector API
// POST /api/configuration/connectors/[id]/run - Trigger connector run

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const connector = await prisma.connector.findUnique({
      where: { id },
      select: { id: true, name: true, status: true, connectorType: true },
    });

    if (!connector) {
      return NextResponse.json(
        { success: false, error: 'Connector not found' },
        { status: 404 }
      );
    }

    if (connector.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Connector is not active' },
        { status: 400 }
      );
    }

    // Update last run time
    await prisma.connector.update({
      where: { id },
      data: {
        lastRunAt: new Date(),
        lastRunStatus: 'RUNNING',
      },
    });

    // In a real implementation, this would:
    // 1. Queue the connector run job
    // 2. Execute fetch(), map(), upsert(), snapshot(), report()
    // 3. Update lastRunStatus when complete

    // For now, simulate a successful run after a short delay
    setTimeout(async () => {
      try {
        await prisma.connector.update({
          where: { id },
          data: {
            lastRunStatus: 'SUCCESS',
          },
        });
      } catch (e) {
        console.error('Failed to update connector status:', e);
      }
    }, 2000);

    return NextResponse.json({
      success: true,
      message: 'Connector run initiated',
      data: {
        connectorId: connector.id,
        connectorName: connector.name,
        startedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to run connector:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run connector' },
      { status: 500 }
    );
  }
}
