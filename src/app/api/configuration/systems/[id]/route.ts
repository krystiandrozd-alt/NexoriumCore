// Nexorium Core - Single System (Component) API
// Get, update, and delete individual components

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';

// Validation schema
const updateSystemSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.enum(['BSS', 'OSS', 'INFRA', 'DATABASE', 'MESSAGING', 'INTEGRATION', 'SECURITY', 'MONITORING', 'OTHER']).optional(),
  vendor: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  layer: z.enum(['BSS', 'OSS', 'INFRA', 'EXTERNAL', 'UNKNOWN']).optional(),
  capabilityType: z.enum(['CPQ', 'CRM', 'BILLING', 'SOM', 'INVENTORY', 'ORCHESTRATOR', 'DB', 'MQ', 'API_GW', 'IDENTITY', 'ITSM', 'OTHER', 'UNKNOWN']).optional(),
  // Ownership fields
  itOwnerId: z.string().uuid().nullable().optional(),
  productOwnerId: z.string().uuid().nullable().optional(),
  devOpsLeadId: z.string().uuid().nullable().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get single system
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const component = await prisma.component.findUnique({
      where: { id },
      include: {
        instances: {
          include: {
            environment: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
        _count: {
          select: {
            instances: true,
          },
        },
        itOwner: {
          select: { id: true, displayName: true, email: true, role: true, department: true, team: true },
        },
        productOwner: {
          select: { id: true, displayName: true, email: true, role: true, department: true, team: true },
        },
        devOpsLead: {
          select: { id: true, displayName: true, email: true, role: true, department: true, team: true },
        },
      },
    });

    if (!component) {
      return NextResponse.json(
        { error: 'System not found' },
        { status: 404 }
      );
    }

    const result = {
      id: component.id,
      name: component.name,
      category: component.category,
      vendor: component.vendor,
      description: component.description,
      layer: component.layer,
      capabilityType: component.capabilityType,
      instanceCount: component._count.instances,
      instances: component.instances.map((inst) => ({
        id: inst.id,
        displayName: inst.displayName,
        environment: inst.environment,
      })),
      itOwnerId: component.itOwner?.id || null,
      productOwnerId: component.productOwner?.id || null,
      devOpsLeadId: component.devOpsLead?.id || null,
      itOwner: component.itOwner,
      productOwner: component.productOwner,
      devOpsLead: component.devOpsLead,
      createdAt: component.createdAt,
      updatedAt: component.updatedAt,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching system:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system' },
      { status: 500 }
    );
  }
}

// PUT - Update system
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateSystemSchema.parse(body);

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

    // Check for name conflicts if name is being changed
    if (validated.name && validated.name !== existing.name) {
      const nameConflict = await prisma.component.findUnique({
        where: { name: validated.name },
      });

      if (nameConflict) {
        return NextResponse.json(
          { error: 'A system with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Validate ownership references if provided
    const ownerIds = [
      validated.itOwnerId,
      validated.productOwnerId,
      validated.devOpsLeadId,
    ].filter((pid): pid is string => pid !== null && pid !== undefined);

    if (ownerIds.length > 0) {
      const validPersons = await prisma.person.findMany({
        where: { id: { in: ownerIds }, status: 'ACTIVE' },
        select: { id: true },
      });
      const validIds = new Set(validPersons.map((p) => p.id));
      const invalidIds = ownerIds.filter((pid) => !validIds.has(pid));
      if (invalidIds.length > 0) {
        return NextResponse.json(
          { error: 'One or more specified owners do not exist or are not active' },
          { status: 400 }
        );
      }
    }

    const component = await prisma.component.update({
      where: { id },
      data: validated,
      include: {
        itOwner: { select: { id: true, displayName: true, email: true } },
        productOwner: { select: { id: true, displayName: true, email: true } },
        devOpsLead: { select: { id: true, displayName: true, email: true } },
      },
    });

    return NextResponse.json(component);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating system:', error);
    return NextResponse.json(
      { error: 'Failed to update system' },
      { status: 500 }
    );
  }
}

// DELETE - Delete system
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // Check if system exists
    const existing = await prisma.component.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            instances: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'System not found' },
        { status: 404 }
      );
    }

    // Prevent deletion if system has instances
    if (existing._count.instances > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete system with active instances',
          instanceCount: existing._count.instances,
        },
        { status: 409 }
      );
    }

    await prisma.component.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting system:', error);
    return NextResponse.json(
      { error: 'Failed to delete system' },
      { status: 500 }
    );
  }
}
