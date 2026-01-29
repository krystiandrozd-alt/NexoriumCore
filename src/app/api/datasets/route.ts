// Nexorium Core - Test Data Sets API
// GET /api/datasets?environmentId=xxx - List test data sets
// POST /api/datasets - Create new test data set

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getTestDataSets, createTestDataSet, getDatasetsNeedingRefresh } from '@/lib/services/testdata';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const CreateDataSetSchema = z.object({
  databaseId: z.string().uuid(),
  sourceType: z.enum(['PROD_CLONE', 'MASKED', 'SYNTHETIC', 'STATIC']),
  refreshMethod: z.enum(['MANUAL', 'PIPELINE', 'SCRIPT', 'AUTOMATED']).optional(),
  maskingPolicyVersion: z.string().optional(),
  owner: z.string().optional(),
  downstreamConsumers: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requirePermission(Permission.VIEW_DATA);
  if (auth.error) return auth.error;

  try {
    const searchParams = request.nextUrl.searchParams;
    const environmentId = searchParams.get('environmentId');
    const needsRefresh = searchParams.get('needsRefresh') === 'true';
    const thresholdDays = searchParams.get('thresholdDays')
      ? parseInt(searchParams.get('thresholdDays')!)
      : 30;

    if (!environmentId) {
      return NextResponse.json(
        { success: false, error: 'environmentId is required' },
        { status: 400 }
      );
    }

    let datasets;
    if (needsRefresh) {
      datasets = await getDatasetsNeedingRefresh(environmentId, thresholdDays);
    } else {
      datasets = await getTestDataSets(environmentId);
    }

    return NextResponse.json({ success: true, data: datasets });
  } catch (error) {
    console.error('Failed to fetch datasets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch datasets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(Permission.MANAGE_DATA);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const validation = CreateDataSetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const dataset = await createTestDataSet(validation.data);
    return NextResponse.json({ success: true, data: dataset }, { status: 201 });
  } catch (error) {
    console.error('Failed to create dataset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create dataset' },
      { status: 500 }
    );
  }
}
