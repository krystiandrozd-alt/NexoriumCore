// TelEnvIQ - CSV Import Connector
// Simple CSV import for hosts, components, and connections

import * as fs from 'fs';
import { BaseConnectorV2 } from './base-connector';
import type {
  ConnectorConfig,
  CanonicalDiscoveryPayload,
  DiscoveredHost,
  DiscoveredComponent,
  DiscoveredComponentInstance,
  DiscoveredEndpoint,
  DiscoveredDeployedVersion,
  DiscoveredConnection,
} from './types';

export interface CSVConnectorConfig extends ConnectorConfig {
  // Paths to CSV files (any can be omitted)
  hostsPath?: string;
  componentsPath?: string;
  instancesPath?: string;
  endpointsPath?: string;
  versionsPath?: string;
  connectionsPath?: string;
}

export class CSVConnector extends BaseConnectorV2 {
  readonly connectorType = 'csv';
  private csvConfig: CSVConnectorConfig;

  constructor(config: CSVConnectorConfig) {
    super(config);
    this.csvConfig = config;
  }

  async fetch(): Promise<{
    hosts: string[][];
    components: string[][];
    instances: string[][];
    endpoints: string[][];
    versions: string[][];
    connections: string[][];
  }> {
    return {
      hosts: this.readCSV(this.csvConfig.hostsPath),
      components: this.readCSV(this.csvConfig.componentsPath),
      instances: this.readCSV(this.csvConfig.instancesPath),
      endpoints: this.readCSV(this.csvConfig.endpointsPath),
      versions: this.readCSV(this.csvConfig.versionsPath),
      connections: this.readCSV(this.csvConfig.connectionsPath),
    };
  }

  private readCSV(filePath?: string): string[][] {
    if (!filePath) return [];

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      return lines.map(line => this.parseCSVLine(line));
    } catch (error) {
      this.addWarning(`Failed to read CSV file ${filePath}: ${error}`);
      return [];
    }
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  async map(rawData: {
    hosts: string[][];
    components: string[][];
    instances: string[][];
    endpoints: string[][];
    versions: string[][];
    connections: string[][];
  }): Promise<CanonicalDiscoveryPayload> {
    const hosts: DiscoveredHost[] = [];
    const components: DiscoveredComponent[] = [];
    const componentInstances: DiscoveredComponentInstance[] = [];
    const endpoints: DiscoveredEndpoint[] = [];
    const deployedVersions: DiscoveredDeployedVersion[] = [];
    const connections: DiscoveredConnection[] = [];

    // Parse hosts CSV
    // Expected format: hostname,ip,nat_ip,os,notes
    const hostsData = rawData.hosts.slice(1); // Skip header
    for (const row of hostsData) {
      if (row.length < 2) continue;
      hosts.push({
        hostname: row[0],
        ip: row[1] || undefined,
        natIp: row[2] || undefined,
        os: row[3] || undefined,
        notes: row[4] || undefined,
      });
    }

    // Parse components CSV
    // Expected format: name,category,vendor,description
    const componentsData = rawData.components.slice(1);
    for (const row of componentsData) {
      if (row.length < 1) continue;
      components.push({
        name: row[0],
        category: this.mapCategory(row[1]),
        vendor: row[2] || undefined,
        description: row[3] || undefined,
      });
    }

    // Parse instances CSV
    // Expected format: display_name,component_name,host_ref,notes
    const instancesData = rawData.instances.slice(1);
    for (const row of instancesData) {
      if (row.length < 2) continue;
      componentInstances.push({
        displayName: row[0],
        componentName: row[1],
        hostRef: row[2] || undefined,
        notes: row[3] || undefined,
      });
    }

    // Parse endpoints CSV
    // Expected format: instance_ref,kind,value,port,scheme,base_path
    const endpointsData = rawData.endpoints.slice(1);
    for (const row of endpointsData) {
      if (row.length < 3) continue;
      endpoints.push({
        componentInstanceRef: row[0],
        kind: this.mapEndpointKind(row[1]),
        value: row[2],
        port: row[3] ? parseInt(row[3], 10) : undefined,
        scheme: this.mapScheme(row[4]),
        basePath: row[5] || undefined,
      });
    }

    // Parse versions CSV
    // Expected format: instance_ref,project_version,vendor_version,build_ref
    const versionsData = rawData.versions.slice(1);
    for (const row of versionsData) {
      if (row.length < 2) continue;
      deployedVersions.push({
        componentInstanceRef: row[0],
        projectVersion: row[1],
        vendorVersion: row[2] || undefined,
        buildRef: row[3] || undefined,
      });
    }

    // Parse connections CSV
    // Expected format: from_ref,to_ref,protocol,detail,port
    const connectionsData = rawData.connections.slice(1);
    for (const row of connectionsData) {
      if (row.length < 3) continue;
      connections.push({
        fromComponentRef: row[0],
        toComponentRef: row[1],
        protocolType: this.mapProtocol(row[2]),
        protocolDetail: row[3] || undefined,
        port: row[4] ? parseInt(row[4], 10) : undefined,
      });
    }

    return {
      networkContexts: [],
      hosts,
      components,
      componentInstances,
      endpoints,
      deployedVersions,
      connections,
    };
  }

  private mapCategory(value?: string): 'BSS' | 'OSS' | 'DATABASE' | 'MESSAGING' | 'INTEGRATION' | 'OTHER' | undefined {
    if (!value) return undefined;
    const upper = value.toUpperCase();
    if (['BSS', 'OSS', 'DATABASE', 'MESSAGING', 'INTEGRATION', 'INFRA', 'SECURITY', 'MONITORING', 'OTHER'].includes(upper)) {
      if (upper === 'INFRA' || upper === 'SECURITY' || upper === 'MONITORING') return 'OTHER';
      return upper as 'BSS' | 'OSS' | 'DATABASE' | 'MESSAGING' | 'INTEGRATION' | 'OTHER';
    }
    return 'OTHER';
  }

  private mapEndpointKind(value?: string): 'HOSTNAME' | 'IP' | 'NAT' | 'VIP' | 'URL' {
    if (!value) return 'URL';
    const upper = value.toUpperCase();
    if (['HOSTNAME', 'IP', 'NAT', 'VIP', 'URL'].includes(upper)) {
      return upper as 'HOSTNAME' | 'IP' | 'NAT' | 'VIP' | 'URL';
    }
    return 'URL';
  }

  private mapScheme(value?: string): 'HTTP' | 'HTTPS' | 'TCP' | 'JDBC' | 'GRPC' | 'AMQP' | undefined {
    if (!value) return undefined;
    const upper = value.toUpperCase();
    if (['HTTP', 'HTTPS', 'TCP', 'JDBC', 'GRPC', 'AMQP'].includes(upper)) {
      return upper as 'HTTP' | 'HTTPS' | 'TCP' | 'JDBC' | 'GRPC' | 'AMQP';
    }
    return 'TCP';
  }

  private mapProtocol(value: string): 'REST' | 'SOAP' | 'TCP' | 'SFTP' | 'GRPC' | 'MQ' | 'JDBC' | 'OTHER' {
    const upper = value.toUpperCase();
    if (['REST', 'SOAP', 'TCP', 'SFTP', 'GRPC', 'MQ', 'JDBC', 'OTHER'].includes(upper)) {
      return upper as 'REST' | 'SOAP' | 'TCP' | 'SFTP' | 'GRPC' | 'MQ' | 'JDBC' | 'OTHER';
    }
    return 'OTHER';
  }
}
