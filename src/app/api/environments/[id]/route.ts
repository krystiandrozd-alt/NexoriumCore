// Nexorium Core - Single Environment API
// GET /api/environments/[id] - Get environment with topology
// PUT /api/environments/[id] - Update environment
// PATCH /api/environments/[id] - Update entry/exit overrides
// DELETE /api/environments/[id] - Delete environment

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getEnvironment, updateEnvironment, deleteEnvironment } from '@/lib/services/environment';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const UpdateEnvironmentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.enum(['SIT', 'UAT', 'NFT', 'PREPROD']).optional(),
  description: z.string().optional(),
});

const PatchEnvironmentSchema = z.object({
  entryComponentInstanceId: z.string().uuid().nullable().optional(),
  exitComponentInstanceId: z.string().uuid().nullable().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require authentication and VIEW_ENVIRONMENT permission
  const auth = await requirePermission(Permission.VIEW_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const environment = await getEnvironment(id);

    if (!environment) {
      return NextResponse.json(
        { success: false, error: 'Environment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: environment });
  } catch (error) {
    console.error('Failed to fetch environment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch environment' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require authentication and EDIT_ENVIRONMENT permission
  const auth = await requirePermission(Permission.EDIT_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;

    // Check if environment is PROD_RO (read-only)
    const existing = await prisma.environment.findUnique({
      where: { id },
      select: { type: true },
    });
    if (existing?.type === 'PROD_RO') {
      return NextResponse.json(
        { success: false, error: 'Cannot modify production read-only environment' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = UpdateEnvironmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const environment = await updateEnvironment(id, validation.data);
    return NextResponse.json({ success: true, data: environment });
  } catch (error) {
    console.error('Failed to update environment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update environment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require authentication and DELETE_ENVIRONMENT permission
  const auth = await requirePermission(Permission.DELETE_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;

    // Check if environment is PROD_RO (read-only) - cannot delete production
    const existing = await prisma.environment.findUnique({
      where: { id },
      select: { type: true },
    });
    if (existing?.type === 'PROD_RO') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete production read-only environment' },
        { status: 403 }
      );
    }

    await deleteEnvironment(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete environment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete environment' },
      { status: 500 }
    );
  }
}

// PATCH - Update entry/exit overrides with audit trail
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require authentication and EDIT_ENVIRONMENT permission
  const auth = await requirePermission(Permission.EDIT_ENVIRONMENT);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = PatchEnvironmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    // Get current state for audit
    const currentEnv = await prisma.environment.findUnique({
      where: { id },
      select: {
        type: true,
        entryComponentInstanceId: true,
        exitComponentInstanceId: true,
      },
    });

    if (!currentEnv) {
      return NextResponse.json(
        { success: false, error: 'Environment not found' },
        { status: 404 }
      );
    }

    // Check if environment is PROD_RO (read-only)
    if (currentEnv.type === 'PROD_RO') {
      return NextResponse.json(
        { success: false, error: 'Cannot modify production read-only environment' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: Record<string, string | null> = {};
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

    if (validation.data.entryComponentInstanceId !== undefined) {
      updateData.entryComponentInstanceId = validation.data.entryComponentInstanceId;
      auditEvents.push({
        entityType: 'Environment',
        entityId: id,
        field: 'entryComponentInstanceId',
        oldValue: currentEnv.entryComponentInstanceId,
        newValue: validation.data.entryComponentInstanceId,
        action: 'MANUAL_OVERRIDE',
        editedBy: auth.user!.name,
        reason: 'Entry point override set via API',
      });
    }

    if (validation.data.exitComponentInstanceId !== undefined) {
      updateData.exitComponentInstanceId = validation.data.exitComponentInstanceId;
      auditEvents.push({
        entityType: 'Environment',
        entityId: id,
        field: 'exitComponentInstanceId',
        oldValue: currentEnv.exitComponentInstanceId,
        newValue: validation.data.exitComponentInstanceId,
        action: 'MANUAL_OVERRIDE',
        editedBy: auth.user!.name,
        reason: 'Exit point override set via API',
      });
    }

    // Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update environment
      const updated = await tx.environment.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          entryComponentInstanceId: true,
          exitComponentInstanceId: true,
        },
      });

      // Create audit events
      if (auditEvents.length > 0) {
        await tx.auditEvent.createMany({
          data: auditEvents,
        });
      }

      return updated;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to patch environment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update environment' },
      { status: 500 }
    );
  }
}
