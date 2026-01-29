// Nexorium Core - RACI Mappings API
// GET /api/organisation/raci - List all RACI mappings
// POST /api/organisation/raci - Create new RACI mapping

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { RACIRole, AssetEntityType } from '@prisma/client';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const CreateRACISchema = z.object({
  personId: z.string().uuid(),
  raciRole: z.nativeEnum(RACIRole),
  entityType: z.nativeEnum(AssetEntityType),
  entityId: z.string().uuid(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requirePermission(Permission.VIEW_ORGANISATION);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const personId = searchParams.get('personId');
    const entityId = searchParams.get('entityId');
    const entityType = searchParams.get('entityType') as AssetEntityType | null;
    const raciRole = searchParams.get('raciRole') as RACIRole | null;

    const mappings = await prisma.rACIMapping.findMany({
      where: {
        ...(personId && { personId }),
        ...(entityId && { entityId }),
        ...(entityType && { entityType }),
        ...(raciRole && { raciRole }),
      },
      include: {
        person: {
          select: { id: true, displayName: true, email: true, role: true },
        },
        environment: {
          select: { id: true, name: true, type: true },
        },
      },
      orderBy: [{ raciRole: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ success: true, data: mappings });
  } catch (error) {
    console.error('Failed to fetch RACI mappings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch RACI mappings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(Permission.MANAGE_ORGANISATION);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const validation = CreateRACISchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check for duplicate RACI assignment
    const existing = await prisma.rACIMapping.findFirst({
      where: {
        personId: validation.data.personId,
        raciRole: validation.data.raciRole,
        entityType: validation.data.entityType,
        entityId: validation.data.entityId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This RACI assignment already exists' },
        { status: 400 }
      );
    }

    // Enforce single Accountable per entity
    if (validation.data.raciRole === RACIRole.ACCOUNTABLE) {
      const existingAccountable = await prisma.rACIMapping.findFirst({
        where: {
          raciRole: RACIRole.ACCOUNTABLE,
          entityType: validation.data.entityType,
          entityId: validation.data.entityId,
        },
      });

      if (existingAccountable) {
        return NextResponse.json(
          { success: false, error: 'Only one person can be Accountable per entity' },
          { status: 400 }
        );
      }
    }

    const mapping = await prisma.rACIMapping.create({
      data: validation.data,
      include: {
        person: { select: { id: true, displayName: true, email: true } },
        environment: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: mapping }, { status: 201 });
  } catch (error) {
    console.error('Failed to create RACI mapping:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create RACI mapping' },
      { status: 500 }
    );
  }
}
