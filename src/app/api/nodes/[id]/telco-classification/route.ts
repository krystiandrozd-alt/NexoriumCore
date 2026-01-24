// TelEnvIQ - Node Telco Classification API
// GET /api/nodes/[id]/telco-classification - Get telco classification
// PUT /api/nodes/[id]/telco-classification - Update telco classification

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getNodeTelcoClassification, updateTelcoClassification } from '@/lib/services/telco-classification';

const UpdateTelcoClassificationSchema = z.object({
  telcoLayer: z.enum(['BSS', 'OSS', 'NETWORK', 'SHARED', 'EXTERNAL']).optional(),
  telcoSubsystem: z.enum([
    'CRM', 'CPQ', 'BILLING', 'ORDER_MANAGEMENT', 'REVENUE_ASSURANCE',
    'DUNNING', 'COLLECTIONS', 'PRODUCT_CATALOG', 'MEDIATION', 'RATING',
    'PROVISIONING', 'ACTIVATION', 'INVENTORY', 'FAULT_MANAGEMENT',
    'PERFORMANCE_MANAGEMENT', 'SERVICE_ASSURANCE', 'NETWORK_MONITORING',
    'AAA', 'HSS', 'PCRF', 'SMSC', 'MMSC', 'IMS', 'VAS',
    'CHANNEL', 'API_GATEWAY', 'INTEGRATION', 'DATA_WAREHOUSE', 'ANALYTICS', 'OTHER'
  ]).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const classification = await getNodeTelcoClassification(id);

    if (!classification) {
      return NextResponse.json(
        { success: false, error: 'Node not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: classification });
  } catch (error) {
    console.error('Failed to fetch telco classification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch telco classification' },
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
    const validation = UpdateTelcoClassificationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const updatedBy = request.headers.get('x-user-name') || 'system';
    const node = await updateTelcoClassification(id, validation.data, updatedBy);

    return NextResponse.json({ success: true, data: node });
  } catch (error) {
    console.error('Failed to update telco classification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update telco classification' },
      { status: 500 }
    );
  }
}
