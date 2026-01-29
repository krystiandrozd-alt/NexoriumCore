// Nexorium Core - Person Detail API
// GET /api/organisation/people/[id] - Get person by ID
// PUT /api/organisation/people/[id] - Update person
// DELETE /api/organisation/people/[id] - Delete person

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { PersonStatus } from '@prisma/client';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const UpdatePersonSchema = z.object({
  displayName: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  team: z.string().optional(),
  phone: z.string().optional(),
  status: z.nativeEnum(PersonStatus).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.VIEW_ORGANISATION);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        raciMappings: {
          include: {
            environment: { select: { id: true, name: true, type: true } },
          },
        },
      },
    });

    if (!person) {
      return NextResponse.json(
        { success: false, error: 'Person not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: person });
  } catch (error) {
    console.error('Failed to fetch person:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch person' },
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
    const validation = UpdatePersonSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    // If changing email, check for duplicates
    if (validation.data.email) {
      const existing = await prisma.person.findFirst({
        where: {
          email: validation.data.email,
          id: { not: id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    const person = await prisma.person.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({ success: true, data: person });
  } catch (error) {
    console.error('Failed to update person:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update person' },
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

    // Check for RACI mappings
    const mappings = await prisma.rACIMapping.count({
      where: { personId: id },
    });

    if (mappings > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete person with RACI assignments. Remove assignments first.' },
        { status: 400 }
      );
    }

    await prisma.person.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete person:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete person' },
      { status: 500 }
    );
  }
}
