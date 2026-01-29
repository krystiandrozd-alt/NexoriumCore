// Nexorium Core - Connector V2 Types
// Types for the 5-layer canonical data model connectors

import type {
  HostingType,
  CloudProvider,
  ComponentCategory,
  EndpointKind,
  EndpointScheme,
  ConnectionProtocol,
} from '@prisma/client';

// ============================================
// DISCOVERED ENTITIES (from connectors)
// ============================================

export interface DiscoveredNetworkContext {
  externalId?: string;
  hostingType: HostingType;
  cloudProvider?: CloudProvider;
  region?: string;
  vpcVnet?: string;
  subnetCidr?: string;
  zoneLabel?: string;
  hasLoadBalancer?: boolean;
  loadBalancerRef?: string;
  hasPrivateEndpoint?: boolean;
  privateEndpointRef?: string;
  notes?: string;
}

export interface DiscoveredHost {
  externalId?: string;
  hostname: string;
  ip?: string;
  natIp?: string;
  os?: string;
  networkContextRef?: string; // Reference to network context by vpcVnet or externalId
  notes?: string;
}

import type {
  ArchitectureLayer,
  CapabilityType,
} from '@prisma/client';

export interface DiscoveredComponent {
  name: string;
  category?: ComponentCategory;
  vendor?: string;
  description?: string;
  layer?: ArchitectureLayer;
  capabilityType?: CapabilityType;
}

export interface DiscoveredComponentInstance {
  externalId?: string;
  componentName: string; // Reference to component by name
  hostRef?: string; // Reference to host by hostname
  displayName?: string;
  notes?: string;
}

export interface DiscoveredEndpoint {
  componentInstanceRef: string; // Reference by displayName or externalId
  kind: EndpointKind;
  value: string;
  port?: number;
  scheme?: EndpointScheme;
  basePath?: string;
  notes?: string;
}

export interface DiscoveredDeployedVersion {
  componentInstanceRef: string; // Reference by displayName or externalId
  projectVersion: string; // REQUIRED
  vendorVersion?: string;
  buildRef?: string;
}

export interface DiscoveredConnection {
  fromComponentRef: string; // Reference by displayName or externalId
  toComponentRef: string;
  protocolType: ConnectionProtocol;
  protocolDetail?: string;
  port?: number;
  notes?: string;
}

// ============================================
// DISCOVERY PAYLOAD (complete ingestion payload)
// ============================================

export interface CanonicalDiscoveryPayload {
  networkContexts: DiscoveredNetworkContext[];
  hosts: DiscoveredHost[];
  components: DiscoveredComponent[];
  componentInstances: DiscoveredComponentInstance[];
  endpoints: DiscoveredEndpoint[];
  deployedVersions: DiscoveredDeployedVersion[];
  connections: DiscoveredConnection[];
}

// ============================================
// CONNECTOR CONFIG & RESULT
// ============================================

export interface ConnectorConfig {
  environmentId: string;
  connectorType: string;
  dryRun?: boolean;
}

export interface ConnectorRunSummary {
  networkContextsCreated: number;
  networkContextsUpdated: number;
  hostsCreated: number;
  hostsUpdated: number;
  componentsCreated: number;
  componentInstancesCreated: number;
  componentInstancesUpdated: number;
  endpointsCreated: number;
  endpointsUpdated: number;
  deployedVersionsCreated: number;
  connectionsCreated: number;
  connectionsUpdated: number;
  conflictsDetected: number;
  warnings: string[];
  errors: string[];
}

export interface ConnectorResult {
  success: boolean;
  runId: string;
  summary: ConnectorRunSummary;
  payload?: CanonicalDiscoveryPayload;
}

// ============================================
// CONNECTOR INTERFACE
// ============================================

export interface IConnector {
  readonly connectorType: string;

  /**
   * Fetch raw data from the source
   */
  fetch(): Promise<unknown>;

  /**
   * Map raw data to canonical entities
   */
  map(rawData: unknown): Promise<CanonicalDiscoveryPayload>;

  /**
   * Upsert canonical entities to the database
   */
  upsert(payload: CanonicalDiscoveryPayload): Promise<ConnectorRunSummary>;

  /**
   * Report the results of the connector run
   */
  report(): ConnectorRunSummary;

  /**
   * Run the full connector pipeline: fetch -> map -> upsert -> report
   */
  run(): Promise<ConnectorResult>;
}
