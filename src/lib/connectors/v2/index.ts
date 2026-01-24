// TelEnvIQ - Connector V2 Framework
// 5-layer canonical data model connectors

export * from './types';
export * from './base-connector';
export * from './mock-connector';
export * from './config-repo-connector';
export * from './cloud-connector';
export * from './terraform-connector';
export * from './csv-connector';

import { MockConnector, type MockConnectorConfig } from './mock-connector';
import { ConfigRepoConnector } from './config-repo-connector';
import { CloudConnector, type CloudProviderType } from './cloud-connector';
import { TerraformConnector } from './terraform-connector';
import { CSVConnector } from './csv-connector';
import type { ConnectorResult } from './types';

export type ConnectorType = 'mock' | 'config-repo' | 'cloud-aws' | 'cloud-azure' | 'cloud-gcp' | 'terraform' | 'csv';

export interface ConnectorFactoryOptions {
  type: ConnectorType;
  environmentId: string;
  dryRun?: boolean;
  options?: Record<string, unknown>;
}

/**
 * Factory function to create connectors
 */
export function createConnectorV2(factoryOptions: ConnectorFactoryOptions) {
  const baseConfig = {
    environmentId: factoryOptions.environmentId,
    connectorType: factoryOptions.type,
    dryRun: factoryOptions.dryRun,
  };

  switch (factoryOptions.type) {
    case 'mock':
      return new MockConnector({
        ...baseConfig,
        ...(factoryOptions.options as Partial<MockConnectorConfig>),
      });

    case 'config-repo':
      if (!factoryOptions.options?.manifestPath) {
        throw new Error('manifestPath is required for config-repo connector');
      }
      return new ConfigRepoConnector({
        ...baseConfig,
        manifestPath: factoryOptions.options.manifestPath as string,
        recursive: factoryOptions.options.recursive as boolean,
      });

    case 'cloud-aws':
      if (!factoryOptions.options?.fixturePath) {
        throw new Error('fixturePath is required for cloud connector');
      }
      return new CloudConnector({
        ...baseConfig,
        provider: 'aws' as CloudProviderType,
        fixturePath: factoryOptions.options.fixturePath as string,
        region: factoryOptions.options.region as string,
        accountId: factoryOptions.options.accountId as string,
      });

    case 'cloud-azure':
      if (!factoryOptions.options?.fixturePath) {
        throw new Error('fixturePath is required for cloud connector');
      }
      return new CloudConnector({
        ...baseConfig,
        provider: 'azure' as CloudProviderType,
        fixturePath: factoryOptions.options.fixturePath as string,
        region: factoryOptions.options.region as string,
      });

    case 'cloud-gcp':
      if (!factoryOptions.options?.fixturePath) {
        throw new Error('fixturePath is required for cloud connector');
      }
      return new CloudConnector({
        ...baseConfig,
        provider: 'gcp' as CloudProviderType,
        fixturePath: factoryOptions.options.fixturePath as string,
        region: factoryOptions.options.region as string,
      });

    case 'terraform':
      if (!factoryOptions.options?.statePath) {
        throw new Error('statePath is required for terraform connector');
      }
      return new TerraformConnector({
        ...baseConfig,
        statePath: factoryOptions.options.statePath as string,
      });

    case 'csv':
      return new CSVConnector({
        ...baseConfig,
        hostsPath: factoryOptions.options?.hostsPath as string,
        componentsPath: factoryOptions.options?.componentsPath as string,
        instancesPath: factoryOptions.options?.instancesPath as string,
        endpointsPath: factoryOptions.options?.endpointsPath as string,
        versionsPath: factoryOptions.options?.versionsPath as string,
        connectionsPath: factoryOptions.options?.connectionsPath as string,
      });

    default:
      throw new Error(`Unknown connector type: ${factoryOptions.type}`);
  }
}

/**
 * Run a connector and return results
 */
export async function runConnectorV2(factoryOptions: ConnectorFactoryOptions): Promise<ConnectorResult> {
  const connector = createConnectorV2(factoryOptions);
  return connector.run();
}

/**
 * Get available connector types with metadata
 */
export function getAvailableConnectors() {
  return [
    {
      type: 'mock' as ConnectorType,
      name: 'Mock Connector',
      description: 'Generates realistic telco environment data for testing and demos',
      requiredOptions: [],
      optionalOptions: ['seed', 'driftEnabled', 'componentCount'],
    },
    {
      type: 'config-repo' as ConnectorType,
      name: 'Config Repository',
      description: 'Reads YAML/JSON topology manifests from a folder',
      requiredOptions: ['manifestPath'],
      optionalOptions: ['recursive'],
    },
    {
      type: 'cloud-aws' as ConnectorType,
      name: 'AWS Control Plane',
      description: 'Imports VPCs, EC2 instances, load balancers from AWS',
      requiredOptions: ['fixturePath'],
      optionalOptions: ['region', 'accountId'],
    },
    {
      type: 'cloud-azure' as ConnectorType,
      name: 'Azure Control Plane',
      description: 'Imports VNets, VMs, load balancers from Azure',
      requiredOptions: ['fixturePath'],
      optionalOptions: ['region'],
    },
    {
      type: 'cloud-gcp' as ConnectorType,
      name: 'GCP Control Plane',
      description: 'Imports VPCs, Compute instances from GCP',
      requiredOptions: ['fixturePath'],
      optionalOptions: ['region'],
    },
    {
      type: 'terraform' as ConnectorType,
      name: 'Terraform State',
      description: 'Reads Terraform state files to extract infrastructure',
      requiredOptions: ['statePath'],
      optionalOptions: [],
    },
    {
      type: 'csv' as ConnectorType,
      name: 'CSV Import',
      description: 'Import hosts, components, connections from CSV files',
      requiredOptions: [],
      optionalOptions: ['hostsPath', 'componentsPath', 'instancesPath', 'endpointsPath', 'versionsPath', 'connectionsPath'],
    },
  ];
}
