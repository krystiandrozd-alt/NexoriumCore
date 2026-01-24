// TelEnvIQ - Dataset Compliance API
// GET /api/datasets/[id]/compliance - Get dataset compliance info
// PUT /api/datasets/[id]/compliance - Update dataset classification

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { updateDataClassification, getComplianceAudits } from '@/lib/services/governance/classification';
import prisma from '@/lib/db';

const UpdateComplianceSchema = z.object({
  dataClassification: z.enum(['PII', 'PCI', 'CONFIDENTIAL', 'NON_SENSITIVE']).optional(),
  maskingMethod: z.enum(['TOKENIZATION', 'STATIC_MASK', 'DYNAMIC_MASK', 'SYNTHETIC', 'NONE']).optional(),
  complianceFlags: z.array(z.enum(['GDPR', 'PCI_DSS', 'HIPAA', 'SOX', 'INTERNAL_POLICY', 'CCPA'])).optional(),
  derivedFromProdClone: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const dataset = await prisma.testDataSet.findUnique({
      where: { id },
      select: {
        id: true,
        dataClassification: true,
        maskingMethod: true,
        complianceFlags: true,
        derivedFromProdClone: true,
        approvedBy: true,
        approvalDate: true,
      },
    });

    if (!dataset) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      );
    }

    const audits = await getComplianceAudits(id, { limit: 5 });

    return NextResponse.json({
      success: true,
      data: {
        ...dataset,
        recentAudits: audits.items,
      },
    });
  } catch (error) {
    console.error('Failed to fetch dataset compliance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dataset compliance' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = UpdateComplianceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const updatedBy = request.headers.get('x-user-name') || 'system';
    const dataset = await updateDataClassification(id, validation.data, updatedBy);

    return NextResponse.json({ success: true, data: dataset });
  } catch (error) {
    console.error('Failed to update dataset compliance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update dataset compliance' },
      { status: 500 }
    );
  }
}
