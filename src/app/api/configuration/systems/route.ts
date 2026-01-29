// Nexorium Core - Systems (Components) API
// Manage component definitions in the system catalog

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';

// Validation schema
const createSystemSchema = z.object({
  name: z.string().min(1).max(100),
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

// GET - List all systems (components)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const layer = searchParams.get('layer');
    const category = searchParams.get('category');

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { vendor: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (layer) {
      where.layer = layer;
    }

    if (category) {
      where.category = category;
    }

    const components = await prisma.component.findMany({
      where,
      include: {
        _count: {
          select: {
            instances: true,
          },
        },
        itOwner: {
          select: { id: true, displayName: true, email: true },
        },
        productOwner: {
          select: { id: true, displayName: true, email: true },
        },
        devOpsLead: {
          select: { id: true, displayName: true, email: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const result = components.map((comp) => ({
      id: comp.id,
      name: comp.name,
      category: comp.category,
      vendor: comp.vendor,
      description: comp.description,
      layer: comp.layer,
      capabilityType: comp.capabilityType,
      instanceCount: comp._count.instances,
      itOwnerId: comp.itOwner?.id || null,
      productOwnerId: comp.productOwner?.id || null,
      devOpsLeadId: comp.devOpsLead?.id || null,
      itOwner: comp.itOwner,
      productOwner: comp.productOwner,
      devOpsLead: comp.devOpsLead,
      createdAt: comp.createdAt,
      updatedAt: comp.updatedAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching systems:', error);
    return NextResponse.json(
      { error: 'Failed to fetch systems' },
      { status: 500 }
    );
  }
}

// POST - Create new system (component)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createSystemSchema.parse(body);

    // Check for duplicate name
    const existing = await prisma.component.findUnique({
      where: { name: validated.name },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A system with this name already exists' },
        { status: 409 }
      );
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

    const component = await prisma.component.create({
      data: {
        name: validated.name,
        category: validated.category,
        vendor: validated.vendor,
        description: validated.description,
        layer: validated.layer || 'UNKNOWN',
        capabilityType: validated.capabilityType || 'UNKNOWN',
        itOwnerId: validated.itOwnerId || null,
        productOwnerId: validated.productOwnerId || null,
        devOpsLeadId: validated.devOpsLeadId || null,
      },
      include: {
        itOwner: { select: { id: true, displayName: true, email: true } },
        productOwner: { select: { id: true, displayName: true, email: true } },
        devOpsLead: { select: { id: true, displayName: true, email: true } },
      },
    });

    return NextResponse.json(component, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating system:', error);
    return NextResponse.json(
      { error: 'Failed to create system' },
      { status: 500 }
    );
  }
}
