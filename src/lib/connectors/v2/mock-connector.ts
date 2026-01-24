// TelEnvIQ - Mock Connector
// Generates realistic telco environment data for testing and demos

import { BaseConnectorV2 } from './base-connector';
import type {
  ConnectorConfig,
  CanonicalDiscoveryPayload,
  DiscoveredNetworkContext,
  DiscoveredHost,
  DiscoveredComponent,
  DiscoveredComponentInstance,
  DiscoveredEndpoint,
  DiscoveredDeployedVersion,
  DiscoveredConnection,
} from './types';

export interface MockConnectorConfig extends ConnectorConfig {
  // Configuration options for mock data generation
  seed?: number; // Random seed for reproducibility
  driftEnabled?: boolean; // Enable drift simulation on subsequent runs
  componentCount?: 'small' | 'medium' | 'large' | 'xlarge'; // Size of generated topology
}

// Telco component catalog for realistic data with architecture intelligence
const TELCO_COMPONENTS = {
  BSS: [
    { name: 'Cisco NSO', vendor: 'Cisco', category: 'BSS' as const, layer: 'BSS' as const, capabilityType: 'ORCHESTRATOR' as const },
    { name: 'Oracle BRM', vendor: 'Oracle', category: 'BSS' as const, layer: 'BSS' as const, capabilityType: 'BILLING' as const },
    { name: 'Amdocs CRM', vendor: 'Amdocs', category: 'BSS' as const, layer: 'BSS' as const, capabilityType: 'CRM' as const },
    { name: 'Netcracker SOM', vendor: 'Netcracker', category: 'BSS' as const, layer: 'BSS' as const, capabilityType: 'SOM' as const },
    { name: 'Salesforce CPQ', vendor: 'Salesforce', category: 'BSS' as const, layer: 'BSS' as const, capabilityType: 'CPQ' as const },
    { name: 'TMF Order API', vendor: 'TM Forum', category: 'BSS' as const, layer: 'BSS' as const, capabilityType: 'SOM' as const },
    { name: 'SAP Convergent Charging', vendor: 'SAP', category: 'BSS' as const, layer: 'BSS' as const, capabilityType: 'BILLING' as const },
    { name: 'Cerillion CRM', vendor: 'Cerillion', category: 'BSS' as const, layer: 'BSS' as const, capabilityType: 'CRM' as const },
    { name: 'MATRIXX DGP', vendor: 'MATRIXX', category: 'BSS' as const, layer: 'BSS' as const, capabilityType: 'BILLING' as const },
    { name: 'Comverse ONE', vendor: 'Comverse', category: 'BSS' as const, layer: 'BSS' as const, capabilityType: 'BILLING' as const },
  ],
  OSS: [
    { name: 'Nokia NSP', vendor: 'Nokia', category: 'OSS' as const, layer: 'OSS' as const, capabilityType: 'ORCHESTRATOR' as const },
    { name: 'Ericsson ENM', vendor: 'Ericsson', category: 'OSS' as const, layer: 'OSS' as const, capabilityType: 'ORCHESTRATOR' as const },
    { name: 'ServiceNow ITSM', vendor: 'ServiceNow', category: 'OSS' as const, layer: 'OSS' as const, capabilityType: 'ITSM' as const },
    { name: 'BMC Remedy', vendor: 'BMC', category: 'OSS' as const, layer: 'OSS' as const, capabilityType: 'ITSM' as const },
    { name: 'Huawei iMaster NCE', vendor: 'Huawei', category: 'OSS' as const, layer: 'OSS' as const, capabilityType: 'ORCHESTRATOR' as const },
    { name: 'Ciena Blue Planet', vendor: 'Ciena', category: 'OSS' as const, layer: 'OSS' as const, capabilityType: 'ORCHESTRATOR' as const },
    { name: 'Juniper Paragon', vendor: 'Juniper', category: 'OSS' as const, layer: 'OSS' as const, capabilityType: 'ORCHESTRATOR' as const },
  ],
  DATABASE: [
    { name: 'Oracle Database', vendor: 'Oracle', category: 'DATABASE' as const, layer: 'INFRA' as const, capabilityType: 'DB' as const },
    { name: 'PostgreSQL', vendor: 'PostgreSQL', category: 'DATABASE' as const, layer: 'INFRA' as const, capabilityType: 'DB' as const },
    { name: 'MongoDB', vendor: 'MongoDB Inc', category: 'DATABASE' as const, layer: 'INFRA' as const, capabilityType: 'DB' as const },
    { name: 'Redis', vendor: 'Redis Labs', category: 'DATABASE' as const, layer: 'INFRA' as const, capabilityType: 'DB' as const },
    { name: 'MySQL', vendor: 'Oracle', category: 'DATABASE' as const, layer: 'INFRA' as const, capabilityType: 'DB' as const },
    { name: 'Cassandra', vendor: 'Apache', category: 'DATABASE' as const, layer: 'INFRA' as const, capabilityType: 'DB' as const },
    { name: 'Elasticsearch', vendor: 'Elastic', category: 'DATABASE' as const, layer: 'INFRA' as const, capabilityType: 'DB' as const },
  ],
  MESSAGING: [
    { name: 'Apache Kafka', vendor: 'Apache', category: 'MESSAGING' as const, layer: 'INFRA' as const, capabilityType: 'MQ' as const },
    { name: 'IBM MQ', vendor: 'IBM', category: 'MESSAGING' as const, layer: 'INFRA' as const, capabilityType: 'MQ' as const },
    { name: 'RabbitMQ', vendor: 'VMware', category: 'MESSAGING' as const, layer: 'INFRA' as const, capabilityType: 'MQ' as const },
    { name: 'ActiveMQ', vendor: 'Apache', category: 'MESSAGING' as const, layer: 'INFRA' as const, capabilityType: 'MQ' as const },
    { name: 'NATS', vendor: 'Synadia', category: 'MESSAGING' as const, layer: 'INFRA' as const, capabilityType: 'MQ' as const },
  ],
  INTEGRATION: [
    { name: 'Kong API Gateway', vendor: 'Kong', category: 'INTEGRATION' as const, layer: 'EXTERNAL' as const, capabilityType: 'API_GW' as const },
    { name: 'MuleSoft Anypoint', vendor: 'Salesforce', category: 'INTEGRATION' as const, layer: 'INFRA' as const, capabilityType: 'API_GW' as const },
    { name: 'WSO2 API Manager', vendor: 'WSO2', category: 'INTEGRATION' as const, layer: 'INFRA' as const, capabilityType: 'API_GW' as const },
    { name: 'Apigee', vendor: 'Google', category: 'INTEGRATION' as const, layer: 'EXTERNAL' as const, capabilityType: 'API_GW' as const },
    { name: 'AWS API Gateway', vendor: 'Amazon', category: 'INTEGRATION' as const, layer: 'EXTERNAL' as const, capabilityType: 'API_GW' as const },
  ],
  IDENTITY: [
    { name: 'Keycloak', vendor: 'Red Hat', category: 'SECURITY' as const, layer: 'INFRA' as const, capabilityType: 'IDENTITY' as const },
    { name: 'Okta', vendor: 'Okta', category: 'SECURITY' as const, layer: 'EXTERNAL' as const, capabilityType: 'IDENTITY' as const },
    { name: 'ForgeRock', vendor: 'ForgeRock', category: 'SECURITY' as const, layer: 'INFRA' as const, capabilityType: 'IDENTITY' as const },
  ],
};

// Sample versions for drift simulation
const VERSIONS = {
  'Cisco NSO': ['6.0.1', '6.0.2', '6.1.0', '6.1.1'],
  'Oracle BRM': ['12.0.0.1', '12.0.0.2', '12.0.0.3'],
  'Amdocs CRM': ['21.1', '21.2', '21.3', '22.1'],
  'Netcracker SOM': ['11.1.1', '11.1.2', '11.2.0'],
  'Oracle Database': ['19.3', '19.18', '19.19', '21c'],
  'PostgreSQL': ['14.2', '14.5', '15.0', '15.1'],
  'Apache Kafka': ['3.2.0', '3.3.0', '3.4.0'],
  'Kong API Gateway': ['3.0.0', '3.1.0', '3.2.0'],
};

export class MockConnector extends BaseConnectorV2 {
  readonly connectorType = 'mock';
  private mockConfig: MockConnectorConfig;
  private runCount = 0;

  constructor(config: MockConnectorConfig) {
    super(config);
    this.mockConfig = config;
  }

  async fetch(): Promise<{ timestamp: string; runNumber: number }> {
    // Simulate fetching - just return metadata
    this.runCount++;
    return {
      timestamp: new Date().toISOString(),
      runNumber: this.runCount,
    };
  }

  async map(rawData: { runNumber: number }): Promise<CanonicalDiscoveryPayload> {
    const isDrift = !!(this.mockConfig.driftEnabled && rawData.runNumber > 1);
    const size = this.mockConfig.componentCount || 'medium';

    // Generate network contexts
    const networkContexts = this.generateNetworkContexts(isDrift);

    // Generate hosts
    const hosts = this.generateHosts(networkContexts, size, isDrift);

    // Generate components (catalog entries)
    const components = this.generateComponents(size);

    // Generate component instances on hosts
    const componentInstances = this.generateComponentInstances(components, hosts, size, isDrift);

    // Generate endpoints for instances
    const endpoints = this.generateEndpoints(componentInstances);

    // Generate deployed versions
    const deployedVersions = this.generateDeployedVersions(componentInstances, isDrift);

    // Generate connections
    const connections = this.generateConnections(componentInstances);

    return {
      networkContexts,
      hosts,
      components,
      componentInstances,
      endpoints,
      deployedVersions,
      connections,
    };
  }

  private generateNetworkContexts(isDrift: boolean): DiscoveredNetworkContext[] {
    const contexts: DiscoveredNetworkContext[] = [
      {
        externalId: 'vpc-bss-sit-001',
        hostingType: 'CLOUD',
        cloudProvider: 'AWS',
        region: 'ap-southeast-2',
        vpcVnet: 'vpc-bss-sit-001',
        subnetCidr: '10.10.0.0/16',
        zoneLabel: 'BSS-SIT',
        hasLoadBalancer: true,
        loadBalancerRef: 'alb-bss-sit-001',
        hasPrivateEndpoint: true,
        privateEndpointRef: 'vpce-bss-001',
      },
      {
        externalId: 'vpc-oss-sit-001',
        hostingType: 'CLOUD',
        cloudProvider: 'AWS',
        region: 'ap-southeast-2',
        vpcVnet: 'vpc-oss-sit-001',
        subnetCidr: '10.20.0.0/16',
        zoneLabel: 'OSS-SIT',
        hasLoadBalancer: true,
        loadBalancerRef: 'alb-oss-sit-001',
      },
      {
        externalId: 'onprem-dc1',
        hostingType: 'ON_PREM',
        region: 'Sydney DC1',
        subnetCidr: '192.168.0.0/16',
        zoneLabel: 'Legacy Infrastructure',
        notes: 'Legacy on-premises data center',
      },
    ];

    if (isDrift) {
      // Drift: add a new GCP context
      contexts.push({
        externalId: 'vpc-analytics-sit-001',
        hostingType: 'CLOUD',
        cloudProvider: 'GCP',
        region: 'australia-southeast1',
        vpcVnet: 'vpc-analytics-sit',
        subnetCidr: '10.30.0.0/16',
        zoneLabel: 'Analytics-SIT',
        notes: 'New analytics workload (drift)',
      });
    }

    return contexts;
  }

  private generateHosts(
    networkContexts: DiscoveredNetworkContext[],
    size: string,
    isDrift: boolean
  ): DiscoveredHost[] {
    const baseHosts: DiscoveredHost[] = [
      // BSS hosts
      { hostname: 'bss-app-01.sit.telco.local', ip: '10.10.1.10', networkContextRef: 'vpc-bss-sit-001', os: 'RHEL 8.6' },
      { hostname: 'bss-app-02.sit.telco.local', ip: '10.10.1.11', networkContextRef: 'vpc-bss-sit-001', os: 'RHEL 8.6' },
      { hostname: 'bss-db-01.sit.telco.local', ip: '10.10.2.10', networkContextRef: 'vpc-bss-sit-001', os: 'RHEL 8.6' },
      // OSS hosts
      { hostname: 'oss-app-01.sit.telco.local', ip: '10.20.1.10', networkContextRef: 'vpc-oss-sit-001', os: 'Ubuntu 22.04' },
      { hostname: 'oss-db-01.sit.telco.local', ip: '10.20.2.10', networkContextRef: 'vpc-oss-sit-001', os: 'Ubuntu 22.04' },
      // Legacy hosts
      { hostname: 'legacy-brm-01.dc1.telco.local', ip: '192.168.1.50', networkContextRef: 'onprem-dc1', os: 'Solaris 11' },
      // Integration
      { hostname: 'api-gw-01.sit.telco.local', ip: '10.10.100.10', networkContextRef: 'vpc-bss-sit-001', os: 'Alpine Linux' },
      { hostname: 'mq-broker-01.sit.telco.local', ip: '10.10.100.20', networkContextRef: 'vpc-bss-sit-001', os: 'RHEL 8.6' },
    ];

    if (size === 'large' || size === 'xlarge') {
      // Add more hosts for large topology
      baseHosts.push(
        { hostname: 'bss-app-03.sit.telco.local', ip: '10.10.1.12', networkContextRef: 'vpc-bss-sit-001', os: 'RHEL 8.6' },
        { hostname: 'bss-app-04.sit.telco.local', ip: '10.10.1.13', networkContextRef: 'vpc-bss-sit-001', os: 'RHEL 8.6' },
        { hostname: 'oss-app-02.sit.telco.local', ip: '10.20.1.11', networkContextRef: 'vpc-oss-sit-001', os: 'Ubuntu 22.04' },
        { hostname: 'analytics-01.sit.telco.local', ip: '10.30.1.10', networkContextRef: 'vpc-analytics-sit-001', os: 'Debian 12' }
      );
    }

    if (size === 'xlarge') {
      // Add even more hosts for xlarge topology
      baseHosts.push(
        { hostname: 'bss-app-05.sit.telco.local', ip: '10.10.1.14', networkContextRef: 'vpc-bss-sit-001', os: 'RHEL 8.6' },
        { hostname: 'bss-app-06.sit.telco.local', ip: '10.10.1.15', networkContextRef: 'vpc-bss-sit-001', os: 'RHEL 8.6' },
        { hostname: 'bss-db-02.sit.telco.local', ip: '10.10.2.11', networkContextRef: 'vpc-bss-sit-001', os: 'RHEL 8.6' },
        { hostname: 'oss-app-03.sit.telco.local', ip: '10.20.1.12', networkContextRef: 'vpc-oss-sit-001', os: 'Ubuntu 22.04' },
        { hostname: 'oss-app-04.sit.telco.local', ip: '10.20.1.13', networkContextRef: 'vpc-oss-sit-001', os: 'Ubuntu 22.04' },
        { hostname: 'oss-db-02.sit.telco.local', ip: '10.20.2.11', networkContextRef: 'vpc-oss-sit-001', os: 'Ubuntu 22.04' },
        { hostname: 'api-gw-02.sit.telco.local', ip: '10.10.100.11', networkContextRef: 'vpc-bss-sit-001', os: 'Alpine Linux' },
        { hostname: 'mq-broker-02.sit.telco.local', ip: '10.10.100.21', networkContextRef: 'vpc-bss-sit-001', os: 'RHEL 8.6' },
        { hostname: 'identity-01.sit.telco.local', ip: '10.10.100.30', networkContextRef: 'vpc-bss-sit-001', os: 'RHEL 8.6' },
      );
    }

    if (isDrift) {
      // Drift: change an IP address
      const bssApp01 = baseHosts.find(h => h.hostname === 'bss-app-01.sit.telco.local');
      if (bssApp01) {
        bssApp01.ip = '10.10.1.100'; // IP changed
        bssApp01.notes = 'IP migrated from 10.10.1.10';
      }
    }

    return baseHosts;
  }

  private generateComponents(size: string): DiscoveredComponent[] {
    const components: DiscoveredComponent[] = [];

    // Always include core components with layer and capability
    const addComponents = (list: Array<{
      name: string;
      vendor: string;
      category: string;
      layer: string;
      capabilityType: string;
    }>, count: number) => {
      for (const comp of list.slice(0, count)) {
        components.push({
          name: comp.name,
          category: comp.category as DiscoveredComponent['category'],
          vendor: comp.vendor,
          layer: comp.layer as DiscoveredComponent['layer'],
          capabilityType: comp.capabilityType as DiscoveredComponent['capabilityType'],
        });
      }
    };

    const isXLarge = size === 'xlarge';
    addComponents(TELCO_COMPONENTS.BSS, size === 'small' ? 3 : size === 'medium' ? 5 : isXLarge ? 10 : 7);
    addComponents(TELCO_COMPONENTS.OSS, size === 'small' ? 1 : size === 'medium' ? 2 : isXLarge ? 7 : 4);
    addComponents(TELCO_COMPONENTS.DATABASE, size === 'small' ? 2 : size === 'medium' ? 3 : isXLarge ? 7 : 4);
    addComponents(TELCO_COMPONENTS.MESSAGING, size === 'small' ? 1 : size === 'medium' ? 2 : isXLarge ? 5 : 3);
    addComponents(TELCO_COMPONENTS.INTEGRATION, size === 'small' ? 1 : size === 'medium' ? 2 : isXLarge ? 5 : 3);
    if (isXLarge) {
      addComponents(TELCO_COMPONENTS.IDENTITY, 3);
    }

    return components;
  }

  private generateComponentInstances(
    components: DiscoveredComponent[],
    hosts: DiscoveredHost[],
    size: string,
    isDrift: boolean
  ): DiscoveredComponentInstance[] {
    const instances: DiscoveredComponentInstance[] = [];

    // Map components to hosts
    const componentHostMapping: Record<string, string> = {
      'Cisco NSO': 'bss-app-01.sit.telco.local',
      'Amdocs CRM': 'bss-app-01.sit.telco.local',
      'Netcracker SOM': 'bss-app-02.sit.telco.local',
      'Salesforce CPQ': 'bss-app-02.sit.telco.local',
      'Oracle BRM': 'legacy-brm-01.dc1.telco.local',
      'TMF Order API': 'bss-app-01.sit.telco.local',
      'SAP Convergent Charging': 'bss-app-02.sit.telco.local',
      'Cerillion CRM': 'bss-app-03.sit.telco.local',
      'MATRIXX DGP': 'bss-app-04.sit.telco.local',
      'Comverse ONE': 'bss-app-05.sit.telco.local',
      'Nokia NSP': 'oss-app-01.sit.telco.local',
      'Ericsson ENM': 'oss-app-01.sit.telco.local',
      'ServiceNow ITSM': 'oss-app-02.sit.telco.local',
      'BMC Remedy': 'oss-app-02.sit.telco.local',
      'Huawei iMaster NCE': 'oss-app-03.sit.telco.local',
      'Ciena Blue Planet': 'oss-app-03.sit.telco.local',
      'Juniper Paragon': 'oss-app-04.sit.telco.local',
      'Oracle Database': 'bss-db-01.sit.telco.local',
      'PostgreSQL': 'oss-db-01.sit.telco.local',
      'MongoDB': 'bss-db-01.sit.telco.local',
      'Redis': 'bss-app-01.sit.telco.local',
      'MySQL': 'bss-db-02.sit.telco.local',
      'Cassandra': 'oss-db-02.sit.telco.local',
      'Elasticsearch': 'analytics-01.sit.telco.local',
      'Apache Kafka': 'mq-broker-01.sit.telco.local',
      'IBM MQ': 'mq-broker-01.sit.telco.local',
      'RabbitMQ': 'mq-broker-01.sit.telco.local',
      'ActiveMQ': 'mq-broker-02.sit.telco.local',
      'NATS': 'mq-broker-02.sit.telco.local',
      'Kong API Gateway': 'api-gw-01.sit.telco.local',
      'MuleSoft Anypoint': 'api-gw-01.sit.telco.local',
      'WSO2 API Manager': 'api-gw-01.sit.telco.local',
      'Apigee': 'api-gw-02.sit.telco.local',
      'AWS API Gateway': 'api-gw-02.sit.telco.local',
      'Keycloak': 'identity-01.sit.telco.local',
      'Okta': 'identity-01.sit.telco.local',
      'ForgeRock': 'identity-01.sit.telco.local',
    };

    for (const comp of components) {
      const hostRef = componentHostMapping[comp.name];
      if (hostRef && hosts.find(h => h.hostname === hostRef)) {
        instances.push({
          externalId: `${comp.name.toLowerCase().replace(/\s+/g, '-')}-sit`,
          componentName: comp.name,
          hostRef,
          displayName: `${comp.name} (SIT)`,
        });
      }
    }

    if (isDrift) {
      // Drift: add a new component instance
      instances.push({
        externalId: 'new-analytics-engine-sit',
        componentName: 'PostgreSQL',
        hostRef: 'oss-db-01.sit.telco.local',
        displayName: 'Analytics DB (SIT)',
        notes: 'New analytics database (drift)',
      });
    }

    return instances;
  }

  private generateEndpoints(instances: DiscoveredComponentInstance[]): DiscoveredEndpoint[] {
    const endpoints: DiscoveredEndpoint[] = [];

    const endpointConfig: Record<string, Array<{ port: number; scheme: 'HTTP' | 'HTTPS' | 'TCP' | 'JDBC'; path?: string }>> = {
      'Cisco NSO': [{ port: 8080, scheme: 'HTTP' }, { port: 443, scheme: 'HTTPS', path: '/restconf' }],
      'Amdocs CRM': [{ port: 8443, scheme: 'HTTPS', path: '/api/v1' }],
      'Netcracker SOM': [{ port: 443, scheme: 'HTTPS', path: '/som/api' }],
      'Salesforce CPQ': [{ port: 443, scheme: 'HTTPS' }],
      'Oracle BRM': [{ port: 11960, scheme: 'TCP' }, { port: 443, scheme: 'HTTPS' }],
      'TMF Order API': [{ port: 8080, scheme: 'HTTP', path: '/tmf-api/productOrderingManagement/v4' }],
      'Oracle Database': [{ port: 1521, scheme: 'JDBC' }],
      'PostgreSQL': [{ port: 5432, scheme: 'JDBC' }],
      'MongoDB': [{ port: 27017, scheme: 'TCP' }],
      'Redis': [{ port: 6379, scheme: 'TCP' }],
      'Apache Kafka': [{ port: 9092, scheme: 'TCP' }, { port: 9093, scheme: 'TCP' }],
      'Kong API Gateway': [{ port: 8000, scheme: 'HTTP' }, { port: 8443, scheme: 'HTTPS' }],
      'Nokia NSP': [{ port: 443, scheme: 'HTTPS' }],
      'Ericsson ENM': [{ port: 443, scheme: 'HTTPS' }],
    };

    for (const instance of instances) {
      const compName = instance.componentName;
      const config = endpointConfig[compName];
      if (config) {
        for (const ep of config) {
          endpoints.push({
            componentInstanceRef: instance.displayName!,
            kind: 'URL',
            value: `${instance.displayName?.toLowerCase().replace(/[^a-z0-9]/g, '-')}:${ep.port}`,
            port: ep.port,
            scheme: ep.scheme,
            basePath: ep.path,
          });
        }
      }
    }

    return endpoints;
  }

  private generateDeployedVersions(
    instances: DiscoveredComponentInstance[],
    isDrift: boolean
  ): DiscoveredDeployedVersion[] {
    const versions: DiscoveredDeployedVersion[] = [];

    for (const instance of instances) {
      const compVersions = VERSIONS[instance.componentName as keyof typeof VERSIONS];
      if (compVersions) {
        // Pick a version (use drift to simulate version changes)
        const versionIndex = isDrift ? Math.min(compVersions.length - 1, 1) : 0;
        versions.push({
          componentInstanceRef: instance.displayName!,
          projectVersion: compVersions[versionIndex],
          buildRef: `build-${Date.now().toString(36).slice(-6)}`,
        });
      } else {
        // Default version
        versions.push({
          componentInstanceRef: instance.displayName!,
          projectVersion: '1.0.0',
          buildRef: 'build-default',
        });
      }
    }

    return versions;
  }

  private generateConnections(instances: DiscoveredComponentInstance[]): DiscoveredConnection[] {
    const connections: DiscoveredConnection[] = [];
    const instanceNames = instances.map(i => i.displayName!);

    // Define connection patterns
    const connectionPatterns: Array<{
      from: string;
      to: string;
      protocol: 'REST' | 'SOAP' | 'TCP' | 'JDBC' | 'MQ';
      detail?: string;
      port?: number;
    }> = [
      // CRM -> SOM
      { from: 'Amdocs CRM (SIT)', to: 'Netcracker SOM (SIT)', protocol: 'REST', detail: 'TMF622', port: 443 },
      // SOM -> Order API
      { from: 'Netcracker SOM (SIT)', to: 'TMF Order API (SIT)', protocol: 'REST', detail: 'TMF641', port: 8080 },
      // NSO -> ENM
      { from: 'Cisco NSO (SIT)', to: 'Ericsson ENM (SIT)', protocol: 'REST', detail: 'NETCONF', port: 443 },
      // API Gateway connections
      { from: 'Kong API Gateway (SIT)', to: 'Amdocs CRM (SIT)', protocol: 'REST', port: 8443 },
      { from: 'Kong API Gateway (SIT)', to: 'Netcracker SOM (SIT)', protocol: 'REST', port: 443 },
      { from: 'Kong API Gateway (SIT)', to: 'TMF Order API (SIT)', protocol: 'REST', port: 8080 },
      // Database connections
      { from: 'Amdocs CRM (SIT)', to: 'Oracle Database (SIT)', protocol: 'JDBC', port: 1521 },
      { from: 'Netcracker SOM (SIT)', to: 'PostgreSQL (SIT)', protocol: 'JDBC', port: 5432 },
      { from: 'Cisco NSO (SIT)', to: 'PostgreSQL (SIT)', protocol: 'JDBC', port: 5432 },
      // Kafka connections
      { from: 'Amdocs CRM (SIT)', to: 'Apache Kafka (SIT)', protocol: 'MQ', detail: 'order-events', port: 9092 },
      { from: 'Netcracker SOM (SIT)', to: 'Apache Kafka (SIT)', protocol: 'MQ', detail: 'fulfillment-events', port: 9092 },
      { from: 'Cisco NSO (SIT)', to: 'Apache Kafka (SIT)', protocol: 'MQ', detail: 'network-events', port: 9092 },
      // Redis for caching
      { from: 'Kong API Gateway (SIT)', to: 'Redis (SIT)', protocol: 'TCP', port: 6379 },
      // Legacy BRM
      { from: 'Netcracker SOM (SIT)', to: 'Oracle BRM (SIT)', protocol: 'SOAP', detail: '/BRMWebServices', port: 443 },
      // XLarge additional connections
      { from: 'Cerillion CRM (SIT)', to: 'Netcracker SOM (SIT)', protocol: 'REST', detail: 'TMF622', port: 443 },
      { from: 'Cerillion CRM (SIT)', to: 'MySQL (SIT)', protocol: 'JDBC', port: 3306 },
      { from: 'MATRIXX DGP (SIT)', to: 'Apache Kafka (SIT)', protocol: 'MQ', detail: 'rating-events', port: 9092 },
      { from: 'MATRIXX DGP (SIT)', to: 'Cassandra (SIT)', protocol: 'TCP', port: 9042 },
      { from: 'Comverse ONE (SIT)', to: 'Oracle Database (SIT)', protocol: 'JDBC', port: 1521 },
      { from: 'Huawei iMaster NCE (SIT)', to: 'PostgreSQL (SIT)', protocol: 'JDBC', port: 5432 },
      { from: 'Ciena Blue Planet (SIT)', to: 'Elasticsearch (SIT)', protocol: 'REST', port: 9200 },
      { from: 'Juniper Paragon (SIT)', to: 'ActiveMQ (SIT)', protocol: 'MQ', port: 61616 },
      { from: 'ServiceNow ITSM (SIT)', to: 'RabbitMQ (SIT)', protocol: 'MQ', port: 5672 },
      { from: 'BMC Remedy (SIT)', to: 'IBM MQ (SIT)', protocol: 'MQ', port: 1414 },
      { from: 'Apigee (SIT)', to: 'Amdocs CRM (SIT)', protocol: 'REST', port: 8443 },
      { from: 'Apigee (SIT)', to: 'Cerillion CRM (SIT)', protocol: 'REST', port: 8443 },
      { from: 'AWS API Gateway (SIT)', to: 'MATRIXX DGP (SIT)', protocol: 'REST', port: 443 },
      { from: 'Kong API Gateway (SIT)', to: 'Keycloak (SIT)', protocol: 'REST', port: 8080 },
      { from: 'Apigee (SIT)', to: 'Okta (SIT)', protocol: 'REST', port: 443 },
      { from: 'MuleSoft Anypoint (SIT)', to: 'ForgeRock (SIT)', protocol: 'REST', port: 8443 },
      { from: 'Keycloak (SIT)', to: 'PostgreSQL (SIT)', protocol: 'JDBC', port: 5432 },
      { from: 'Elasticsearch (SIT)', to: 'Apache Kafka (SIT)', protocol: 'MQ', detail: 'log-events', port: 9092 },
      { from: 'Nokia NSP (SIT)', to: 'NATS (SIT)', protocol: 'MQ', port: 4222 },
      { from: 'Ericsson ENM (SIT)', to: 'NATS (SIT)', protocol: 'MQ', port: 4222 },
      { from: 'WSO2 API Manager (SIT)', to: 'MongoDB (SIT)', protocol: 'TCP', port: 27017 },
      { from: 'TMF Order API (SIT)', to: 'Redis (SIT)', protocol: 'TCP', port: 6379 },
      { from: 'Salesforce CPQ (SIT)', to: 'MuleSoft Anypoint (SIT)', protocol: 'REST', port: 443 },
    ];

    for (const pattern of connectionPatterns) {
      if (instanceNames.includes(pattern.from) && instanceNames.includes(pattern.to)) {
        connections.push({
          fromComponentRef: pattern.from,
          toComponentRef: pattern.to,
          protocolType: pattern.protocol,
          protocolDetail: pattern.detail,
          port: pattern.port,
        });
      }
    }

    return connections;
  }
}
