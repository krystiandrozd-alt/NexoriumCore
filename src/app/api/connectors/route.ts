// TelEnvIQ - Connectors API
// POST /api/connectors - Run discovery via connector

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createConnector } from '@/lib/connectors';
import { applyDiscoveryResults } from '@/lib/services/environment';

const KubernetesConfigSchema = z.object({
  namespace: z.string().optional(),
  labelSelector: z.string().optional(),
  includeServices: z.boolean().optional(),
  includeIngress: z.boolean().optional(),
});

const GitOpsConfigSchema = z.object({
  repositoryUrl: z.string().url(),
  branch: z.string().optional(),
  manifestPath: z.string().optional(),
});

const ManualConfigSchema = z.object({
  format: z.enum(['yaml', 'json']),
  content: z.string().min(1),
});

const ConnectorRequestSchema = z.object({
  environmentId: z.string().uuid(),
  type: z.enum(['kubernetes', 'gitops', 'manual']),
  dryRun: z.boolean().optional().default(false),
  config: z.union([KubernetesConfigSchema, GitOpsConfigSchema, ManualConfigSchema]),
  resources: z.array(z.unknown()).optional(),
  manifestContent: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = ConnectorRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { environmentId, type, dryRun, config, resources, manifestContent } = validation.data;

    // Create and run connector
    const connector = createConnector({
      type,
      environmentId,
      config,
      resources,
      manifestContent,
    });

    const discoveryPayload = await connector.discover();

    // If dry run, return discovery results without applying
    if (dryRun) {
      return NextResponse.json({
        success: true,
        data: {
          dryRun: true,
          nodesDiscovered: discoveryPayload.nodes.length,
          edgesDiscovered: discoveryPayload.edges.length,
          databasesDiscovered: discoveryPayload.databases?.length || 0,
          preview: {
            nodes: discoveryPayload.nodes.map(n => ({
              name: n.name,
              type: n.type,
              owner: n.owner,
            })),
            edges: discoveryPayload.edges.map(e => ({
              source: e.sourceNodeName,
              target: e.targetNodeName,
              protocol: e.protocol,
            })),
          },
        },
      });
    }

    // Apply discovery results
    const result = await applyDiscoveryResults(
      environmentId,
      discoveryPayload,
      `connector:${type}`
    );

    return NextResponse.json({
      success: true,
      data: {
        dryRun: false,
        nodesCreated: result.nodesCreated,
        nodesUpdated: result.nodesUpdated,
        edgesCreated: result.edgesCreated,
      },
    });
  } catch (error) {
    console.error('Connector error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run connector' },
      { status: 500 }
    );
  }
}
