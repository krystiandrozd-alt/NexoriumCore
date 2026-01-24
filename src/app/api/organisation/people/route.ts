// TelEnvIQ - People API
// GET /api/organisation/people - List all people
// POST /api/organisation/people - Create new person

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { PersonStatus } from '@prisma/client';

const CreatePersonSchema = z.object({
  displayName: z.string().min(1).max(255),
  email: z.string().email(),
  role: z.string().optional(),
  department: z.string().optional(),
  team: z.string().optional(),
  phone: z.string().optional(),
  externalId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as PersonStatus | null;
    const department = searchParams.get('department');
    const search = searchParams.get('search');

    const people = await prisma.person.findMany({
      where: {
        ...(status && { status }),
        ...(department && { department }),
        ...(search && {
          OR: [
            { displayName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      },
      include: {
        raciMappings: {
          take: 5,
          select: {
            raciRole: true,
            entityType: true,
            entityId: true,
          },
        },
        _count: {
          select: { raciMappings: true },
        },
      },
      orderBy: { displayName: 'asc' },
    });
    return NextResponse.json({ success: true, data: people });
  } catch (error) {
    console.error('Failed to fetch people:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch people' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = CreatePersonSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existing = await prisma.person.findUnique({
      where: { email: validation.data.email },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Person with this email already exists' },
        { status: 400 }
      );
    }

    const person = await prisma.person.create({
      data: validation.data,
    });

    return NextResponse.json({ success: true, data: person }, { status: 201 });
  } catch (error) {
    console.error('Failed to create person:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create person' },
      { status: 500 }
    );
  }
}
