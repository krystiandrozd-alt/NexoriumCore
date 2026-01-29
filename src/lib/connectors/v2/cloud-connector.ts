// Nexorium Core - Cloud Control Plane Connector
// Reads from AWS/Azure/GCP control plane APIs (using fixture files for MVP)

import * as fs from 'fs';
import { BaseConnectorV2 } from './base-connector';
import type {
  ConnectorConfig,
  CanonicalDiscoveryPayload,
  DiscoveredNetworkContext,
  DiscoveredHost,
} from './types';

export type CloudProviderType = 'aws' | 'azure' | 'gcp';

export interface CloudConnectorConfig extends ConnectorConfig {
  provider: CloudProviderType;
  // For MVP: path to fixture file
  fixturePath: string;
  // For real implementation: these would be credentials/config
  region?: string;
  accountId?: string;
}

// AWS fixture structure
interface AWSFixture {
  accountId: string;
  region: string;
  vpcs: Array<{
    vpcId: string;
    cidrBlock: string;
    tags: Record<string, string>;
  }>;
  subnets: Array<{
    subnetId: string;
    vpcId: string;
    cidrBlock: string;
    availabilityZone: string;
    tags: Record<string, string>;
  }>;
  instances: Array<{
    instanceId: string;
    instanceType: string;
    privateIpAddress: string;
    publicIpAddress?: string | null;
    vpcId: string;
    subnetId: string;
    state: string;
    platform?: string;
    tags: Record<string, string>;
  }>;
  loadBalancers?: Array<{
    loadBalancerArn: string;
    dnsName: string;
    type: string;
    vpcId: string;
    state: string;
    tags: Record<string, string>;
  }>;
  vpcEndpoints?: Array<{
    vpcEndpointId: string;
    vpcId: string;
    serviceName: string;
    state: string;
  }>;
}

// Azure fixture structure
interface AzureFixture {
  subscriptionId: string;
  location: string;
  resourceGroups: Array<{
    name: string;
    location: string;
    tags: Record<string, string>;
  }>;
  virtualNetworks: Array<{
    id: string;
    name: string;
    resourceGroup: string;
    addressSpace: string[];
    subnets: Array<{
      name: string;
      addressPrefix: string;
    }>;
    tags: Record<string, string>;
  }>;
  virtualMachines: Array<{
    id: string;
    name: string;
    resourceGroup: string;
    location: string;
    vmSize: string;
    privateIpAddress: string;
    osType: string;
    tags: Record<string, string>;
  }>;
  loadBalancers?: Array<{
    id: string;
    name: string;
    resourceGroup: string;
    frontendIpConfigurations: Array<{
      name: string;
      privateIpAddress: string;
    }>;
    tags: Record<string, string>;
  }>;
  privateEndpoints?: Array<{
    id: string;
    name: string;
    resourceGroup: string;
    privateLinkServiceId: string;
  }>;
}

// GCP fixture structure
interface GCPFixture {
  projectId: string;
  region: string;
  networks: Array<{
    name: string;
    selfLink: string;
    autoCreateSubnetworks: boolean;
    subnetworks: string[];
  }>;
  subnetworks: Array<{
    name: string;
    network: string;
    ipCidrRange: string;
    region: string;
  }>;
  instances: Array<{
    name: string;
    zone: string;
    machineType: string;
    networkInterfaces: Array<{
      network: string;
      subnetwork: string;
      networkIP: string;
    }>;
    status: string;
    labels: Record<string, string>;
  }>;
  forwardingRules?: Array<{
    name: string;
    IPAddress: string;
    loadBalancingScheme: string;
    network: string;
  }>;
}

export class CloudConnector extends BaseConnectorV2 {
  readonly connectorType: string;
  private cloudConfig: CloudConnectorConfig;

  constructor(config: CloudConnectorConfig) {
    super(config);
    this.cloudConfig = config;
    this.connectorType = `cloud-${config.provider}`;
  }

  async fetch(): Promise<AWSFixture | AzureFixture | GCPFixture> {
    try {
      const content = fs.readFileSync(this.cloudConfig.fixturePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      this.addError(`Failed to read fixture file: ${error}`);
      throw error;
    }
  }

  async map(rawData: AWSFixture | AzureFixture | GCPFixture): Promise<CanonicalDiscoveryPayload> {
    switch (this.cloudConfig.provider) {
      case 'aws':
        return this.mapAWS(rawData as AWSFixture);
      case 'azure':
        return this.mapAzure(rawData as AzureFixture);
      case 'gcp':
        return this.mapGCP(rawData as GCPFixture);
      default:
        throw new Error(`Unknown provider: ${this.cloudConfig.provider}`);
    }
  }

  private mapAWS(data: AWSFixture): CanonicalDiscoveryPayload {
    const networkContexts: DiscoveredNetworkContext[] = [];
    const hosts: DiscoveredHost[] = [];

    // Map VPCs to network contexts
    for (const vpc of data.vpcs) {
      const lbForVpc = data.loadBalancers?.find(lb => lb.vpcId === vpc.vpcId);
      const epForVpc = data.vpcEndpoints?.find(ep => ep.vpcId === vpc.vpcId);

      networkContexts.push({
        externalId: vpc.vpcId,
        hostingType: 'CLOUD',
        cloudProvider: 'AWS',
        region: data.region,
        vpcVnet: vpc.vpcId,
        subnetCidr: vpc.cidrBlock,
        zoneLabel: vpc.tags.Name || vpc.tags.Environment,
        hasLoadBalancer: !!lbForVpc,
        loadBalancerRef: lbForVpc?.loadBalancerArn,
        hasPrivateEndpoint: !!epForVpc,
        privateEndpointRef: epForVpc?.vpcEndpointId,
      });
    }

    // Map instances to hosts
    for (const instance of data.instances) {
      if (instance.state !== 'running') continue;

      hosts.push({
        externalId: instance.instanceId,
        hostname: instance.tags.Name || instance.instanceId,
        ip: instance.privateIpAddress,
        natIp: instance.publicIpAddress || undefined,
        os: instance.platform || 'Linux',
        networkContextRef: instance.vpcId,
        notes: `Instance type: ${instance.instanceType}`,
      });
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

  private mapAzure(data: AzureFixture): CanonicalDiscoveryPayload {
    const networkContexts: DiscoveredNetworkContext[] = [];
    const hosts: DiscoveredHost[] = [];

    // Map VNets to network contexts
    for (const vnet of data.virtualNetworks) {
      const lbForVnet = data.loadBalancers?.find(lb => lb.resourceGroup === vnet.resourceGroup);
      const epForVnet = data.privateEndpoints?.find(pe => pe.resourceGroup === vnet.resourceGroup);

      networkContexts.push({
        externalId: vnet.id,
        hostingType: 'CLOUD',
        cloudProvider: 'AZURE',
        region: data.location,
        vpcVnet: vnet.name,
        subnetCidr: vnet.addressSpace.join(', '),
        zoneLabel: vnet.tags.Environment || vnet.name,
        hasLoadBalancer: !!lbForVnet,
        loadBalancerRef: lbForVnet?.id,
        hasPrivateEndpoint: !!epForVnet,
        privateEndpointRef: epForVnet?.id,
      });
    }

    // Map VMs to hosts
    for (const vm of data.virtualMachines) {
      hosts.push({
        externalId: vm.id,
        hostname: vm.name,
        ip: vm.privateIpAddress,
        os: vm.osType,
        networkContextRef: data.virtualNetworks.find(v => v.resourceGroup === vm.resourceGroup)?.name,
        notes: `VM Size: ${vm.vmSize}`,
      });
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

  private mapGCP(data: GCPFixture): CanonicalDiscoveryPayload {
    const networkContexts: DiscoveredNetworkContext[] = [];
    const hosts: DiscoveredHost[] = [];

    // Map networks to network contexts
    for (const network of data.networks) {
      const subnet = data.subnetworks.find(s => s.network === network.name);
      const lb = data.forwardingRules?.find(fr => fr.network === network.name);

      networkContexts.push({
        externalId: network.selfLink,
        hostingType: 'CLOUD',
        cloudProvider: 'GCP',
        region: data.region,
        vpcVnet: network.name,
        subnetCidr: subnet?.ipCidrRange,
        zoneLabel: network.name,
        hasLoadBalancer: !!lb,
        loadBalancerRef: lb?.name,
      });
    }

    // Map instances to hosts
    for (const instance of data.instances) {
      if (instance.status !== 'RUNNING') continue;

      const networkInterface = instance.networkInterfaces[0];
      hosts.push({
        externalId: `${data.projectId}/${instance.zone}/${instance.name}`,
        hostname: instance.name,
        ip: networkInterface?.networkIP,
        networkContextRef: networkInterface?.network,
        notes: `Machine type: ${instance.machineType}`,
      });
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
