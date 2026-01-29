// Nexorium Core - Release Detail API
// GET /api/governance/releases/[id] - Get release by ID
// PUT /api/governance/releases/[id] - Update release
// DELETE /api/governance/releases/[id] - Delete release

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { ReleaseStatus } from '@prisma/client';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const UpdateReleaseSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  version: z.string().min(1).max(50).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(ReleaseStatus).optional(),
  targetDate: z.string().datetime().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.VIEW_GOVERNANCE);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const release = await prisma.release.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            component: {
              select: {
                id: true,
                name: true,
                category: true,
                instances: {
                  select: {
                    id: true,
                    displayName: true,
                    environment: { select: { id: true, name: true, type: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!release) {
      return NextResponse.json(
        { success: false, error: 'Release not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: release });
  } catch (error) {
    console.error('Failed to fetch release:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch release' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.MANAGE_GOVERNANCE);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = UpdateReleaseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { targetDate, ...updateData } = validation.data;

    const release = await prisma.release.update({
      where: { id },
      data: {
        ...updateData,
        ...(targetDate && { targetDate: new Date(targetDate) }),
      },
      include: {
        items: {
          include: {
            component: { select: { id: true, name: true, category: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: release });
  } catch (error) {
    console.error('Failed to update release:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update release' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(Permission.MANAGE_GOVERNANCE);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;

    // Check if release is deployed
    const release = await prisma.release.findUnique({
      where: { id },
      select: { status: true },
    });

    if (release?.status === ReleaseStatus.DEPLOYED) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete deployed release' },
        { status: 400 }
      );
    }

    // Delete items first
    await prisma.releaseItem.deleteMany({ where: { releaseId: id } });
    await prisma.release.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete release:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete release' },
      { status: 500 }
    );
  }
}
