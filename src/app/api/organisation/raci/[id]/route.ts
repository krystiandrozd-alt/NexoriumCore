// Nexorium Core - RACI Mapping Detail API
// GET /api/organisation/raci/[id] - Get RACI mapping by ID
// PUT /api/organisation/raci/[id] - Update RACI mapping
// DELETE /api/organisation/raci/[id] - Delete RACI mapping

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { RACIRole } from '@prisma/client';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const UpdateRACISchema = z.object({
  raciRole: z.nativeEnum(RACIRole).optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.VIEW_ORGANISATION);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const mapping = await prisma.rACIMapping.findUnique({
      where: { id },
      include: {
        person: {
          select: { id: true, displayName: true, email: true, role: true, department: true },
        },
        environment: {
          select: { id: true, name: true, type: true, description: true },
        },
      },
    });

    if (!mapping) {
      return NextResponse.json(
        { success: false, error: 'RACI mapping not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: mapping });
  } catch (error) {
    console.error('Failed to fetch RACI mapping:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch RACI mapping' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.MANAGE_ORGANISATION);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = UpdateRACISchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    // If changing to Accountable, check for existing
    if (validation.data.raciRole === RACIRole.ACCOUNTABLE) {
      const current = await prisma.rACIMapping.findUnique({
        where: { id },
        select: { entityType: true, entityId: true },
      });

      if (current) {
        const existingAccountable = await prisma.rACIMapping.findFirst({
          where: {
            raciRole: RACIRole.ACCOUNTABLE,
            entityType: current.entityType,
            entityId: current.entityId,
            id: { not: id },
          },
        });

        if (existingAccountable) {
          return NextResponse.json(
            { success: false, error: 'Only one person can be Accountable per entity' },
            { status: 400 }
          );
        }
      }
    }

    const mapping = await prisma.rACIMapping.update({
      where: { id },
      data: validation.data,
      include: {
        person: { select: { id: true, displayName: true, email: true } },
        environment: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: mapping });
  } catch (error) {
    console.error('Failed to update RACI mapping:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update RACI mapping' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.MANAGE_ORGANISATION);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    await prisma.rACIMapping.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete RACI mapping:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete RACI mapping' },
      { status: 500 }
    );
  }
}
