// TelEnvIQ - Flow Map Fixtures
// Seeded dataset for portfolio change intelligence visualization

import type {
  Project,
  FlowNode,
  FlowEdge,
  Collision,
  Convergence,
  RiskLevel,
  ProjectStatus,
  FlowEdgeType,
} from '@/types/flow-map';

// ============================================
// HELPER FUNCTIONS
// ============================================

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const NOW = new Date('2026-01-24');

// ============================================
// PROJECTS (50+)
// ============================================

export const FLOW_MAP_PROJECTS: Project[] = [
  // BSS Transformation Projects
  {
    id: 'proj-001',
    name: 'CRM Modernization',
    code: 'CRM-MOD',
    owner: 'Sarah Chen',
    team: 'BSS Platform',
    status: 'ACTIVE',
    riskLevel: 'HIGH',
    startDate: addDays(NOW, -30),
    endDate: addDays(NOW, 60),
    description: 'Upgrade Amdocs CRM to cloud-native architecture',
    targetEnvironments: ['env-sit-1', 'env-uat-1', 'env-preprod'],
    affectedSystems: ['sys-crm', 'sys-som', 'sys-billing'],
    priority: 1,
  },
  {
    id: 'proj-002',
    name: 'Billing Platform Upgrade',
    code: 'BILL-UPG',
    owner: 'Michael Torres',
    team: 'Revenue Systems',
    status: 'ACTIVE',
    riskLevel: 'CRITICAL',
    startDate: addDays(NOW, -15),
    endDate: addDays(NOW, 45),
    description: 'Oracle BRM 12.x to 14.x migration',
    targetEnvironments: ['env-sit-1', 'env-sit-2', 'env-uat-1'],
    affectedSystems: ['sys-billing', 'sys-rating', 'sys-mediation'],
    priority: 1,
  },
  {
    id: 'proj-003',
    name: 'Order Management Refactor',
    code: 'OM-REF',
    owner: 'Lisa Wang',
    team: 'Order Fulfillment',
    status: 'ACTIVE',
    riskLevel: 'MEDIUM',
    startDate: addDays(NOW, -45),
    endDate: addDays(NOW, 30),
    description: 'Netcracker SOM API modernization',
    targetEnvironments: ['env-sit-1', 'env-uat-1'],
    affectedSystems: ['sys-som', 'sys-inventory', 'sys-activation'],
    priority: 2,
  },
  {
    id: 'proj-004',
    name: 'Product Catalog Migration',
    code: 'PC-MIG',
    owner: 'James Kim',
    team: 'Product Management',
    status: 'PLANNED',
    riskLevel: 'MEDIUM',
    startDate: addDays(NOW, 14),
    endDate: addDays(NOW, 90),
    description: 'Migrate to TMF-compliant product catalog',
    targetEnvironments: ['env-sit-2', 'env-uat-2'],
    affectedSystems: ['sys-catalog', 'sys-pricing', 'sys-cpq'],
    priority: 2,
  },
  {
    id: 'proj-005',
    name: 'Customer Portal Redesign',
    code: 'CP-RED',
    owner: 'Emma Davis',
    team: 'Digital Channels',
    status: 'ACTIVE',
    riskLevel: 'LOW',
    startDate: addDays(NOW, -60),
    endDate: addDays(NOW, 15),
    description: 'New React-based customer self-service portal',
    targetEnvironments: ['env-sit-1', 'env-uat-1', 'env-preprod'],
    affectedSystems: ['sys-portal', 'sys-crm', 'sys-identity'],
    priority: 3,
  },

  // OSS Transformation Projects
  {
    id: 'proj-006',
    name: 'Network Inventory Consolidation',
    code: 'NI-CON',
    owner: 'Robert Chen',
    team: 'Network Operations',
    status: 'ACTIVE',
    riskLevel: 'HIGH',
    startDate: addDays(NOW, -20),
    endDate: addDays(NOW, 70),
    description: 'Consolidate legacy inventory systems',
    targetEnvironments: ['env-sit-2', 'env-uat-2', 'env-nft-1'],
    affectedSystems: ['sys-inventory', 'sys-nsp', 'sys-enm'],
    priority: 1,
  },
  {
    id: 'proj-007',
    name: 'Service Activation Automation',
    code: 'SA-AUT',
    owner: 'Anna Martinez',
    team: 'Service Assurance',
    status: 'ACTIVE',
    riskLevel: 'MEDIUM',
    startDate: addDays(NOW, -10),
    endDate: addDays(NOW, 50),
    description: 'Zero-touch activation for 5G services',
    targetEnvironments: ['env-sit-1', 'env-sit-2', 'env-uat-1'],
    affectedSystems: ['sys-activation', 'sys-nsp', 'sys-provisioning'],
    priority: 2,
  },
  {
    id: 'proj-008',
    name: 'Fault Management Enhancement',
    code: 'FM-ENH',
    owner: 'David Park',
    team: 'Service Assurance',
    status: 'PLANNED',
    riskLevel: 'LOW',
    startDate: addDays(NOW, 30),
    endDate: addDays(NOW, 120),
    description: 'AI-powered fault correlation engine',
    targetEnvironments: ['env-sit-2', 'env-nft-1'],
    affectedSystems: ['sys-fm', 'sys-pm', 'sys-analytics'],
    priority: 3,
  },

  // Integration Projects
  {
    id: 'proj-009',
    name: 'API Gateway Modernization',
    code: 'API-MOD',
    owner: 'Kevin Lee',
    team: 'Integration Platform',
    status: 'ACTIVE',
    riskLevel: 'CRITICAL',
    startDate: addDays(NOW, -5),
    endDate: addDays(NOW, 40),
    description: 'Kong Gateway migration from legacy ESB',
    targetEnvironments: ['env-sit-1', 'env-sit-2', 'env-uat-1', 'env-uat-2', 'env-preprod'],
    affectedSystems: ['sys-apigw', 'sys-esb', 'sys-identity'],
    priority: 1,
  },
  {
    id: 'proj-010',
    name: 'Event Streaming Platform',
    code: 'ESP-IMP',
    owner: 'Jennifer Wu',
    team: 'Data Platform',
    status: 'ACTIVE',
    riskLevel: 'HIGH',
    startDate: addDays(NOW, -25),
    endDate: addDays(NOW, 55),
    description: 'Kafka cluster deployment for real-time events',
    targetEnvironments: ['env-sit-1', 'env-uat-1', 'env-nft-1'],
    affectedSystems: ['sys-kafka', 'sys-analytics', 'sys-billing'],
    priority: 2,
  },

  // Infrastructure Projects
  {
    id: 'proj-011',
    name: 'Database Consolidation',
    code: 'DB-CON',
    owner: 'Mark Johnson',
    team: 'DBA Team',
    status: 'ACTIVE',
    riskLevel: 'CRITICAL',
    startDate: addDays(NOW, -40),
    endDate: addDays(NOW, 20),
    description: 'Oracle 19c to 23c upgrade across environments',
    targetEnvironments: ['env-sit-1', 'env-sit-2', 'env-uat-1', 'env-uat-2'],
    affectedSystems: ['sys-oracle-db', 'sys-crm', 'sys-billing', 'sys-som'],
    priority: 1,
  },
  {
    id: 'proj-012',
    name: 'Redis Cluster Upgrade',
    code: 'REDIS-UPG',
    owner: 'Alex Thompson',
    team: 'Platform Engineering',
    status: 'PLANNED',
    riskLevel: 'MEDIUM',
    startDate: addDays(NOW, 7),
    endDate: addDays(NOW, 35),
    description: 'Redis 7.x cluster with improved failover',
    targetEnvironments: ['env-sit-1', 'env-uat-1'],
    affectedSystems: ['sys-redis', 'sys-apigw', 'sys-portal'],
    priority: 3,
  },

  // Security Projects
  {
    id: 'proj-013',
    name: 'Identity Platform Upgrade',
    code: 'IDP-UPG',
    owner: 'Patricia Adams',
    team: 'Security Operations',
    status: 'ACTIVE',
    riskLevel: 'HIGH',
    startDate: addDays(NOW, -35),
    endDate: addDays(NOW, 25),
    description: 'Keycloak 23.x upgrade with FIDO2 support',
    targetEnvironments: ['env-sit-1', 'env-sit-2', 'env-uat-1', 'env-preprod'],
    affectedSystems: ['sys-identity', 'sys-apigw', 'sys-portal', 'sys-crm'],
    priority: 1,
  },

  // Analytics Projects
  {
    id: 'proj-014',
    name: 'Real-time Analytics Platform',
    code: 'RTA-IMP',
    owner: 'Chris Anderson',
    team: 'Data Analytics',
    status: 'ACTIVE',
    riskLevel: 'MEDIUM',
    startDate: addDays(NOW, -50),
    endDate: addDays(NOW, 10),
    description: 'ClickHouse-based real-time analytics',
    targetEnvironments: ['env-sit-2', 'env-uat-2', 'env-nft-1'],
    affectedSystems: ['sys-analytics', 'sys-kafka', 'sys-elasticsearch'],
    priority: 2,
  },

  // Mobile Projects
  {
    id: 'proj-015',
    name: 'Mobile App Backend Refactor',
    code: 'MAB-REF',
    owner: 'Ryan Miller',
    team: 'Mobile Platform',
    status: 'ACTIVE',
    riskLevel: 'MEDIUM',
    startDate: addDays(NOW, -15),
    endDate: addDays(NOW, 45),
    description: 'Microservices migration for mobile backend',
    targetEnvironments: ['env-sit-1', 'env-uat-1'],
    affectedSystems: ['sys-mobile-bff', 'sys-crm', 'sys-billing'],
    priority: 2,
  },

  // Generate more projects programmatically
  ...generateAdditionalProjects(),
];

function generateAdditionalProjects(): Project[] {
  const teams = ['BSS Platform', 'OSS Platform', 'Integration', 'Security', 'Data Platform', 'Mobile', 'Digital'];
  const statuses: ProjectStatus[] = ['ACTIVE', 'PLANNED', 'ON_HOLD', 'COMPLETED'];
  const risks: RiskLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const environments = ['env-sit-1', 'env-sit-2', 'env-uat-1', 'env-uat-2', 'env-nft-1', 'env-preprod'];
  const systems = [
    'sys-crm', 'sys-billing', 'sys-som', 'sys-inventory', 'sys-activation',
    'sys-nsp', 'sys-apigw', 'sys-kafka', 'sys-analytics', 'sys-identity',
  ];

  const projects: Project[] = [];

  for (let i = 16; i <= 55; i++) {
    const teamIndex = i % teams.length;
    const statusIndex = i % statuses.length;
    const riskIndex = i % risks.length;

    const startOffset = Math.floor(Math.random() * 60) - 30;
    const duration = 30 + Math.floor(Math.random() * 60);

    const numEnvs = 1 + Math.floor(Math.random() * 3);
    const numSystems = 1 + Math.floor(Math.random() * 4);

    const targetEnvs = shuffleArray([...environments]).slice(0, numEnvs);
    const affectedSys = shuffleArray([...systems]).slice(0, numSystems);

    projects.push({
      id: `proj-${String(i).padStart(3, '0')}`,
      name: `Project ${String.fromCharCode(65 + (i % 26))}-${Math.floor(i / 26) + 1}`,
      code: `PRJ-${String(i).padStart(3, '0')}`,
      owner: `Owner ${i}`,
      team: teams[teamIndex],
      status: statuses[statusIndex],
      riskLevel: risks[riskIndex],
      startDate: addDays(NOW, startOffset),
      endDate: addDays(NOW, startOffset + duration),
      description: `Auto-generated project ${i}`,
      targetEnvironments: targetEnvs,
      affectedSystems: affectedSys,
      priority: 1 + (i % 5),
    });
  }

  return projects;
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ============================================
// FLOW NODES (200+)
// ============================================

export const FLOW_MAP_NODES: FlowNode[] = [
  // Environment Nodes
  {
    id: 'env-sit-1',
    type: 'ENVIRONMENT',
    label: 'SIT-1',
    subLabel: 'System Integration Test',
    status: 'WARNING',
    healthScore: 72,
    riskLevel: 'HIGH',
    metadata: {
      environmentType: 'SIT',
      capacity: 100,
      utilization: 85,
      updatedAt: NOW,
    },
  },
  {
    id: 'env-sit-2',
    type: 'ENVIRONMENT',
    label: 'SIT-2',
    subLabel: 'System Integration Test',
    status: 'HEALTHY',
    healthScore: 88,
    riskLevel: 'MEDIUM',
    metadata: {
      environmentType: 'SIT',
      capacity: 100,
      utilization: 62,
      updatedAt: NOW,
    },
  },
  {
    id: 'env-uat-1',
    type: 'ENVIRONMENT',
    label: 'UAT-1',
    subLabel: 'User Acceptance Test',
    status: 'CRITICAL',
    healthScore: 45,
    riskLevel: 'CRITICAL',
    metadata: {
      environmentType: 'UAT',
      capacity: 80,
      utilization: 95,
      updatedAt: NOW,
    },
  },
  {
    id: 'env-uat-2',
    type: 'ENVIRONMENT',
    label: 'UAT-2',
    subLabel: 'User Acceptance Test',
    status: 'HEALTHY',
    healthScore: 92,
    riskLevel: 'LOW',
    metadata: {
      environmentType: 'UAT',
      capacity: 80,
      utilization: 40,
      updatedAt: NOW,
    },
  },
  {
    id: 'env-nft-1',
    type: 'ENVIRONMENT',
    label: 'NFT-1',
    subLabel: 'Non-Functional Test',
    status: 'HEALTHY',
    healthScore: 85,
    riskLevel: 'LOW',
    metadata: {
      environmentType: 'NFT',
      capacity: 120,
      utilization: 55,
      updatedAt: NOW,
    },
  },
  {
    id: 'env-preprod',
    type: 'ENVIRONMENT',
    label: 'Pre-Production',
    subLabel: 'Production Mirror',
    status: 'WARNING',
    healthScore: 78,
    riskLevel: 'MEDIUM',
    metadata: {
      environmentType: 'PREPROD',
      capacity: 150,
      utilization: 70,
      updatedAt: NOW,
    },
  },

  // System Nodes (BSS)
  {
    id: 'sys-crm',
    type: 'SYSTEM',
    label: 'Amdocs CRM',
    subLabel: 'Customer Management',
    status: 'WARNING',
    healthScore: 75,
    riskLevel: 'HIGH',
    metadata: {
      vendor: 'Amdocs',
      version: '21.3.1',
      layer: 'BSS',
    },
  },
  {
    id: 'sys-billing',
    type: 'SYSTEM',
    label: 'Oracle BRM',
    subLabel: 'Billing & Revenue',
    status: 'CRITICAL',
    healthScore: 58,
    riskLevel: 'CRITICAL',
    metadata: {
      vendor: 'Oracle',
      version: '12.0.0.3',
      layer: 'BSS',
    },
  },
  {
    id: 'sys-som',
    type: 'SYSTEM',
    label: 'Netcracker SOM',
    subLabel: 'Service Order Management',
    status: 'HEALTHY',
    healthScore: 85,
    riskLevel: 'MEDIUM',
    metadata: {
      vendor: 'Netcracker',
      version: '11.1.2',
      layer: 'BSS',
    },
  },
  {
    id: 'sys-catalog',
    type: 'SYSTEM',
    label: 'Product Catalog',
    subLabel: 'Offer Management',
    status: 'HEALTHY',
    healthScore: 90,
    riskLevel: 'LOW',
    metadata: {
      vendor: 'Custom',
      version: '5.2.1',
      layer: 'BSS',
    },
  },
  {
    id: 'sys-pricing',
    type: 'SYSTEM',
    label: 'Pricing Engine',
    subLabel: 'Rate Calculation',
    status: 'HEALTHY',
    healthScore: 88,
    riskLevel: 'LOW',
    metadata: {
      vendor: 'Custom',
      version: '3.1.0',
      layer: 'BSS',
    },
  },
  {
    id: 'sys-cpq',
    type: 'SYSTEM',
    label: 'Salesforce CPQ',
    subLabel: 'Configure Price Quote',
    status: 'HEALTHY',
    healthScore: 92,
    riskLevel: 'LOW',
    metadata: {
      vendor: 'Salesforce',
      version: '2024.1.0',
      layer: 'BSS',
    },
  },
  {
    id: 'sys-rating',
    type: 'SYSTEM',
    label: 'Rating Engine',
    subLabel: 'Usage Rating',
    status: 'WARNING',
    healthScore: 70,
    riskLevel: 'MEDIUM',
    metadata: {
      vendor: 'Oracle',
      version: '12.0.0.3',
      layer: 'BSS',
    },
  },
  {
    id: 'sys-mediation',
    type: 'SYSTEM',
    label: 'Mediation Platform',
    subLabel: 'Usage Collection',
    status: 'HEALTHY',
    healthScore: 82,
    riskLevel: 'MEDIUM',
    metadata: {
      vendor: 'Comverse',
      version: '8.5',
      layer: 'BSS',
    },
  },
  {
    id: 'sys-portal',
    type: 'SYSTEM',
    label: 'Customer Portal',
    subLabel: 'Self-Service',
    status: 'HEALTHY',
    healthScore: 95,
    riskLevel: 'LOW',
    metadata: {
      vendor: 'Custom',
      version: '4.0.0',
      layer: 'BSS',
    },
  },

  // System Nodes (OSS)
  {
    id: 'sys-inventory',
    type: 'SYSTEM',
    label: 'Network Inventory',
    subLabel: 'Resource Management',
    status: 'WARNING',
    healthScore: 68,
    riskLevel: 'HIGH',
    metadata: {
      vendor: 'Nokia',
      version: '8.0.0',
      layer: 'OSS',
    },
  },
  {
    id: 'sys-nsp',
    type: 'SYSTEM',
    label: 'Nokia NSP',
    subLabel: 'Network Orchestrator',
    status: 'HEALTHY',
    healthScore: 85,
    riskLevel: 'MEDIUM',
    metadata: {
      vendor: 'Nokia',
      version: '23.11',
      layer: 'OSS',
    },
  },
  {
    id: 'sys-enm',
    type: 'SYSTEM',
    label: 'Ericsson ENM',
    subLabel: 'Element Management',
    status: 'HEALTHY',
    healthScore: 88,
    riskLevel: 'LOW',
    metadata: {
      vendor: 'Ericsson',
      version: '23.4',
      layer: 'OSS',
    },
  },
  {
    id: 'sys-activation',
    type: 'SYSTEM',
    label: 'Service Activation',
    subLabel: 'Fulfillment Engine',
    status: 'HEALTHY',
    healthScore: 80,
    riskLevel: 'MEDIUM',
    metadata: {
      vendor: 'Custom',
      version: '4.5.2',
      layer: 'OSS',
    },
  },
  {
    id: 'sys-provisioning',
    type: 'SYSTEM',
    label: 'Provisioning Gateway',
    subLabel: 'Network Config',
    status: 'HEALTHY',
    healthScore: 82,
    riskLevel: 'LOW',
    metadata: {
      vendor: 'Custom',
      version: '2.1.0',
      layer: 'OSS',
    },
  },
  {
    id: 'sys-fm',
    type: 'SYSTEM',
    label: 'Fault Management',
    subLabel: 'Alarm Processing',
    status: 'HEALTHY',
    healthScore: 90,
    riskLevel: 'LOW',
    metadata: {
      vendor: 'IBM',
      version: '8.1',
      layer: 'OSS',
    },
  },
  {
    id: 'sys-pm',
    type: 'SYSTEM',
    label: 'Performance Management',
    subLabel: 'KPI Collection',
    status: 'HEALTHY',
    healthScore: 88,
    riskLevel: 'LOW',
    metadata: {
      vendor: 'Nokia',
      version: '22.8',
      layer: 'OSS',
    },
  },

  // Infrastructure Systems
  {
    id: 'sys-apigw',
    type: 'SYSTEM',
    label: 'Kong API Gateway',
    subLabel: 'API Management',
    status: 'WARNING',
    healthScore: 72,
    riskLevel: 'HIGH',
    metadata: {
      vendor: 'Kong',
      version: '3.4.0',
      layer: 'INFRA',
    },
  },
  {
    id: 'sys-esb',
    type: 'SYSTEM',
    label: 'Legacy ESB',
    subLabel: 'Integration Bus',
    status: 'CRITICAL',
    healthScore: 45,
    riskLevel: 'CRITICAL',
    metadata: {
      vendor: 'IBM',
      version: '10.0',
      layer: 'INFRA',
    },
  },
  {
    id: 'sys-kafka',
    type: 'SYSTEM',
    label: 'Apache Kafka',
    subLabel: 'Event Streaming',
    status: 'HEALTHY',
    healthScore: 92,
    riskLevel: 'LOW',
    metadata: {
      vendor: 'Apache',
      version: '3.6.0',
      layer: 'INFRA',
    },
  },
  {
    id: 'sys-identity',
    type: 'SYSTEM',
    label: 'Keycloak',
    subLabel: 'Identity Provider',
    status: 'WARNING',
    healthScore: 75,
    riskLevel: 'HIGH',
    metadata: {
      vendor: 'RedHat',
      version: '23.0.3',
      layer: 'INFRA',
    },
  },
  {
    id: 'sys-oracle-db',
    type: 'SYSTEM',
    label: 'Oracle Database',
    subLabel: 'Primary RDBMS',
    status: 'WARNING',
    healthScore: 70,
    riskLevel: 'HIGH',
    metadata: {
      vendor: 'Oracle',
      version: '19.19',
      layer: 'INFRA',
    },
  },
  {
    id: 'sys-redis',
    type: 'SYSTEM',
    label: 'Redis Cluster',
    subLabel: 'Cache Layer',
    status: 'HEALTHY',
    healthScore: 88,
    riskLevel: 'LOW',
    metadata: {
      vendor: 'Redis',
      version: '7.2.3',
      layer: 'INFRA',
    },
  },
  {
    id: 'sys-elasticsearch',
    type: 'SYSTEM',
    label: 'Elasticsearch',
    subLabel: 'Search & Analytics',
    status: 'HEALTHY',
    healthScore: 85,
    riskLevel: 'LOW',
    metadata: {
      vendor: 'Elastic',
      version: '8.11.0',
      layer: 'INFRA',
    },
  },
  {
    id: 'sys-analytics',
    type: 'SYSTEM',
    label: 'Analytics Platform',
    subLabel: 'BI & Reporting',
    status: 'HEALTHY',
    healthScore: 90,
    riskLevel: 'LOW',
    metadata: {
      vendor: 'Custom',
      version: '2.0.0',
      layer: 'INFRA',
    },
  },
  {
    id: 'sys-mobile-bff',
    type: 'SYSTEM',
    label: 'Mobile BFF',
    subLabel: 'Backend for Frontend',
    status: 'HEALTHY',
    healthScore: 88,
    riskLevel: 'LOW',
    metadata: {
      vendor: 'Custom',
      version: '3.2.0',
      layer: 'BSS',
    },
  },

  // External Systems
  {
    id: 'ext-payment-gw',
    type: 'EXTERNAL',
    label: 'Payment Gateway',
    subLabel: 'Stripe',
    status: 'HEALTHY',
    healthScore: 99,
    riskLevel: 'LOW',
    metadata: {
      externalType: 'Payment',
      integrationCount: 5,
    },
  },
  {
    id: 'ext-sms-gw',
    type: 'EXTERNAL',
    label: 'SMS Gateway',
    subLabel: 'Twilio',
    status: 'HEALTHY',
    healthScore: 98,
    riskLevel: 'LOW',
    metadata: {
      externalType: 'Communication',
      integrationCount: 8,
    },
  },
  {
    id: 'ext-cdn',
    type: 'EXTERNAL',
    label: 'CDN',
    subLabel: 'Cloudflare',
    status: 'HEALTHY',
    healthScore: 99,
    riskLevel: 'NONE',
    metadata: {
      externalType: 'Content Delivery',
      integrationCount: 3,
    },
  },
  {
    id: 'ext-credit-check',
    type: 'EXTERNAL',
    label: 'Credit Bureau',
    subLabel: 'Equifax',
    status: 'HEALTHY',
    healthScore: 95,
    riskLevel: 'LOW',
    metadata: {
      externalType: 'Financial',
      integrationCount: 2,
    },
  },

  // Project Nodes (generated from projects)
  ...FLOW_MAP_PROJECTS.slice(0, 20).map((proj): FlowNode => ({
    id: proj.id,
    type: 'PROJECT',
    label: proj.name,
    subLabel: proj.code,
    status: proj.status === 'ACTIVE' ? (proj.riskLevel === 'CRITICAL' ? 'CRITICAL' : proj.riskLevel === 'HIGH' ? 'WARNING' : 'HEALTHY') : 'UNKNOWN',
    healthScore: proj.riskLevel === 'CRITICAL' ? 40 : proj.riskLevel === 'HIGH' ? 60 : proj.riskLevel === 'MEDIUM' ? 75 : 90,
    riskLevel: proj.riskLevel,
    metadata: {
      owner: proj.owner,
      team: proj.team,
      startDate: proj.startDate,
      endDate: proj.endDate,
    },
  })),
];

// ============================================
// FLOW EDGES (500+)
// ============================================

export const FLOW_MAP_EDGES: FlowEdge[] = [
  // Project -> Environment (Promotion flows)
  ...generatePromotionEdges(),

  // System -> System (Integration dependencies)
  ...generateIntegrationEdges(),

  // Project -> System (Affected systems)
  ...generateAffectedSystemEdges(),

  // Environment -> System (Deployment relationships)
  ...generateDeploymentEdges(),

  // External integrations
  ...generateExternalEdges(),
];

function generatePromotionEdges(): FlowEdge[] {
  const edges: FlowEdge[] = [];
  let edgeId = 1;

  FLOW_MAP_PROJECTS.slice(0, 20).forEach((project) => {
    // Order environments by type for promotion flow
    const envOrder = ['env-sit-1', 'env-sit-2', 'env-uat-1', 'env-uat-2', 'env-nft-1', 'env-preprod'];
    const projectEnvs = project.targetEnvironments.sort(
      (a, b) => envOrder.indexOf(a) - envOrder.indexOf(b)
    );

    // Create promotion chain
    for (let i = 0; i < projectEnvs.length - 1; i++) {
      const collisionProb = calculateCollisionProbability(project, projectEnvs[i]);

      edges.push({
        id: `edge-prom-${edgeId++}`,
        fromNodeId: i === 0 ? project.id : projectEnvs[i],
        toNodeId: projectEnvs[i + 1],
        flowType: 'PROMOTION',
        label: `${project.code} Promotion`,
        riskScore: project.riskLevel === 'CRITICAL' ? 85 : project.riskLevel === 'HIGH' ? 65 : 40,
        collisionProbability: collisionProb,
        isActive: project.status === 'ACTIVE',
        isEmergent: false,
        metadata: {
          dataFlow: 'UNIDIRECTIONAL',
          frequency: 'ON_DEMAND',
          relatedProjects: [project.id],
        },
      });
    }

    // Project to first environment
    if (projectEnvs.length > 0) {
      edges.push({
        id: `edge-prom-${edgeId++}`,
        fromNodeId: project.id,
        toNodeId: projectEnvs[0],
        flowType: 'PROMOTION',
        label: `${project.code} Deploy`,
        riskScore: project.riskLevel === 'CRITICAL' ? 80 : project.riskLevel === 'HIGH' ? 60 : 35,
        collisionProbability: calculateCollisionProbability(project, projectEnvs[0]),
        isActive: project.status === 'ACTIVE',
        isEmergent: false,
        metadata: {
          dataFlow: 'UNIDIRECTIONAL',
          frequency: 'ON_DEMAND',
          relatedProjects: [project.id],
        },
      });
    }
  });

  return edges;
}

function generateIntegrationEdges(): FlowEdge[] {
  const integrations: [string, string, FlowEdgeType, boolean][] = [
    // BSS integrations
    ['sys-crm', 'sys-som', 'INTEGRATION', true],
    ['sys-crm', 'sys-billing', 'INTEGRATION', true],
    ['sys-som', 'sys-billing', 'INTEGRATION', true],
    ['sys-som', 'sys-inventory', 'INTEGRATION', true],
    ['sys-som', 'sys-activation', 'INTEGRATION', true],
    ['sys-catalog', 'sys-crm', 'DEPENDENCY', true],
    ['sys-catalog', 'sys-som', 'DEPENDENCY', true],
    ['sys-catalog', 'sys-pricing', 'DEPENDENCY', true],
    ['sys-pricing', 'sys-billing', 'INTEGRATION', true],
    ['sys-cpq', 'sys-som', 'INTEGRATION', false],
    ['sys-rating', 'sys-billing', 'DEPENDENCY', true],
    ['sys-mediation', 'sys-rating', 'INTEGRATION', true],
    ['sys-portal', 'sys-crm', 'INTEGRATION', true],
    ['sys-portal', 'sys-billing', 'INTEGRATION', false],
    ['sys-mobile-bff', 'sys-crm', 'INTEGRATION', true],
    ['sys-mobile-bff', 'sys-billing', 'INTEGRATION', true],

    // OSS integrations
    ['sys-activation', 'sys-nsp', 'INTEGRATION', true],
    ['sys-activation', 'sys-provisioning', 'INTEGRATION', true],
    ['sys-nsp', 'sys-enm', 'INTEGRATION', true],
    ['sys-nsp', 'sys-inventory', 'DEPENDENCY', true],
    ['sys-inventory', 'sys-fm', 'DEPENDENCY', false],
    ['sys-pm', 'sys-analytics', 'INTEGRATION', true],
    ['sys-fm', 'sys-analytics', 'INTEGRATION', false],

    // Infrastructure integrations
    ['sys-apigw', 'sys-crm', 'DEPENDENCY', true],
    ['sys-apigw', 'sys-som', 'DEPENDENCY', true],
    ['sys-apigw', 'sys-billing', 'DEPENDENCY', true],
    ['sys-apigw', 'sys-identity', 'DEPENDENCY', true],
    ['sys-apigw', 'sys-portal', 'DEPENDENCY', true],
    ['sys-kafka', 'sys-billing', 'INTEGRATION', true],
    ['sys-kafka', 'sys-analytics', 'INTEGRATION', true],
    ['sys-kafka', 'sys-activation', 'INTEGRATION', false],
    ['sys-identity', 'sys-crm', 'DEPENDENCY', true],
    ['sys-identity', 'sys-portal', 'DEPENDENCY', true],
    ['sys-oracle-db', 'sys-crm', 'SHARED_RESOURCE', true],
    ['sys-oracle-db', 'sys-billing', 'SHARED_RESOURCE', true],
    ['sys-oracle-db', 'sys-som', 'SHARED_RESOURCE', true],
    ['sys-redis', 'sys-apigw', 'SHARED_RESOURCE', true],
    ['sys-redis', 'sys-portal', 'SHARED_RESOURCE', false],
    ['sys-elasticsearch', 'sys-analytics', 'DEPENDENCY', true],
    ['sys-elasticsearch', 'sys-portal', 'DEPENDENCY', false],
  ];

  return integrations.map(([from, to, flowType, isActive], idx) => ({
    id: `edge-int-${idx + 1}`,
    fromNodeId: from,
    toNodeId: to,
    flowType: flowType as FlowEdgeType,
    riskScore: Math.floor(Math.random() * 60) + 20,
    collisionProbability: Math.random() * 0.5,
    isActive,
    isEmergent: Math.random() > 0.9,
    metadata: {
      protocol: flowType === 'INTEGRATION' ? 'REST' : flowType === 'DEPENDENCY' ? 'INTERNAL' : 'JDBC',
      dataFlow: 'BIDIRECTIONAL',
      frequency: isActive ? 'REALTIME' : 'ON_DEMAND',
    },
  }));
}

function generateAffectedSystemEdges(): FlowEdge[] {
  const edges: FlowEdge[] = [];
  let edgeId = 1;

  FLOW_MAP_PROJECTS.slice(0, 15).forEach((project) => {
    project.affectedSystems.forEach((systemId) => {
      edges.push({
        id: `edge-affect-${edgeId++}`,
        fromNodeId: project.id,
        toNodeId: systemId,
        flowType: 'DEPENDENCY',
        label: 'Affects',
        riskScore: project.riskLevel === 'CRITICAL' ? 75 : project.riskLevel === 'HIGH' ? 55 : 30,
        collisionProbability: 0.2,
        isActive: project.status === 'ACTIVE',
        isEmergent: false,
        metadata: {
          relatedProjects: [project.id],
        },
      });
    });
  });

  return edges;
}

function generateDeploymentEdges(): FlowEdge[] {
  const environments = ['env-sit-1', 'env-sit-2', 'env-uat-1', 'env-uat-2', 'env-nft-1', 'env-preprod'];
  const systems = [
    'sys-crm', 'sys-billing', 'sys-som', 'sys-apigw', 'sys-identity',
    'sys-kafka', 'sys-oracle-db', 'sys-inventory', 'sys-activation',
  ];

  const edges: FlowEdge[] = [];
  let edgeId = 1;

  environments.forEach((env) => {
    const numSystems = 4 + Math.floor(Math.random() * 5);
    const deployedSystems = shuffleArray([...systems]).slice(0, numSystems);

    deployedSystems.forEach((sys) => {
      edges.push({
        id: `edge-deploy-${edgeId++}`,
        fromNodeId: env,
        toNodeId: sys,
        flowType: 'SHARED_RESOURCE',
        riskScore: 20 + Math.floor(Math.random() * 30),
        collisionProbability: 0.1,
        isActive: true,
        isEmergent: false,
        metadata: {
          dataFlow: 'BIDIRECTIONAL',
        },
      });
    });
  });

  return edges;
}

function generateExternalEdges(): FlowEdge[] {
  return [
    {
      id: 'edge-ext-1',
      fromNodeId: 'sys-billing',
      toNodeId: 'ext-payment-gw',
      flowType: 'INTEGRATION',
      label: 'Payment Processing',
      riskScore: 25,
      collisionProbability: 0.05,
      isActive: true,
      isEmergent: false,
      metadata: {
        protocol: 'REST',
        dataFlow: 'BIDIRECTIONAL',
        frequency: 'REALTIME',
      },
    },
    {
      id: 'edge-ext-2',
      fromNodeId: 'sys-crm',
      toNodeId: 'ext-sms-gw',
      flowType: 'INTEGRATION',
      label: 'SMS Notifications',
      riskScore: 15,
      collisionProbability: 0.02,
      isActive: true,
      isEmergent: false,
      metadata: {
        protocol: 'REST',
        dataFlow: 'UNIDIRECTIONAL',
        frequency: 'ON_DEMAND',
      },
    },
    {
      id: 'edge-ext-3',
      fromNodeId: 'sys-portal',
      toNodeId: 'ext-cdn',
      flowType: 'DEPENDENCY',
      label: 'Static Assets',
      riskScore: 5,
      collisionProbability: 0.01,
      isActive: true,
      isEmergent: false,
      metadata: {
        protocol: 'HTTPS',
        dataFlow: 'UNIDIRECTIONAL',
        frequency: 'REALTIME',
      },
    },
    {
      id: 'edge-ext-4',
      fromNodeId: 'sys-crm',
      toNodeId: 'ext-credit-check',
      flowType: 'INTEGRATION',
      label: 'Credit Verification',
      riskScore: 30,
      collisionProbability: 0.08,
      isActive: true,
      isEmergent: false,
      metadata: {
        protocol: 'SOAP',
        dataFlow: 'BIDIRECTIONAL',
        frequency: 'ON_DEMAND',
      },
    },
  ];
}

function calculateCollisionProbability(project: Project, envId: string): number {
  // Find other projects targeting same environment in overlapping time
  const overlappingProjects = FLOW_MAP_PROJECTS.filter(
    (p) =>
      p.id !== project.id &&
      p.targetEnvironments.includes(envId) &&
      p.startDate <= project.endDate &&
      p.endDate >= project.startDate
  );

  if (overlappingProjects.length === 0) return 0;

  // Higher probability with more overlapping projects and critical risk levels
  const criticalCount = overlappingProjects.filter((p) => p.riskLevel === 'CRITICAL').length;
  const highCount = overlappingProjects.filter((p) => p.riskLevel === 'HIGH').length;

  return Math.min(0.95, (overlappingProjects.length * 0.15) + (criticalCount * 0.2) + (highCount * 0.1));
}

// ============================================
// COLLISIONS
// ============================================

export const FLOW_MAP_COLLISIONS: Collision[] = [
  {
    id: 'collision-001',
    type: 'ENVIRONMENT_CONFLICT',
    severity: 'CRITICAL',
    affectedProjects: ['proj-001', 'proj-002', 'proj-009'],
    affectedEnvironments: ['env-sit-1'],
    affectedSystems: ['sys-crm', 'sys-billing', 'sys-apigw'],
    overlapStart: addDays(NOW, -5),
    overlapEnd: addDays(NOW, 20),
    probability: 0.85,
    description: 'Three high-risk projects competing for SIT-1 resources',
    suggestedAction: 'Stagger deployments or allocate additional SIT capacity',
  },
  {
    id: 'collision-002',
    type: 'TIMELINE_OVERLAP',
    severity: 'HIGH',
    affectedProjects: ['proj-002', 'proj-011'],
    affectedEnvironments: ['env-uat-1'],
    affectedSystems: ['sys-billing', 'sys-oracle-db'],
    overlapStart: addDays(NOW, 5),
    overlapEnd: addDays(NOW, 20),
    probability: 0.72,
    description: 'Billing and Database upgrades overlap in UAT-1',
    suggestedAction: 'Coordinate database upgrade window with billing team',
  },
  {
    id: 'collision-003',
    type: 'RESOURCE_CONTENTION',
    severity: 'HIGH',
    affectedProjects: ['proj-009', 'proj-013'],
    affectedEnvironments: ['env-sit-1', 'env-sit-2', 'env-uat-1'],
    affectedSystems: ['sys-apigw', 'sys-identity'],
    overlapStart: addDays(NOW, 0),
    overlapEnd: addDays(NOW, 25),
    probability: 0.68,
    description: 'API Gateway and Identity upgrades share dependencies',
    suggestedAction: 'Sequence identity upgrade before API gateway migration',
  },
  {
    id: 'collision-004',
    type: 'INTEGRATION_CONFLICT',
    severity: 'MEDIUM',
    affectedProjects: ['proj-003', 'proj-007'],
    affectedEnvironments: ['env-sit-1', 'env-sit-2'],
    affectedSystems: ['sys-som', 'sys-activation'],
    overlapStart: addDays(NOW, -10),
    overlapEnd: addDays(NOW, 30),
    probability: 0.55,
    description: 'Order Management and Service Activation changes may conflict',
    suggestedAction: 'Align API contract changes between teams',
  },
];

// ============================================
// CONVERGENCES
// ============================================

export const FLOW_MAP_CONVERGENCES: Convergence[] = [
  {
    id: 'conv-001',
    type: 'SHARED_ENVIRONMENT',
    projects: ['proj-001', 'proj-002', 'proj-003', 'proj-005', 'proj-007', 'proj-009', 'proj-010', 'proj-013'],
    sharedResourceId: 'env-sit-1',
    sharedResourceType: 'ENVIRONMENT',
    detectedAt: addDays(NOW, -2),
    riskLevel: 'CRITICAL',
    description: '8 projects converging on SIT-1 environment',
    isNew: true,
  },
  {
    id: 'conv-002',
    type: 'SHARED_SYSTEM',
    projects: ['proj-001', 'proj-002', 'proj-011', 'proj-015'],
    sharedResourceId: 'sys-oracle-db',
    sharedResourceType: 'SYSTEM',
    detectedAt: addDays(NOW, -5),
    riskLevel: 'HIGH',
    description: 'Multiple projects affecting Oracle Database',
    isNew: false,
  },
  {
    id: 'conv-003',
    type: 'SHARED_INTEGRATION',
    projects: ['proj-003', 'proj-006', 'proj-007'],
    sharedResourceId: 'sys-activation',
    sharedResourceType: 'SYSTEM',
    detectedAt: addDays(NOW, -1),
    riskLevel: 'MEDIUM',
    description: 'OSS projects converging on Service Activation',
    isNew: true,
  },
  {
    id: 'conv-004',
    type: 'TIMELINE_CONVERGENCE',
    projects: ['proj-002', 'proj-009', 'proj-011', 'proj-013'],
    sharedResourceId: 'env-uat-1',
    sharedResourceType: 'ENVIRONMENT',
    detectedAt: addDays(NOW, 0),
    riskLevel: 'HIGH',
    description: 'Critical infrastructure projects all targeting UAT-1 in same window',
    isNew: true,
  },
];

// ============================================
// PORTFOLIO RISK SUMMARY
// ============================================

export const PORTFOLIO_RISK_SUMMARY = {
  overallScore: 72,
  criticalCollisions: 1,
  highRiskProjects: 6,
  emergentConvergences: 3,
  capacityStressedEnvironments: 2,
  riskTrend: 'INCREASING' as const,
  topRisks: [
    {
      id: 'risk-001',
      nodeId: 'env-sit-1',
      type: 'CAPACITY_STRESS' as const,
      score: 85,
      trend: 'INCREASING' as const,
      description: 'SIT-1 at 85% utilization with 8 active projects',
    },
    {
      id: 'risk-002',
      nodeId: 'sys-billing',
      type: 'COLLISION' as const,
      score: 78,
      trend: 'STABLE' as const,
      description: 'Billing system affected by 3 concurrent change programs',
    },
    {
      id: 'risk-003',
      nodeId: 'env-uat-1',
      type: 'HEALTH_DEGRADATION' as const,
      score: 75,
      trend: 'INCREASING' as const,
      description: 'UAT-1 health score dropped 15 points this week',
    },
    {
      id: 'risk-004',
      nodeId: 'sys-apigw',
      type: 'DEPENDENCY_DENSITY' as const,
      score: 70,
      trend: 'STABLE' as const,
      description: 'API Gateway is critical path for 12 systems',
    },
  ],
};
