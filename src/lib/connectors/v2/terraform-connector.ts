// Nexorium Core - Terraform State Connector
// Reads Terraform state files to extract infrastructure information

import * as fs from 'fs';
import { BaseConnectorV2 } from './base-connector';
import type {
  ConnectorConfig,
  CanonicalDiscoveryPayload,
  DiscoveredNetworkContext,
  DiscoveredHost,
} from './types';

export interface TerraformConnectorConfig extends ConnectorConfig {
  // Path to terraform state file
  statePath: string;
}

interface TerraformState {
  version: number;
  terraform_version: string;
  serial: number;
  lineage: string;
  outputs?: Record<string, {
    value: unknown;
    type: unknown;
  }>;
  resources: Array<{
    mode: string;
    type: string;
    name: string;
    provider: string;
    instances: Array<{
      index_key?: number | string;
      schema_version: number;
      attributes: Record<string, unknown>;
    }>;
  }>;
}

export class TerraformConnector extends BaseConnectorV2 {
  readonly connectorType = 'terraform';
  private tfConfig: TerraformConnectorConfig;

  constructor(config: TerraformConnectorConfig) {
    super(config);
    this.tfConfig = config;
  }

  async fetch(): Promise<TerraformState> {
    try {
      const content = fs.readFileSync(this.tfConfig.statePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      this.addError(`Failed to read terraform state: ${error}`);
      throw error;
    }
  }

  async map(rawData: TerraformState): Promise<CanonicalDiscoveryPayload> {
    const networkContexts: DiscoveredNetworkContext[] = [];
    const hosts: DiscoveredHost[] = [];
    const vpcIdToContext = new Map<string, DiscoveredNetworkContext>();

    // Process resources
    for (const resource of rawData.resources) {
      if (resource.mode !== 'managed') continue;

      for (const instance of resource.instances) {
        const attrs = instance.attributes;

        // VPC resources
        if (resource.type === 'aws_vpc') {
          const context: DiscoveredNetworkContext = {
            externalId: attrs.id as string,
            hostingType: 'CLOUD',
            cloudProvider: 'AWS',
            vpcVnet: attrs.id as string,
            subnetCidr: attrs.cidr_block as string,
            zoneLabel: (attrs.tags as Record<string, string>)?.Name || resource.name,
          };
          networkContexts.push(context);
          vpcIdToContext.set(attrs.id as string, context);
        }

        // Azure VNet resources
        if (resource.type === 'azurerm_virtual_network') {
          const addressSpace = attrs.address_space as string[];
          networkContexts.push({
            externalId: attrs.id as string,
            hostingType: 'CLOUD',
            cloudProvider: 'AZURE',
            region: attrs.location as string,
            vpcVnet: attrs.name as string,
            subnetCidr: addressSpace?.join(', '),
            zoneLabel: (attrs.tags as Record<string, string>)?.Environment || resource.name,
          });
        }

        // GCP VPC resources
        if (resource.type === 'google_compute_network') {
          networkContexts.push({
            externalId: attrs.self_link as string,
            hostingType: 'CLOUD',
            cloudProvider: 'GCP',
            vpcVnet: attrs.name as string,
            zoneLabel: attrs.name as string,
          });
        }

        // AWS EC2 instances
        if (resource.type === 'aws_instance') {
          const tags = attrs.tags as Record<string, string>;
          hosts.push({
            externalId: attrs.id as string,
            hostname: tags?.Name || `${resource.name}-${instance.index_key ?? 0}`,
            ip: attrs.private_ip as string,
            natIp: attrs.public_ip as string | undefined,
            networkContextRef: attrs.vpc_security_group_ids ? undefined : undefined,
            notes: `Instance type: ${attrs.instance_type}`,
          });
        }

        // Azure VM instances
        if (resource.type === 'azurerm_linux_virtual_machine' || resource.type === 'azurerm_windows_virtual_machine') {
          hosts.push({
            externalId: attrs.id as string,
            hostname: attrs.name as string || resource.name,
            ip: attrs.private_ip_address as string,
            os: resource.type.includes('linux') ? 'Linux' : 'Windows',
            notes: `VM Size: ${attrs.size}`,
          });
        }

        // GCP Compute instances
        if (resource.type === 'google_compute_instance') {
          const networkInterfaces = attrs.network_interface as Array<{ network_ip: string }>;
          hosts.push({
            externalId: attrs.self_link as string,
            hostname: attrs.name as string,
            ip: networkInterfaces?.[0]?.network_ip,
            notes: `Machine type: ${attrs.machine_type}`,
          });
        }

        // AWS Load Balancers
        if (resource.type === 'aws_lb' || resource.type === 'aws_alb') {
          // Find the VPC and update it
          const vpcId = attrs.vpc_id as string;
          const context = vpcIdToContext.get(vpcId);
          if (context) {
            context.hasLoadBalancer = true;
            context.loadBalancerRef = attrs.arn as string;
          }
        }

        // AWS RDS instances (could be treated as hosts for database components)
        if (resource.type === 'aws_db_instance') {
          const tags = attrs.tags as Record<string, string>;
          hosts.push({
            externalId: attrs.id as string,
            hostname: tags?.Name || attrs.identifier as string,
            ip: attrs.address as string,
            notes: `RDS ${attrs.engine} ${attrs.engine_version}`,
          });
        }
      }
    }

    // Also check outputs for additional info
    if (rawData.outputs) {
      const instanceIps = rawData.outputs.instance_ips?.value as Record<string, string>;
      if (instanceIps) {
        for (const [name, ip] of Object.entries(instanceIps)) {
          // Check if we already have this host
          const existing = hosts.find(h => h.hostname === name || h.ip === ip);
          if (!existing) {
            hosts.push({
              hostname: name,
              ip,
              notes: 'From terraform output',
            });
          }
        }
      }
    }

    return {
      networkContexts,
      hosts,
      components: [],
      componentInstances: [],
      endpoints: [],
      deployedVersions: [],
      connections: [],
    };
  }
}
