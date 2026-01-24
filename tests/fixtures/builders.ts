// TelEnvIQ - Fixture Builders
// Factory functions for creating test data with overrides

import type {
  Environment,
  NetworkContext,
  Host,
  Component,
  ComponentInstance,
  Connection,
  Endpoint,
  DeployedVersion,
} from '@prisma/client';

// ============================================
// ID GENERATORS
// ============================================

let idCounter = 0;

export function nextId(prefix = '00000000'): string {
  idCounter++;
  return `${prefix}-0000-4000-8000-${String(idCounter).padStart(12, '0')}`;
}

export function resetIdCounter(): void {
  idCounter = 0;
}

// ============================================
// BASE TIMESTAMPS
// ============================================

const BASE_CREATED = new Date('2026-01-01T00:00:00.000Z');
const BASE_UPDATED = new Date('2026-01-15T10:00:00.000Z');
const BASE_INGESTED = new Date('2026-01-10T08:00:00.000Z');

// ============================================
// ENVIRONMENT BUILDER
// ============================================

export interface BuildEnvironmentOptions {
  id?: string;
  name?: string;
  type?: 'DEV' | 'SIT' | 'UAT' | 'NFT' | 'PREPROD' | 'PROD_RO';
  description?: string;
  entryComponentInstanceId?: string | null;
  exitComponentInstanceId?: string | null;
  stageId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export function buildEnvironment(options: BuildEnvironmentOptions = {}): Environment {
  return {
    id: options.id ?? nextId('env'),
    name: options.name ?? 'Test Environment',
    type: options.type ?? 'SIT',
    description: options.description ?? null,
    entryComponentInstanceId: options.entryComponentInstanceId ?? null,
    exitComponentInstanceId: options.exitComponentInstanceId ?? null,
    stageId: options.stageId ?? null,
    createdAt: options.createdAt ?? BASE_CREATED,
    updatedAt: options.updatedAt ?? BASE_UPDATED,
  };
}

// ============================================
// NETWORK CONTEXT BUILDER
// ============================================

export interface BuildNetworkContextOptions {
  id?: string;
  environmentId: string;
  hostingType?: 'CLOUD' | 'ON_PREM' | 'HYBRID' | 'THIRD_PARTY' | 'EDGE';
  cloudProvider?: 'AWS' | 'AZURE' | 'GCP' | 'ORACLE_CLOUD' | 'IBM_CLOUD' | 'ALIBABA_CLOUD' | 'PRIVATE_CLOUD' | 'NONE' | null;
  region?: string | null;
  vpcVnet?: string | null;
  subnetCidr?: string | null;
  zoneLabel?: string | null;
  hasLoadBalancer?: boolean;
  hasPrivateEndpoint?: boolean;
  sourceSystem?: string | null;
}

export function buildNetworkContext(options: BuildNetworkContextOptions): NetworkContext {
  return {
    id: options.id ?? nextId('nc'),
    environmentId: options.environmentId,
    hostingType: options.hostingType ?? 'CLOUD',
    cloudProvider: options.cloudProvider ?? 'AWS',
    region: options.region ?? 'ap-southeast-2',
    vpcVnet: options.vpcVnet ?? 'vpc-test',
    subnetCidr: options.subnetCidr ?? '10.0.0.0/16',
    zoneLabel: options.zoneLabel ?? 'Test Zone',
    hasLoadBalancer: options.hasLoadBalancer ?? false,
    loadBalancerRef: null,
    hasPrivateEndpoint: options.hasPrivateEndpoint ?? false,
    privateEndpointRef: null,
    notes: null,
    sourceSystem: options.sourceSystem ?? 'test',
    sourceRecordId: null,
    ingestedAt: BASE_INGESTED,
    createdAt: BASE_CREATED,
    updatedAt: BASE_UPDATED,
  };
}

// ============================================
// HOST BUILDER
// ============================================

export interface BuildHostOptions {
  id?: string;
  environmentId: string;
  networkContextId?: string | null;
  hostname?: string;
  ip?: string | null;
  natIp?: string | null;
  os?: string | null;
  sourceSystem?: string | null;
}

export function buildHost(options: BuildHostOptions): Host {
  const hostNum = idCounter + 1;
  return {
    id: options.id ?? nextId('host'),
    environmentId: options.environmentId,
    networkContextId: options.networkContextId ?? null,
    hostname: options.hostname ?? `host-${hostNum}.test.local`,
    ip: options.ip ?? `10.0.0.${hostNum}`,
    natIp: options.natIp ?? null,
    os: options.os ?? 'RHEL 8.6',
    notes: null,
    sourceSystem: options.sourceSystem ?? 'test',
    sourceRecordId: null,
    ingestedAt: BASE_INGESTED,
    createdAt: BASE_CREATED,
    updatedAt: BASE_UPDATED,
  };
}

// ============================================
// COMPONENT BUILDER
// ============================================

export interface BuildComponentOptions {
  id?: string;
  name?: string;
  category?: 'BSS' | 'OSS' | 'INFRA' | 'DATABASE' | 'MESSAGING' | 'INTEGRATION' | 'SECURITY' | 'MONITORING' | 'OTHER';
  vendor?: string | null;
  description?: string | null;
  layer?: 'BSS' | 'OSS' | 'INFRA' | 'EXTERNAL' | 'UNKNOWN';
  capabilityType?: 'CPQ' | 'CRM' | 'BILLING' | 'SOM' | 'INVENTORY' | 'ORCHESTRATOR' | 'DB' | 'MQ' | 'API_GW' | 'IDENTITY' | 'ITSM' | 'OTHER' | 'UNKNOWN';
}

export function buildComponent(options: BuildComponentOptions = {}): Component {
  const compNum = idCounter + 1;
  return {
    id: options.id ?? nextId('comp'),
    name: options.name ?? `Test Component ${compNum}`,
    category: options.category ?? 'OTHER',
    vendor: options.vendor ?? 'Test Vendor',
    description: options.description ?? null,
    layer: options.layer ?? 'UNKNOWN',
    capabilityType: options.capabilityType ?? 'UNKNOWN',
    createdAt: BASE_CREATED,
    updatedAt: BASE_UPDATED,
  };
}

// ============================================
// COMPONENT INSTANCE BUILDER
// ============================================

export interface BuildComponentInstanceOptions {
  id?: string;
  environmentId: string;
  componentId: string;
  hostId?: string | null;
  displayName?: string | null;
  sourceSystem?: string | null;
}

export function buildComponentInstance(options: BuildComponentInstanceOptions): ComponentInstance {
  const instNum = idCounter + 1;
  return {
    id: options.id ?? nextId('inst'),
    environmentId: options.environmentId,
    componentId: options.componentId,
    hostId: options.hostId ?? null,
    displayName: options.displayName ?? `Instance ${instNum}`,
    notes: null,
    sourceSystem: options.sourceSystem ?? 'test',
    sourceRecordId: null,
    ingestedAt: BASE_INGESTED,
    createdAt: BASE_CREATED,
    updatedAt: BASE_UPDATED,
  };
}

// ============================================
// CONNECTION BUILDER
// ============================================

export interface BuildConnectionOptions {
  id?: string;
  environmentId: string;
  fromComponentInstanceId: string;
  toComponentInstanceId: string;
  protocolType?: 'REST' | 'SOAP' | 'TCP' | 'SFTP' | 'GRPC' | 'MQ' | 'JDBC' | 'OTHER';
  protocolDetail?: string | null;
  port?: number | null;
  origin?: 'INGESTED' | 'MANUAL';
  confidence?: 'HIGH' | 'MED' | 'LOW';
  sourceSystem?: string | null;
}

export function buildConnection(options: BuildConnectionOptions): Connection {
  return {
    id: options.id ?? nextId('conn'),
    environmentId: options.environmentId,
    fromComponentInstanceId: options.fromComponentInstanceId,
    toComponentInstanceId: options.toComponentInstanceId,
    protocolType: options.protocolType ?? 'REST',
    protocolDetail: options.protocolDetail ?? null,
    port: options.port ?? 443,
    notes: null,
    sourceSystem: options.sourceSystem ?? 'test',
    sourceRecordId: null,
    ingestedAt: BASE_INGESTED,
    origin: options.origin ?? 'INGESTED',
    confidence: options.confidence ?? 'HIGH',
    createdAt: BASE_CREATED,
    updatedAt: BASE_UPDATED,
  };
}

// ============================================
// ENDPOINT BUILDER
// ============================================

export interface BuildEndpointOptions {
  id?: string;
  componentInstanceId: string;
  kind?: 'HOSTNAME' | 'IP' | 'NAT' | 'VIP' | 'URL';
  value?: string;
  port?: number | null;
  scheme?: 'TCP' | 'HTTP' | 'HTTPS' | 'GRPC' | 'JDBC' | 'AMQP' | null;
  basePath?: string | null;
  sourceSystem?: string | null;
}

export function buildEndpoint(options: BuildEndpointOptions): Endpoint {
  const epNum = idCounter + 1;
  return {
    id: options.id ?? nextId('ep'),
    componentInstanceId: options.componentInstanceId,
    kind: options.kind ?? 'URL',
    value: options.value ?? `https://endpoint-${epNum}.test.local`,
    port: options.port ?? 443,
    scheme: options.scheme ?? 'HTTPS',
    basePath: options.basePath ?? null,
    notes: null,
    sourceSystem: options.sourceSystem ?? 'test',
    sourceRecordId: null,
    ingestedAt: BASE_INGESTED,
    createdAt: BASE_CREATED,
    updatedAt: BASE_UPDATED,
  };
}

// ============================================
// DEPLOYED VERSION BUILDER
// ============================================

export interface BuildDeployedVersionOptions {
  id?: string;
  componentInstanceId: string;
  projectVersion?: string;
  vendorVersion?: string | null;
  buildRef?: string | null;
  sourceSystem?: string | null;
}

export function buildDeployedVersion(options: BuildDeployedVersionOptions): DeployedVersion {
  return {
    id: options.id ?? nextId('ver'),
    componentInstanceId: options.componentInstanceId,
    projectVersion: options.projectVersion ?? '1.0.0',
    vendorVersion: options.vendorVersion ?? null,
    buildRef: options.buildRef ?? null,
    capturedAt: BASE_INGESTED,
    sourceSystem: options.sourceSystem ?? 'test',
    sourceRecordId: null,
    ingestedAt: BASE_INGESTED,
    createdAt: BASE_CREATED,
    updatedAt: BASE_UPDATED,
  };
}

// ============================================
// COMPLETE TOPOLOGY BUILDER
// ============================================

export interface TopologyFixture {
  environment: Environment;
  networkContexts: NetworkContext[];
  hosts: Host[];
  components: Component[];
  instances: ComponentInstance[];
  connections: Connection[];
  endpoints: Endpoint[];
  versions: DeployedVersion[];
}

/**
 * Build a minimal test topology with specified number of nodes.
 */
export function buildMinimalTopology(nodeCount: number): TopologyFixture {
  resetIdCounter();

  const environment = buildEnvironment({ name: `Test Environment (${nodeCount} nodes)` });

  const networkContext = buildNetworkContext({
    environmentId: environment.id,
    zoneLabel: 'Test Zone',
  });

  const host = buildHost({
    environmentId: environment.id,
    networkContextId: networkContext.id,
  });

  const components: Component[] = [];
  const instances: ComponentInstance[] = [];
  const connections: Connection[] = [];
  const endpoints: Endpoint[] = [];
  const versions: DeployedVersion[] = [];

  for (let i = 0; i < nodeCount; i++) {
    const component = buildComponent({
      name: `Component ${i + 1}`,
      layer: i % 3 === 0 ? 'BSS' : i % 3 === 1 ? 'OSS' : 'INFRA',
    });
    components.push(component);

    const instance = buildComponentInstance({
      environmentId: environment.id,
      componentId: component.id,
      hostId: host.id,
      displayName: `${component.name} (SIT)`,
    });
    instances.push(instance);

    const endpoint = buildEndpoint({
      componentInstanceId: instance.id,
      port: 8000 + i,
    });
    endpoints.push(endpoint);

    const version = buildDeployedVersion({
      componentInstanceId: instance.id,
      projectVersion: `1.${i}.0`,
    });
    versions.push(version);

    // Create connections (chain pattern)
    if (i > 0) {
      const connection = buildConnection({
        environmentId: environment.id,
        fromComponentInstanceId: instances[i - 1].id,
        toComponentInstanceId: instance.id,
      });
      connections.push(connection);
    }
  }

  return {
    environment,
    networkContexts: [networkContext],
    hosts: [host],
    components,
    instances,
    connections,
    endpoints,
    versions,
  };
}
