// Nexorium Core - System Ownership API
// GET/PUT /api/configuration/systems/[id]/ownership

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';

// Validation schema for ownership update
const updateOwnershipSchema = z.object({
  itOwnerId: z.string().uuid().nullable().optional(),
  productOwnerId: z.string().uuid().nullable().optional(),
  devOpsLeadId: z.string().uuid().nullable().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get system ownership
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const component = await prisma.component.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        itOwnerId: true,
        productOwnerId: true,
        devOpsLeadId: true,
        itOwner: {
          select: {
            id: true,
            displayName: true,
            email: true,
            role: true,
            department: true,
            team: true,
          },
        },
        productOwner: {
          select: {
            id: true,
            displayName: true,
            email: true,
            role: true,
            department: true,
            team: true,
          },
        },
        devOpsLead: {
          select: {
            id: true,
            displayName: true,
            email: true,
            role: true,
            department: true,
            team: true,
          },
        },
      },
    });

    if (!component) {
      return NextResponse.json(
        { error: 'System not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      componentId: component.id,
      componentName: component.name,
      itOwner: component.itOwner,
      productOwner: component.productOwner,
      devOpsLead: component.devOpsLead,
    });
  } catch (error) {
    console.error('Error fetching system ownership:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system ownership' },
      { status: 500 }
    );
  }
}

// PUT - Update system ownership
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateOwnershipSchema.parse(body);

    // Check if system exists
    const existing = await prisma.component.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'System not found' },
        { status: 404 }
      );
    }

    // Validate that referenced persons exist and are active
    const personIds = [
      validated.itOwnerId,
      validated.productOwnerId,
      validated.devOpsLeadId,
    ].filter((pid): pid is string => pid !== null && pid !== undefined);

    if (personIds.length > 0) {
      const validPersons = await prisma.person.findMany({
        where: {
          id: { in: personIds },
          status: 'ACTIVE',
        },
        select: { id: true },
      });

      const validIds = new Set(validPersons.map((p) => p.id));
      const invalidIds = personIds.filter((pid) => !validIds.has(pid));

      if (invalidIds.length > 0) {
        return NextResponse.json(
          { error: 'One or more specified persons do not exist or are not active' },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: Record<string, string | null> = {};
    if (validated.itOwnerId !== undefined) {
      updateData.itOwnerId = validated.itOwnerId;
    }
    if (validated.productOwnerId !== undefined) {
      updateData.productOwnerId = validated.productOwnerId;
    }
    if (validated.devOpsLeadId !== undefined) {
      updateData.devOpsLeadId = validated.devOpsLeadId;
    }

    const component = await prisma.component.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        itOwner: {
          select: {
            id: true,
            displayName: true,
            email: true,
            role: true,
            department: true,
            team: true,
          },
        },
        productOwner: {
          select: {
            id: true,
            displayName: true,
            email: true,
            role: true,
            department: true,
            team: true,
          },
        },
        devOpsLead: {
          select: {
            id: true,
            displayName: true,
            email: true,
            role: true,
            department: true,
            team: true,
          },
        },
      },
    });

    return NextResponse.json({
      componentId: component.id,
      componentName: component.name,
      itOwner: component.itOwner,
      productOwner: component.productOwner,
      devOpsLead: component.devOpsLead,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating system ownership:', error);
    return NextResponse.json(
      { error: 'Failed to update system ownership' },
      { status: 500 }
    );
  }
}
