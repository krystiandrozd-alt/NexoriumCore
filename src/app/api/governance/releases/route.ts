// Nexorium Core - Releases API
// GET /api/governance/releases - List all releases
// POST /api/governance/releases - Create new release

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { ReleaseStatus } from '@prisma/client';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const CreateReleaseSchema = z.object({
  name: z.string().min(1).max(255),
  version: z.string().min(1).max(50),
  description: z.string().optional(),
  targetDate: z.string().datetime().optional(),
  componentIds: z.array(z.string().uuid()).optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requirePermission(Permission.VIEW_GOVERNANCE);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ReleaseStatus | null;

    const releases = await prisma.release.findMany({
      where: {
        ...(status && { status }),
      },
      include: {
        items: {
          include: {
            component: {
              select: { id: true, name: true, category: true },
            },
          },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: releases });
  } catch (error) {
    console.error('Failed to fetch releases:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch releases' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(Permission.MANAGE_GOVERNANCE);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const validation = CreateReleaseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { componentIds, targetDate, ...releaseData } = validation.data;

    const release = await prisma.release.create({
      data: {
        ...releaseData,
        targetDate: targetDate ? new Date(targetDate) : undefined,
        items: componentIds?.length
          ? {
              create: componentIds.map((componentId) => ({
                componentId,
                targetVersion: 'TBD',
              })),
            }
          : undefined,
      },
      include: {
        items: {
          include: {
            component: { select: { id: true, name: true, category: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: release }, { status: 201 });
  } catch (error) {
    console.error('Failed to create release:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create release' },
      { status: 500 }
    );
  }
}
