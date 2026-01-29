// Nexorium Core - Connector Registry
// Central export for all auto-discovery connectors

export * from './base';
export * from './kubernetes';
export * from './gitops';
export * from './manual';

import { KubernetesConnector, type KubernetesConnectorConfig } from './kubernetes';
import { GitOpsConnector, type GitOpsConnectorConfig } from './gitops';
import { ManualConnector, type ManualConnectorConfig } from './manual';
import type { ConnectorResult } from '@/types';

export type ConnectorType = 'kubernetes' | 'gitops' | 'manual';

export interface ConnectorFactoryConfig {
  type: ConnectorType;
  environmentId: string;
  config: KubernetesConnectorConfig['kubernetes'] | GitOpsConnectorConfig['gitops'] | ManualConnectorConfig['manual'];
  resources?: unknown[];
  manifestContent?: string;
}

// Factory function to create appropriate connector
export function createConnector(factoryConfig: ConnectorFactoryConfig) {
  switch (factoryConfig.type) {
    case 'kubernetes':
      return new KubernetesConnector({
        environmentId: factoryConfig.environmentId,
        source: 'kubernetes',
        kubernetes: factoryConfig.config as KubernetesConnectorConfig['kubernetes'],
        resources: factoryConfig.resources as KubernetesConnectorConfig['resources'],
      });

    case 'gitops':
      return new GitOpsConnector({
        environmentId: factoryConfig.environmentId,
        source: 'gitops',
        gitops: factoryConfig.config as GitOpsConnectorConfig['gitops'],
        manifestContent: factoryConfig.manifestContent,
      });

    case 'manual':
      return new ManualConnector({
        environmentId: factoryConfig.environmentId,
        source: 'manual',
        manual: factoryConfig.config as ManualConnectorConfig['manual'],
      });

    default:
      throw new Error(`Unknown connector type: ${factoryConfig.type}`);
  }
}

// Run discovery and return results
export async function runDiscovery(
  factoryConfig: ConnectorFactoryConfig
): Promise<ConnectorResult> {
  const connector = createConnector(factoryConfig);
  const payload = await connector.discover();

  return {
    success: true,
    nodesDiscovered: payload.nodes.length,
    edgesDiscovered: payload.edges.length,
    errors: [],
    evidence: [],
  };
}
