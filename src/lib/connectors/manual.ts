// TelEnvIQ - Manual Import Connector
// Support for manual YAML/JSON topology imports

import { BaseConnector, type ConnectorConfig, type DiscoveryPayload, type DiscoveredNode, type DiscoveredEdge } from './base';
import yaml from 'js-yaml';
import type { ManualImportConfig, NodeType, Protocol } from '@/types';
import { z } from 'zod';

// Validation schemas for manual import
const NodeSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['APPLICATION', 'SERVICE', 'DATABASE', 'GATEWAY', 'EXTERNAL', 'RUNTIME', 'MESSAGE_QUEUE', 'LOAD_BALANCER']),
  owner: z.string().optional(),
  criticality: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().default('MEDIUM'),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const EdgeSchema = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  protocol: z.enum(['REST', 'GRPC', 'MQ', 'JDBC', 'SFTP', 'EVENT', 'WEBSOCKET', 'SOAP', 'GRAPHQL']),
  port: z.number().optional(),
  path: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const DatabaseSchema = z.object({
  node: z.string().min(1),
  engine: z.string().min(1),
  version: z.string().optional(),
  host: z.string().optional(),
  port: z.number().optional(),
  testData: z.object({
    sourceType: z.enum(['PROD_CLONE', 'MASKED', 'SYNTHETIC', 'STATIC']),
    lastRefreshDate: z.string().optional(),
    refreshMethod: z.enum(['MANUAL', 'PIPELINE', 'SCRIPT', 'AUTOMATED']).optional(),
    maskingPolicyVersion: z.string().optional(),
    owner: z.string().optional(),
    downstreamConsumers: z.array(z.string()).optional(),
  }).optional(),
});

const ManualImportSchema = z.object({
  version: z.string().optional().default('1.0'),
  environment: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema).optional().default([]),
  databases: z.array(DatabaseSchema).optional().default([]),
});

export interface ManualConnectorConfig extends ConnectorConfig {
  manual: ManualImportConfig;
}

export class ManualConnector extends BaseConnector {
  private manualConfig: ManualImportConfig;

  constructor(config: ManualConnectorConfig) {
    super({
      environmentId: config.environmentId,
      source: 'manual-import',
      dryRun: config.dryRun,
    });
    this.manualConfig = config.manual;
  }

  async discover(): Promise<DiscoveryPayload> {
    const nodes: DiscoveredNode[] = [];
    const edges: DiscoveredEdge[] = [];
    const databases: DiscoveryPayload['databases'] = [];

    // Parse content based on format
    let parsed: unknown;
    try {
      if (this.manualConfig.format === 'json') {
        parsed = JSON.parse(this.manualConfig.content);
      } else {
        parsed = yaml.load(this.manualConfig.content);
      }
    } catch (parseError) {
      this.addError(`Failed to parse ${this.manualConfig.format.toUpperCase()}: ${parseError}`);
      return { nodes, edges, databases };
    }

    // Validate against schema
    const validationResult = ManualImportSchema.safeParse(parsed);
    if (!validationResult.success) {
      for (const error of validationResult.error.issues) {
        this.addError(`Validation error at ${error.path.join('.')}: ${error.message}`);
      }
      return { nodes, edges, databases };
    }

    const data = validationResult.data;

    // Process nodes
    for (const nodeData of data.nodes) {
      const node: DiscoveredNode = {
        name: nodeData.name,
        type: nodeData.type as NodeType,
        owner: nodeData.owner,
        criticality: nodeData.criticality as DiscoveredNode['criticality'],
        metadata: nodeData.metadata as Record<string, unknown>,
      };

      if (this.validateNode(node)) {
        nodes.push(node);

        this.evidence.push(
          this.createEvidence('NODE', node.name, {
            source: 'manual-import',
            originalData: nodeData,
          })
        );
      }
    }

    // Build node name set for edge validation
    const nodeNames = new Set(nodes.map(n => n.name));

    // Process edges
    for (const edgeData of data.edges) {
      // Validate source and target exist
      if (!nodeNames.has(edgeData.source)) {
        this.addError(`Edge source node not found: ${edgeData.source}`);
        continue;
      }
      if (!nodeNames.has(edgeData.target)) {
        this.addError(`Edge target node not found: ${edgeData.target}`);
        continue;
      }

      const edge: DiscoveredEdge = {
        sourceNodeName: edgeData.source,
        targetNodeName: edgeData.target,
        protocol: edgeData.protocol as Protocol,
        port: edgeData.port,
        pathOrTopic: edgeData.path,
        metadata: edgeData.metadata as Record<string, unknown>,
      };

      if (this.validateEdge(edge)) {
        edges.push(edge);

        this.evidence.push(
          this.createEvidence('EDGE', `${edge.sourceNodeName}->${edge.targetNodeName}`, {
            source: 'manual-import',
            originalData: edgeData,
          })
        );
      }
    }

    // Process databases
    for (const dbData of data.databases) {
      if (!nodeNames.has(dbData.node)) {
        this.addError(`Database node not found: ${dbData.node}`);
        continue;
      }

      databases.push({
        nodeName: dbData.node,
        engine: dbData.engine,
        version: dbData.version,
        host: dbData.host,
        port: dbData.port,
      });

      this.evidence.push(
        this.createEvidence('DATABASE', dbData.node, {
          source: 'manual-import',
          originalData: dbData,
        })
      );
    }

    return { nodes, edges, databases };
  }
}

// Export validation schema for API use
export { ManualImportSchema };

// Sample template for manual import
export const MANUAL_IMPORT_TEMPLATE = `# TelEnvIQ Manual Import Template
version: "1.0"

environment:
  name: "My Environment"
  description: "Description of the environment"

nodes:
  - name: "api-gateway"
    type: "GATEWAY"
    owner: "platform-team"
    criticality: "CRITICAL"
    metadata:
      version: "2.1.0"

  - name: "order-service"
    type: "SERVICE"
    owner: "commerce-team"
    criticality: "HIGH"

  - name: "customer-service"
    type: "SERVICE"
    owner: "customer-team"
    criticality: "HIGH"

  - name: "orders-db"
    type: "DATABASE"
    owner: "commerce-team"
    criticality: "HIGH"

  - name: "message-broker"
    type: "MESSAGE_QUEUE"
    owner: "platform-team"
    criticality: "CRITICAL"

edges:
  - source: "api-gateway"
    target: "order-service"
    protocol: "REST"
    port: 8080
    path: "/api/orders"

  - source: "api-gateway"
    target: "customer-service"
    protocol: "REST"
    port: 8080
    path: "/api/customers"

  - source: "order-service"
    target: "orders-db"
    protocol: "JDBC"
    port: 5432

  - source: "order-service"
    target: "message-broker"
    protocol: "MQ"
    port: 5672
    path: "orders.events"

  - source: "order-service"
    target: "customer-service"
    protocol: "REST"
    port: 8080
    path: "/api/customers/{id}"

databases:
  - node: "orders-db"
    engine: "PostgreSQL"
    version: "15.2"
    host: "orders-db.internal"
    port: 5432
    testData:
      sourceType: "MASKED"
      lastRefreshDate: "2024-01-15"
      refreshMethod: "PIPELINE"
      maskingPolicyVersion: "v2.1"
      owner: "data-team"
      downstreamConsumers:
        - "order-service"
        - "reporting-service"
`;
