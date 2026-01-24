// TelEnvIQ - Node Hosting Domains API
// GET /api/nodes/[id]/hosting-domains - Get hosting domains for node
// POST /api/nodes/[id]/hosting-domains - Assign node to hosting domain
// DELETE /api/nodes/[id]/hosting-domains - Remove node from hosting domain

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getNodeHostingDomains,
  assignNodeToHostingDomain,
  removeNodeFromHostingDomain,
} from '@/lib/services/hosting-domain';

const AssignHostingDomainSchema = z.object({
  hostingDomainId: z.string().uuid(),
  isPrimary: z.boolean().optional(),
  notes: z.string().optional(),
});

const RemoveHostingDomainSchema = z.object({
  hostingDomainId: z.string().uuid(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const domains = await getNodeHostingDomains(id);
    return NextResponse.json({ success: true, data: domains });
  } catch (error) {
    console.error('Failed to fetch node hosting domains:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch node hosting domains' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = AssignHostingDomainSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const assignment = await assignNodeToHostingDomain({
      nodeId: id,
      ...validation.data,
    });

    return NextResponse.json({ success: true, data: assignment }, { status: 201 });
  } catch (error) {
    console.error('Failed to assign hosting domain:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to assign hosting domain' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = RemoveHostingDomainSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    await removeNodeFromHostingDomain(id, validation.data.hostingDomainId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove hosting domain:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove hosting domain' },
      { status: 500 }
    );
  }
}
