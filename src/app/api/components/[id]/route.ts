// Nexorium Core - Component API
// GET /api/components/[id] - Get component details
// PATCH /api/components/[id] - Update layer/capability with audit trail

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const PatchComponentSchema = z.object({
  layer: z.enum(['BSS', 'OSS', 'INFRA', 'EXTERNAL', 'UNKNOWN']).optional(),
  capabilityType: z.enum([
    'CPQ', 'CRM', 'BILLING', 'SOM', 'INVENTORY', 'ORCHESTRATOR',
    'DB', 'MQ', 'API_GW', 'IDENTITY', 'ITSM', 'OTHER', 'UNKNOWN'
  ]).optional(),
  vendor: z.string().optional(),
  description: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.VIEW_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;

    const component = await prisma.component.findUnique({
      where: { id },
      include: {
        instances: {
          include: {
            environment: {
              select: { id: true, name: true, type: true },
            },
            host: {
              select: { hostname: true, ip: true },
            },
            endpoints: {
              take: 1,
              orderBy: { createdAt: 'asc' },
            },
            deployedVersions: {
              take: 1,
              orderBy: { capturedAt: 'desc' },
            },
          },
        },
      },
    });

    if (!component) {
      return NextResponse.json(
        { success: false, error: 'Component not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: component });
  } catch (error) {
    console.error('Failed to fetch component:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch component' },
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
    const validation = PatchComponentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    // Get current state for audit
    const currentComponent = await prisma.component.findUnique({
      where: { id },
      select: {
        layer: true,
        capabilityType: true,
        vendor: true,
        description: true,
      },
    });

    if (!currentComponent) {
      return NextResponse.json(
        { success: false, error: 'Component not found' },
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

    if (validation.data.layer && validation.data.layer !== currentComponent.layer) {
      updateData.layer = validation.data.layer;
      auditEvents.push({
        entityType: 'Component',
        entityId: id,
        field: 'layer',
        oldValue: currentComponent.layer,
        newValue: validation.data.layer,
        action: 'MANUAL_OVERRIDE',
        editedBy: 'user',
        reason: 'Architecture layer updated via API',
      });
    }

    if (validation.data.capabilityType && validation.data.capabilityType !== currentComponent.capabilityType) {
      updateData.capabilityType = validation.data.capabilityType;
      auditEvents.push({
        entityType: 'Component',
        entityId: id,
        field: 'capabilityType',
        oldValue: currentComponent.capabilityType,
        newValue: validation.data.capabilityType,
        action: 'MANUAL_OVERRIDE',
        editedBy: 'user',
        reason: 'Capability type updated via API',
      });
    }

    if (validation.data.vendor !== undefined) {
      updateData.vendor = validation.data.vendor;
    }

    if (validation.data.description !== undefined) {
      updateData.description = validation.data.description;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: true,
        data: currentComponent,
        message: 'No changes detected',
      });
    }

    // Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.component.update({
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
    console.error('Failed to patch component:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update component' },
      { status: 500 }
    );
  }
}
