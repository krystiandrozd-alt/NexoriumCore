// TelEnvIQ - Connector Detail API
// GET /api/configuration/connectors/[id] - Get connector by ID
// PUT /api/configuration/connectors/[id] - Update connector
// DELETE /api/configuration/connectors/[id] - Delete connector

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { ConnectorStatus, Prisma } from '@prisma/client';

const UpdateConnectorSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(ConnectorStatus).optional(),
  configJson: z.any().optional(),
  credentialId: z.string().uuid().optional().nullable(),
  scheduleJson: z.any().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const connector = await prisma.connector.findUnique({
      where: { id },
      include: {
        integrationRules: {
          orderBy: { priority: 'asc' },
        },
      },
    });

    if (!connector) {
      return NextResponse.json(
        { success: false, error: 'Connector not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: connector });
  } catch (error) {
    console.error('Failed to fetch connector:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch connector' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = UpdateConnectorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { configJson, scheduleJson, ...rest } = validation.data;

    const updateData: Prisma.ConnectorUpdateInput = {
      ...rest,
    };

    if (configJson !== undefined) {
      updateData.configJson = configJson as Prisma.InputJsonValue;
    }

    if (scheduleJson !== undefined) {
      updateData.scheduleJson = scheduleJson as Prisma.InputJsonValue;
    }

    const connector = await prisma.connector.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: connector });
  } catch (error) {
    console.error('Failed to update connector:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update connector' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete integration rules first
    await prisma.integrationRule.deleteMany({ where: { connectorId: id } });
    await prisma.connector.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete connector:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete connector' },
      { status: 500 }
    );
  }
}
