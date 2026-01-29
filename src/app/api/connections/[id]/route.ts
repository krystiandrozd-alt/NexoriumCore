// Nexorium Core - Connection API
// GET /api/connections/[id] - Get connection details
// PATCH /api/connections/[id] - Update origin/confidence with audit trail

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const PatchConnectionSchema = z.object({
  origin: z.enum(['INGESTED', 'MANUAL']).optional(),
  confidence: z.enum(['HIGH', 'MED', 'LOW']).optional(),
  protocolDetail: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.VIEW_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;

    const connection = await prisma.connection.findUnique({
      where: { id },
      include: {
        fromComponentInstance: {
          include: {
            component: true,
            host: { select: { hostname: true } },
          },
        },
        toComponentInstance: {
          include: {
            component: true,
            host: { select: { hostname: true } },
          },
        },
        environment: {
          select: { id: true, name: true },
        },
      },
    });

    if (!connection) {
      return NextResponse.json(
        { success: false, error: 'Connection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: connection });
  } catch (error) {
    console.error('Failed to fetch connection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch connection' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.EDIT_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = PatchConnectionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    // Get current state for audit
    const currentConnection = await prisma.connection.findUnique({
      where: { id },
      select: {
        origin: true,
        confidence: true,
        protocolDetail: true,
        notes: true,
      },
    });

    if (!currentConnection) {
      return NextResponse.json(
        { success: false, error: 'Connection not found' },
        { status: 404 }
      );
    }

    // Build audit events
    const auditEvents: Array<{
      entityType: string;
      entityId: string;
      field: string;
      oldValue: string | null;
      newValue: string | null;
      action: 'MANUAL_OVERRIDE';
      editedBy: string;
      reason: string;
    }> = [];

    const updateData: Record<string, string> = {};

    if (validation.data.origin && validation.data.origin !== currentConnection.origin) {
      updateData.origin = validation.data.origin;
      auditEvents.push({
        entityType: 'Connection',
        entityId: id,
        field: 'origin',
        oldValue: currentConnection.origin,
        newValue: validation.data.origin,
        action: 'MANUAL_OVERRIDE',
        editedBy: 'user',
        reason: 'Connection origin updated via API',
      });
    }

    if (validation.data.confidence && validation.data.confidence !== currentConnection.confidence) {
      updateData.confidence = validation.data.confidence;
      auditEvents.push({
        entityType: 'Connection',
        entityId: id,
        field: 'confidence',
        oldValue: currentConnection.confidence,
        newValue: validation.data.confidence,
        action: 'MANUAL_OVERRIDE',
        editedBy: 'user',
        reason: 'Connection confidence updated via API',
      });
    }

    if (validation.data.protocolDetail !== undefined) {
      updateData.protocolDetail = validation.data.protocolDetail;
    }

    if (validation.data.notes !== undefined) {
      updateData.notes = validation.data.notes;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: true,
        data: currentConnection,
        message: 'No changes detected',
      });
    }

    // Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.connection.update({
        where: { id },
        data: updateData,
      });

      if (auditEvents.length > 0) {
        await tx.auditEvent.createMany({
          data: auditEvents,
        });
      }

      return updated;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to patch connection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update connection' },
      { status: 500 }
    );
  }
}
