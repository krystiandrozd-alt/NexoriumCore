// TelEnvIQ - Connectors Configuration API
// GET /api/configuration/connectors - List all connectors
// POST /api/configuration/connectors - Create new connector

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { ConnectorType, ConnectorStatus, Prisma } from '@prisma/client';

const CreateConnectorSchema = z.object({
  name: z.string().min(1).max(255),
  connectorType: z.nativeEnum(ConnectorType),
  description: z.string().optional(),
  configJson: z.any().optional(),
  credentialId: z.string().uuid().optional(),
  scheduleJson: z.any().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ConnectorStatus | null;
    const type = searchParams.get('type') as ConnectorType | null;

    const connectors = await prisma.connector.findMany({
      where: {
        ...(status && { status }),
        ...(type && { connectorType: type }),
      },
      include: {
        integrationRules: {
          select: { id: true, name: true, isActive: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: connectors });
  } catch (error) {
    console.error('Failed to fetch connectors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch connectors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = CreateConnectorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { configJson, scheduleJson, ...rest } = validation.data;

    const connector = await prisma.connector.create({
      data: {
        ...rest,
        configJson: configJson as Prisma.InputJsonValue,
        scheduleJson: scheduleJson as Prisma.InputJsonValue,
        status: rest.credentialId ? ConnectorStatus.ACTIVE : ConnectorStatus.PENDING_CONFIG,
      },
    });

    return NextResponse.json({ success: true, data: connector }, { status: 201 });
  } catch (error) {
    console.error('Failed to create connector:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create connector' },
      { status: 500 }
    );
  }
}
