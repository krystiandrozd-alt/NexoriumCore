// TelEnvIQ - Config Repository Connector
// Reads YAML/JSON topology manifests from a configured folder

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { BaseConnectorV2 } from './base-connector';
import type {
  ConnectorConfig,
  CanonicalDiscoveryPayload,
  DiscoveredComponent,
  DiscoveredComponentInstance,
  DiscoveredEndpoint,
  DiscoveredDeployedVersion,
  DiscoveredConnection,
} from './types';

export interface ConfigRepoConnectorConfig extends ConnectorConfig {
  // Path to the manifest file or directory
  manifestPath: string;
  // If true, read all .yaml/.json files in directory
  recursive?: boolean;
}

interface ManifestComponent {
  name: string;
  component: string;
  host?: string;
  version: string;
  buildRef?: string;
  vendorVersion?: string;
  endpoints?: Array<{
    port: number;
    scheme?: string;
    path?: string;
  }>;
  connections?: Array<{
    to: string;
    protocol: string;
    detail?: string;
    port?: number;
  }>;
}

interface ManifestFile {
  environment?: {
    name: string;
    type: string;
    description?: string;
  };
  components: ManifestComponent[];
}

export class ConfigRepoConnector extends BaseConnectorV2 {
  readonly connectorType = 'config-repo';
  private repoConfig: ConfigRepoConnectorConfig;

  constructor(config: ConfigRepoConnectorConfig) {
    super(config);
    this.repoConfig = config;
  }

  async fetch(): Promise<ManifestFile[]> {
    const manifests: ManifestFile[] = [];
    const manifestPath = this.repoConfig.manifestPath;

    try {
      const stat = fs.statSync(manifestPath);

      if (stat.isFile()) {
        const content = this.readManifestFile(manifestPath);
        if (content) manifests.push(content);
      } else if (stat.isDirectory()) {
        const files = fs.readdirSync(manifestPath);
        for (const file of files) {
          if (file.endsWith('.yaml') || file.endsWith('.yml') || file.endsWith('.json')) {
            const filePath = path.join(manifestPath, file);
            const content = this.readManifestFile(filePath);
            if (content) manifests.push(content);
          }
        }
      }
    } catch (error) {
      this.addError(`Failed to read manifest path ${manifestPath}: ${error}`);
    }

    return manifests;
  }

  private readManifestFile(filePath: string): ManifestFile | null {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');

      if (filePath.endsWith('.json')) {
        return JSON.parse(content) as ManifestFile;
      } else {
        return yaml.load(content) as ManifestFile;
      }
    } catch (error) {
      this.addWarning(`Failed to parse manifest file ${filePath}: ${error}`);
      return null;
    }
  }

  async map(rawData: ManifestFile[]): Promise<CanonicalDiscoveryPayload> {
    const components: DiscoveredComponent[] = [];
    const componentInstances: DiscoveredComponentInstance[] = [];
    const endpoints: DiscoveredEndpoint[] = [];
    const deployedVersions: DiscoveredDeployedVersion[] = [];
    const connections: DiscoveredConnection[] = [];
    const componentNameSet = new Set<string>();

    for (const manifest of rawData) {
      for (const comp of manifest.components || []) {
        // Add component to catalog if not already added
        if (!componentNameSet.has(comp.component)) {
          components.push({
            name: comp.component,
            category: this.inferCategory(comp.component),
          });
          componentNameSet.add(comp.component);
        }

        // Create component instance
        const instanceDisplayName = `${comp.component} (${comp.name})`;
        componentInstances.push({
          externalId: comp.name,
          componentName: comp.component,
          hostRef: comp.host,
          displayName: instanceDisplayName,
        });

        // Add endpoints
        if (comp.endpoints) {
          for (const ep of comp.endpoints) {
            endpoints.push({
              componentInstanceRef: instanceDisplayName,
              kind: 'URL',
              value: `${comp.name}:${ep.port}`,
              port: ep.port,
              scheme: this.mapScheme(ep.scheme),
              basePath: ep.path,
            });
          }
        }

        // Add deployed version
        deployedVersions.push({
          componentInstanceRef: instanceDisplayName,
          projectVersion: comp.version,
          vendorVersion: comp.vendorVersion,
          buildRef: comp.buildRef,
        });

        // Add connections
        if (comp.connections) {
          for (const conn of comp.connections) {
            // Find the target component's display name
            const targetComp = manifest.components.find(c => c.name === conn.to);
            const targetDisplayName = targetComp
              ? `${targetComp.component} (${targetComp.name})`
              : conn.to;

            connections.push({
              fromComponentRef: instanceDisplayName,
              toComponentRef: targetDisplayName,
              protocolType: this.mapProtocol(conn.protocol),
              protocolDetail: conn.detail,
              port: conn.port,
            });
          }
        }
      }
    }

    return {
      networkContexts: [],
      hosts: [],
      components,
      componentInstances,
      endpoints,
      deployedVersions,
      connections,
    };
  }

  private inferCategory(componentName: string): 'BSS' | 'OSS' | 'DATABASE' | 'MESSAGING' | 'INTEGRATION' | 'OTHER' {
    const lower = componentName.toLowerCase();
    if (lower.includes('oracle') || lower.includes('postgres') || lower.includes('mysql') || lower.includes('mongodb') || lower.includes('redis')) {
      return 'DATABASE';
    }
    if (lower.includes('kafka') || lower.includes('mq') || lower.includes('rabbit')) {
      return 'MESSAGING';
    }
    if (lower.includes('gateway') || lower.includes('mulesoft') || lower.includes('wso2') || lower.includes('kong')) {
      return 'INTEGRATION';
    }
    if (lower.includes('enm') || lower.includes('nsp') || lower.includes('servicenow') || lower.includes('remedy')) {
      return 'OSS';
    }
    if (lower.includes('crm') || lower.includes('som') || lower.includes('brm') || lower.includes('nso') || lower.includes('cpq') || lower.includes('tmf')) {
      return 'BSS';
    }
    return 'OTHER';
  }

  private mapScheme(scheme?: string): 'HTTP' | 'HTTPS' | 'TCP' | 'JDBC' | 'GRPC' | 'AMQP' | undefined {
    if (!scheme) return undefined;
    const upper = scheme.toUpperCase();
    if (upper === 'HTTP') return 'HTTP';
    if (upper === 'HTTPS') return 'HTTPS';
    if (upper === 'TCP') return 'TCP';
    if (upper === 'JDBC') return 'JDBC';
    if (upper === 'GRPC') return 'GRPC';
    if (upper === 'AMQP') return 'AMQP';
    return 'TCP';
  }

  private mapProtocol(protocol: string): 'REST' | 'SOAP' | 'TCP' | 'SFTP' | 'GRPC' | 'MQ' | 'JDBC' | 'OTHER' {
    const upper = protocol.toUpperCase();
    if (upper === 'REST' || upper === 'HTTP' || upper === 'HTTPS') return 'REST';
    if (upper === 'SOAP') return 'SOAP';
    if (upper === 'TCP') return 'TCP';
    if (upper === 'SFTP' || upper === 'FTP') return 'SFTP';
    if (upper === 'GRPC') return 'GRPC';
    if (upper === 'MQ' || upper === 'KAFKA' || upper === 'AMQP' || upper === 'JMS') return 'MQ';
    if (upper === 'JDBC' || upper === 'SQL') return 'JDBC';
    return 'OTHER';
  }
}
