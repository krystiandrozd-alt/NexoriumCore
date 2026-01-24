// TelEnvIQ - Graph Data Fixtures
// Pre-computed graph topology data for testing graph analysis and rendering

import type { Graph5LayerNode, Graph5LayerEdge, GraphAnalysisResult } from '@/types';
import { INSTANCE_IDS } from './component-instances';
import { CONNECTION_IDS } from './connections';

// ============================================
// GRAPH NODES (React Flow format)
// ============================================

export const GRAPH_NODES: Graph5LayerNode[] = [
  // BSS Layer
  {
    id: INSTANCE_IDS.AMDOCS_CRM,
    type: 'custom5layer',
    position: { x: 200, y: 50 },
    data: {
      label: 'Amdocs CRM (SIT)',
      displayName: 'Amdocs CRM (SIT)',
      componentName: 'Amdocs CRM',
      layer: 'BSS',
      capabilityType: 'CRM',
      hostname: 'bss-app-01.sit.telco.local',
      primaryEndpoint: { port: 8443, scheme: 'HTTPS' },
      projectVersion: '21.3.1',
      isEntry: false,
      isExit: false,
      sourceSystem: 'mock',
      ingestedAt: new Date('2026-01-10T08:00:00.000Z'),
    },
  },
  {
    id: INSTANCE_IDS.NETCRACKER_SOM,
    type: 'custom5layer',
    position: { x: 400, y: 50 },
    data: {
      label: 'Netcracker SOM (SIT)',
      displayName: 'Netcracker SOM (SIT)',
      componentName: 'Netcracker SOM',
      layer: 'BSS',
      capabilityType: 'SOM',
      hostname: 'bss-app-02.sit.telco.local',
      primaryEndpoint: { port: 443, scheme: 'HTTPS' },
      projectVersion: '11.1.2',
      isEntry: false,
      isExit: false,
      sourceSystem: 'mock',
      ingestedAt: new Date('2026-01-10T08:00:00.000Z'),
    },
  },
  {
    id: INSTANCE_IDS.ORACLE_BRM,
    type: 'custom5layer',
    position: { x: 600, y: 50 },
    data: {
      label: 'Oracle BRM (SIT)',
      displayName: 'Oracle BRM (SIT)',
      componentName: 'Oracle BRM',
      layer: 'BSS',
      capabilityType: 'BILLING',
      hostname: 'legacy-brm-01.dc1.telco.local',
      primaryEndpoint: { port: 443, scheme: 'HTTPS' },
      projectVersion: '12.0.0.3',
      isEntry: false,
      isExit: true, // Exit node (no outgoing connections)
      sourceSystem: 'mock',
      ingestedAt: new Date('2026-01-10T08:00:00.000Z'),
    },
  },
  {
    id: INSTANCE_IDS.SALESFORCE_CPQ,
    type: 'custom5layer',
    position: { x: 0, y: 50 },
    data: {
      label: 'Salesforce CPQ (SIT)',
      displayName: 'Salesforce CPQ (SIT)',
      componentName: 'Salesforce CPQ',
      layer: 'BSS',
      capabilityType: 'CPQ',
      hostname: 'bss-app-02.sit.telco.local',
      primaryEndpoint: { port: 443, scheme: 'HTTPS' },
      projectVersion: '2024.1.0',
      isEntry: true, // Entry node (no incoming connections in standard flow)
      isExit: false,
      sourceSystem: 'mock',
      ingestedAt: new Date('2026-01-10T08:00:00.000Z'),
    },
  },
  // OSS Layer
  {
    id: INSTANCE_IDS.NOKIA_NSP,
    type: 'custom5layer',
    position: { x: 200, y: 350 },
    data: {
      label: 'Nokia NSP (SIT)',
      displayName: 'Nokia NSP (SIT)',
      componentName: 'Nokia NSP',
      layer: 'OSS',
      capabilityType: 'ORCHESTRATOR',
      hostname: 'oss-app-01.sit.telco.local',
      primaryEndpoint: { port: 443, scheme: 'HTTPS' },
      projectVersion: '23.11',
      isEntry: true, // Entry for OSS layer
      isExit: false,
      sourceSystem: 'mock',
      ingestedAt: new Date('2026-01-10T08:00:00.000Z'),
    },
  },
  {
    id: INSTANCE_IDS.ERICSSON_ENM,
    type: 'custom5layer',
    position: { x: 400, y: 350 },
    data: {
      label: 'Ericsson ENM (SIT)',
      displayName: 'Ericsson ENM (SIT)',
      componentName: 'Ericsson ENM',
      layer: 'OSS',
      capabilityType: 'ORCHESTRATOR',
      hostname: 'oss-app-01.sit.telco.local',
      primaryEndpoint: { port: 443, scheme: 'HTTPS' },
      projectVersion: '23.4',
      isEntry: false,
      isExit: true, // Exit for OSS layer
      sourceSystem: 'mock',
      ingestedAt: new Date('2026-01-10T08:00:00.000Z'),
    },
  },
  // INFRA Layer
  {
    id: INSTANCE_IDS.ORACLE_DB,
    type: 'custom5layer',
    position: { x: 100, y: 200 },
    data: {
      label: 'Oracle Database (SIT)',
      displayName: 'Oracle Database (SIT)',
      componentName: 'Oracle Database',
      layer: 'INFRA',
      capabilityType: 'DB',
      hostname: 'bss-db-01.sit.telco.local',
      primaryEndpoint: { port: 1521, scheme: 'JDBC' },
      projectVersion: '19.19',
      isEntry: false,
      isExit: true,
      sourceSystem: 'mock',
      ingestedAt: new Date('2026-01-10T08:00:00.000Z'),
    },
  },
  {
    id: INSTANCE_IDS.POSTGRESQL,
    type: 'custom5layer',
    position: { x: 300, y: 200 },
    data: {
      label: 'PostgreSQL (SIT)',
      displayName: 'PostgreSQL (SIT)',
      componentName: 'PostgreSQL',
      layer: 'INFRA',
      capabilityType: 'DB',
      hostname: 'oss-db-01.sit.telco.local',
      primaryEndpoint: { port: 5432, scheme: 'JDBC' },
      projectVersion: '15.4',
      isEntry: false,
      isExit: true,
      sourceSystem: 'mock',
      ingestedAt: new Date('2026-01-10T08:00:00.000Z'),
    },
  },
  {
    id: INSTANCE_IDS.KAFKA,
    type: 'custom5layer',
    position: { x: 500, y: 200 },
    data: {
      label: 'Apache Kafka (SIT)',
      displayName: 'Apache Kafka (SIT)',
      componentName: 'Apache Kafka',
      layer: 'INFRA',
      capabilityType: 'MQ',
      hostname: 'mq-broker-01.sit.telco.local',
      primaryEndpoint: { port: 9092, scheme: 'TCP' },
      projectVersion: '3.6.0',
      isEntry: false,
      isExit: true,
      sourceSystem: 'mock',
      ingestedAt: new Date('2026-01-10T08:00:00.000Z'),
    },
  },
  {
    id: INSTANCE_IDS.REDIS,
    type: 'custom5layer',
    position: { x: 700, y: 200 },
    data: {
      label: 'Redis (SIT)',
      displayName: 'Redis (SIT)',
      componentName: 'Redis',
      layer: 'INFRA',
      capabilityType: 'DB',
      hostname: 'bss-app-01.sit.telco.local',
      primaryEndpoint: { port: 6379, scheme: 'TCP' },
      projectVersion: '7.2.3',
      isEntry: false,
      isExit: true,
      sourceSystem: 'mock',
      ingestedAt: new Date('2026-01-10T08:00:00.000Z'),
    },
  },
  {
    id: INSTANCE_IDS.KEYCLOAK,
    type: 'custom5layer',
    position: { x: 900, y: 200 },
    data: {
      label: 'Keycloak (SIT)',
      displayName: 'Keycloak (SIT)',
      componentName: 'Keycloak',
      layer: 'INFRA',
      capabilityType: 'IDENTITY',
      hostname: 'bss-app-01.sit.telco.local',
      primaryEndpoint: { port: 8080, scheme: 'HTTP' },
      projectVersion: '23.0.3',
      isEntry: false,
      isExit: true,
      sourceSystem: 'mock',
      ingestedAt: new Date('2026-01-10T08:00:00.000Z'),
    },
  },
  // EXTERNAL Layer
  {
    id: INSTANCE_IDS.KONG_API_GW,
    type: 'custom5layer',
    position: { x: 20, y: 125 },
    data: {
      label: 'Kong API Gateway (SIT)',
      displayName: 'Kong API Gateway (SIT)',
      componentName: 'Kong API Gateway',
      layer: 'EXTERNAL',
      capabilityType: 'API_GW',
      hostname: 'api-gw-01.sit.telco.local',
      primaryEndpoint: { port: 443, scheme: 'HTTPS' },
      projectVersion: '3.4.0',
      isEntry: true, // Main entry point
      isExit: false,
      sourceSystem: 'mock',
      ingestedAt: new Date('2026-01-10T08:00:00.000Z'),
    },
  },
];

// ============================================
// GRAPH EDGES (React Flow format)
// ============================================

export const GRAPH_EDGES: Graph5LayerEdge[] = [
  // Kong -> BSS
  {
    id: CONNECTION_IDS.KONG_TO_CRM,
    source: INSTANCE_IDS.KONG_API_GW,
    target: INSTANCE_IDS.AMDOCS_CRM,
    type: 'custom5layer',
    animated: false,
    data: {
      protocolType: 'REST',
      protocolDetail: '/api/v1/customers',
      port: 8443,
      origin: 'INGESTED',
      confidence: 'HIGH',
      sourceSystem: 'mock',
    },
  },
  {
    id: CONNECTION_IDS.KONG_TO_SOM,
    source: INSTANCE_IDS.KONG_API_GW,
    target: INSTANCE_IDS.NETCRACKER_SOM,
    type: 'custom5layer',
    animated: false,
    data: {
      protocolType: 'REST',
      protocolDetail: 'TMF641',
      port: 443,
      origin: 'INGESTED',
      confidence: 'HIGH',
      sourceSystem: 'mock',
    },
  },
  // CRM -> SOM
  {
    id: CONNECTION_IDS.CRM_TO_SOM,
    source: INSTANCE_IDS.AMDOCS_CRM,
    target: INSTANCE_IDS.NETCRACKER_SOM,
    type: 'custom5layer',
    animated: false,
    data: {
      protocolType: 'REST',
      protocolDetail: 'TMF622',
      port: 443,
      origin: 'INGESTED',
      confidence: 'HIGH',
      sourceSystem: 'mock',
    },
  },
  // SOM -> BRM
  {
    id: CONNECTION_IDS.SOM_TO_BRM,
    source: INSTANCE_IDS.NETCRACKER_SOM,
    target: INSTANCE_IDS.ORACLE_BRM,
    type: 'custom5layer',
    animated: false,
    data: {
      protocolType: 'SOAP',
      protocolDetail: '/BRMWebServices',
      port: 443,
      origin: 'INGESTED',
      confidence: 'HIGH',
      sourceSystem: 'mock',
    },
  },
  // Database connections
  {
    id: CONNECTION_IDS.CRM_TO_ORACLE_DB,
    source: INSTANCE_IDS.AMDOCS_CRM,
    target: INSTANCE_IDS.ORACLE_DB,
    type: 'custom5layer',
    animated: false,
    data: {
      protocolType: 'JDBC',
      protocolDetail: 'oracle:thin:@',
      port: 1521,
      origin: 'INGESTED',
      confidence: 'HIGH',
      sourceSystem: 'mock',
    },
  },
  {
    id: CONNECTION_IDS.SOM_TO_POSTGRESQL,
    source: INSTANCE_IDS.NETCRACKER_SOM,
    target: INSTANCE_IDS.POSTGRESQL,
    type: 'custom5layer',
    animated: false,
    data: {
      protocolType: 'JDBC',
      protocolDetail: 'postgresql://',
      port: 5432,
      origin: 'INGESTED',
      confidence: 'HIGH',
      sourceSystem: 'mock',
    },
  },
  // Kafka connections
  {
    id: CONNECTION_IDS.CRM_TO_KAFKA,
    source: INSTANCE_IDS.AMDOCS_CRM,
    target: INSTANCE_IDS.KAFKA,
    type: 'custom5layer',
    animated: false,
    data: {
      protocolType: 'MQ',
      protocolDetail: 'customer-events',
      port: 9092,
      origin: 'INGESTED',
      confidence: 'HIGH',
      sourceSystem: 'mock',
    },
  },
  {
    id: CONNECTION_IDS.SOM_TO_KAFKA,
    source: INSTANCE_IDS.NETCRACKER_SOM,
    target: INSTANCE_IDS.KAFKA,
    type: 'custom5layer',
    animated: false,
    data: {
      protocolType: 'MQ',
      protocolDetail: 'order-events',
      port: 9092,
      origin: 'INGESTED',
      confidence: 'HIGH',
      sourceSystem: 'mock',
    },
  },
  // Kong -> Keycloak
  {
    id: CONNECTION_IDS.KONG_TO_KEYCLOAK,
    source: INSTANCE_IDS.KONG_API_GW,
    target: INSTANCE_IDS.KEYCLOAK,
    type: 'custom5layer',
    animated: false,
    data: {
      protocolType: 'REST',
      protocolDetail: '/auth/realms',
      port: 8080,
      origin: 'INGESTED',
      confidence: 'HIGH',
      sourceSystem: 'mock',
    },
  },
  // Kong -> Redis
  {
    id: CONNECTION_IDS.KONG_TO_REDIS,
    source: INSTANCE_IDS.KONG_API_GW,
    target: INSTANCE_IDS.REDIS,
    type: 'custom5layer',
    animated: false,
    data: {
      protocolType: 'TCP',
      protocolDetail: null,
      port: 6379,
      origin: 'INGESTED',
      confidence: 'HIGH',
      sourceSystem: 'mock',
    },
  },
  // NSP -> ENM
  {
    id: CONNECTION_IDS.NSP_TO_ENM,
    source: INSTANCE_IDS.NOKIA_NSP,
    target: INSTANCE_IDS.ERICSSON_ENM,
    type: 'custom5layer',
    animated: false,
    data: {
      protocolType: 'REST',
      protocolDetail: 'NETCONF',
      port: 443,
      origin: 'INGESTED',
      confidence: 'MED',
      sourceSystem: 'mock',
    },
  },
  // NSP -> PostgreSQL
  {
    id: CONNECTION_IDS.NSP_TO_POSTGRESQL,
    source: INSTANCE_IDS.NOKIA_NSP,
    target: INSTANCE_IDS.POSTGRESQL,
    type: 'custom5layer',
    animated: false,
    data: {
      protocolType: 'JDBC',
      protocolDetail: null,
      port: 5432,
      origin: 'INGESTED',
      confidence: 'HIGH',
      sourceSystem: 'mock',
    },
  },
];

// ============================================
// EXPECTED GRAPH ANALYSIS RESULT
// ============================================

export const EXPECTED_GRAPH_ANALYSIS: GraphAnalysisResult = {
  // Nodes with no incoming edges
  entryCandidates: [
    INSTANCE_IDS.KONG_API_GW,
    INSTANCE_IDS.SALESFORCE_CPQ,
    INSTANCE_IDS.NOKIA_NSP,
  ].sort(),
  // Nodes with no outgoing edges (includes PostgreSQL which only receives connections)
  // Note: SALESFORCE_CPQ is also an exit candidate since it has no outgoing edges in GRAPH_EDGES
  exitCandidates: [
    INSTANCE_IDS.ORACLE_BRM,
    INSTANCE_IDS.ORACLE_DB,
    INSTANCE_IDS.POSTGRESQL,
    INSTANCE_IDS.SALESFORCE_CPQ, // Isolated node - both entry and exit
    INSTANCE_IDS.KAFKA,
    INSTANCE_IDS.REDIS,
    INSTANCE_IDS.KEYCLOAK,
    INSTANCE_IDS.ERICSSON_ENM,
  ].sort(),
  overriddenEntry: null,
  overriddenExit: null,
};

// ============================================
// NODES BY LAYER (for layout tests)
// ============================================

export const NODES_BY_LAYER = {
  BSS: GRAPH_NODES.filter((n) => n.data.layer === 'BSS'),
  OSS: GRAPH_NODES.filter((n) => n.data.layer === 'OSS'),
  INFRA: GRAPH_NODES.filter((n) => n.data.layer === 'INFRA'),
  EXTERNAL: GRAPH_NODES.filter((n) => n.data.layer === 'EXTERNAL'),
  UNKNOWN: GRAPH_NODES.filter((n) => n.data.layer === 'UNKNOWN'),
};
