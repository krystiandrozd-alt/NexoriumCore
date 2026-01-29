// Nexorium Core - Connector Run API
// POST /api/connectors/run - Run a connector

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { runConnectorV2, type ConnectorType } from '@/lib/connectors/v2';
import path from 'path';
import { requirePermission } from '@/lib/auth/api-auth';
import { Permission } from '@/lib/services/security/roles';

const RunConnectorSchema = z.object({
  environmentId: z.string().uuid(),
  connectorType: z.enum(['mock', 'config-repo', 'cloud-aws', 'cloud-azure', 'cloud-gcp', 'terraform', 'csv']),
  dryRun: z.boolean().optional(),
  options: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requirePermission(Permission.MANAGE_CREDENTIALS);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const validation = RunConnectorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { environmentId, connectorType, dryRun, options } = validation.data;

    // For MVP, auto-configure fixture paths for cloud/terraform connectors
    const fixturesDir = path.join(process.cwd(), 'fixtures');
    let finalOptions = options || {};

    switch (connectorType) {
      case 'cloud-aws':
        finalOptions = {
          ...finalOptions,
          fixturePath: finalOptions.fixturePath || path.join(fixturesDir, 'cloud/aws/sit-environment.json'),
        };
        break;
      case 'cloud-azure':
        finalOptions = {
          ...finalOptions,
          fixturePath: finalOptions.fixturePath || path.join(fixturesDir, 'cloud/azure/sit-environment.json'),
        };
        break;
      case 'cloud-gcp':
        finalOptions = {
          ...finalOptions,
          fixturePath: finalOptions.fixturePath || path.join(fixturesDir, 'cloud/gcp/sit-environment.json'),
        };
        break;
      case 'terraform':
        finalOptions = {
          ...finalOptions,
          statePath: finalOptions.statePath || path.join(fixturesDir, 'terraform/sit-state.json'),
        };
        break;
      case 'config-repo':
        finalOptions = {
          ...finalOptions,
          manifestPath: finalOptions.manifestPath || path.join(fixturesDir, 'config-repo/sit-topology.yaml'),
        };
        break;
    }

    const result = await runConnectorV2({
      type: connectorType as ConnectorType,
      environmentId,
      dryRun,
      options: finalOptions,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to run connector:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to run connector' },
      { status: 500 }
    );
  }
}
