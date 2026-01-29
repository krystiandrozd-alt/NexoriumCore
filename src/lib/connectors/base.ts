// Nexorium Core - Base Connector Interface
// All connectors implement this interface for consistent behavior

import type { ConnectorResult, Evidence, Node, Edge } from '@/types';

export interface ConnectorConfig {
  environmentId: string;
  source: string;
  dryRun?: boolean;
}

export interface DiscoveredNode {
  name: string;
  type: Node['type'];
  owner?: string;
  criticality?: Node['criticality'];
  metadata?: Record<string, unknown>;
}

export interface DiscoveredEdge {
  sourceNodeName: string;
  targetNodeName: string;
  protocol: Edge['protocol'];
  port?: number;
  pathOrTopic?: string;
  metadata?: Record<string, unknown>;
}

export interface DiscoveryPayload {
  nodes: DiscoveredNode[];
  edges: DiscoveredEdge[];
  databases?: Array<{
    nodeName: string;
    engine: string;
    version?: string;
    host?: string;
    port?: number;
  }>;
}

export abstract class BaseConnector {
  protected config: ConnectorConfig;
  protected errors: string[] = [];
  protected evidence: Evidence[] = [];

  constructor(config: ConnectorConfig) {
    this.config = config;
  }

  // Abstract method to be implemented by each connector
  abstract discover(): Promise<DiscoveryPayload>;

  // Create evidence record for audit trail
  protected createEvidence(
    entityType: Evidence['entityType'],
    entityId: string,
    payload: Record<string, unknown>,
    confidence: number = 1.0
  ): Evidence {
    return {
      id: crypto.randomUUID(),
      entityType,
      entityId,
      source: this.config.source,
      timestamp: new Date(),
      confidence,
      payload,
    };
  }

  // Add error to collection
  protected addError(message: string): void {
    this.errors.push(message);
  }

  // Get connector result summary
  protected getResult(payload: DiscoveryPayload): ConnectorResult {
    return {
      success: this.errors.length === 0,
      nodesDiscovered: payload.nodes.length,
      edgesDiscovered: payload.edges.length,
      errors: this.errors,
      evidence: this.evidence,
    };
  }

  // Validate discovered node
  protected validateNode(node: DiscoveredNode): boolean {
    if (!node.name || node.name.trim() === '') {
      this.addError('Node name is required');
      return false;
    }
    if (!node.type) {
      this.addError(`Node type is required for ${node.name}`);
      return false;
    }
    return true;
  }

  // Validate discovered edge
  protected validateEdge(edge: DiscoveredEdge): boolean {
    if (!edge.sourceNodeName || !edge.targetNodeName) {
      this.addError('Edge requires both source and target node names');
      return false;
    }
    if (!edge.protocol) {
      this.addError(`Protocol is required for edge ${edge.sourceNodeName} -> ${edge.targetNodeName}`);
      return false;
    }
    return true;
  }
}
