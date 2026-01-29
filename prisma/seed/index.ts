// Nexorium Core - Seed Data Script
// Realistic Telco Test Environment Topology
// Run with: npx prisma db seed

import { PrismaClient } from '@prisma/client';
import { seedCostData } from './cost-data';
import { seedGovernanceData } from './governance-data';
import { seedCanonical5LayerData } from './canonical-5layer-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Nexorium Core database with realistic telco topology...\n');

  // Clear existing data (in dependency order)
  // Governance alignment tables
  await prisma.couplingLink.deleteMany({});
  await prisma.exceptionItem.deleteMany({});
  await prisma.approvalItem.deleteMany({});
  await prisma.complianceResult.deleteMany({});
  await prisma.policyControl.deleteMany({});
  // Organisation tables
  await prisma.rACIMapping.deleteMany({});
  await prisma.orphanedAsset.deleteMany({});
  await prisma.person.deleteMany({});
  await prisma.ruleEvaluation.deleteMany({});
  await prisma.alignmentComparison.deleteMany({});
  await prisma.governanceRule.deleteMany({});
  await prisma.releaseItem.deleteMany({});
  await prisma.release.deleteMany({});
  await prisma.blueprint.deleteMany({});
  await prisma.integrationRule.deleteMany({});
  await prisma.connector.deleteMany({});
  await prisma.platformSetting.deleteMany({});
  await prisma.environmentLink.deleteMany({});
  await prisma.flowTemplateStage.deleteMany({});
  await prisma.flowTemplate.deleteMany({});
  await prisma.refreshRecord.deleteMany({});
  await prisma.testDataSet.deleteMany({});
  await prisma.databaseMetadata.deleteMany({});
  await prisma.evidence.deleteMany({});
  await prisma.environmentSnapshot.deleteMany({});
  await prisma.edge.deleteMany({});
  await prisma.node.deleteMany({});
  await prisma.environment.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.stage.deleteMany({});

  // ============================================
  // STAGES - Pipeline stages
  // ============================================
  const stages = await Promise.all([
    prisma.stage.create({
      data: {
        id: 'stage-dev',
        key: 'DEV',
        name: 'Development',
        description: 'Development and feature branches',
        sortOrder: 1,
        color: '#6366f1', // indigo
      },
    }),
    prisma.stage.create({
      data: {
        id: 'stage-sit',
        key: 'SIT',
        name: 'System Integration Test',
        description: 'Full system integration testing',
        sortOrder: 2,
        color: '#8b5cf6', // violet
      },
    }),
    prisma.stage.create({
      data: {
        id: 'stage-uat',
        key: 'UAT',
        name: 'User Acceptance Test',
        description: 'Business validation with production-like data',
        sortOrder: 3,
        color: '#06b6d4', // cyan
      },
    }),
    prisma.stage.create({
      data: {
        id: 'stage-nft',
        key: 'NFT',
        name: 'Non-Functional Test',
        description: 'Performance, load, and stress testing',
        sortOrder: 4,
        color: '#f59e0b', // amber
      },
    }),
    prisma.stage.create({
      data: {
        id: 'stage-preprod',
        key: 'PREPROD',
        name: 'Pre-Production',
        description: 'Final validation before production',
        sortOrder: 5,
        color: '#10b981', // emerald
      },
    }),
    prisma.stage.create({
      data: {
        id: 'stage-prod-ro',
        key: 'PROD_RO',
        name: 'Production (Read-Only)',
        description: 'Read-only production reference',
        sortOrder: 6,
        color: '#ef4444', // red
      },
    }),
  ]);
  console.log(`✓ Created ${stages.length} stages`);

  // ============================================
  // PROJECTS - Programme/Project containers
  // ============================================
  const bssTransformProject = await prisma.project.create({
    data: {
      id: 'project-bss-transform',
      name: 'BSS Transformation Programme',
      code: 'BSS-TX',
      description: 'Enterprise-wide BSS modernisation initiative. Consolidating CRM, billing, and order management systems into a unified stack with API-first architecture.',
      status: 'ACTIVE',
      ownerTeam: 'Digital Transformation Office',
      ownerEmail: 'bss-transformation@telco.com',
      businessUnit: 'Consumer & SME',
      costCenter: 'CC-DTX-001',
      createdBy: 'John Mitchell',
    },
  });

  const ossModernProject = await prisma.project.create({
    data: {
      id: 'project-oss-modern',
      name: 'OSS Modernisation',
      code: 'OSS-MOD',
      description: 'Network operations modernisation programme. Migrating from legacy orchestration to cloud-native service orchestration with Cisco NSO and Nokia NetAct integration.',
      status: 'ACTIVE',
      ownerTeam: 'Network Engineering',
      ownerEmail: 'oss-modern@telco.com',
      businessUnit: 'Network Operations',
      costCenter: 'CC-NET-042',
      createdBy: 'Sarah Chen',
    },
  });

  const dataAnalyticsProject = await prisma.project.create({
    data: {
      id: 'project-data-analytics',
      name: 'Data & Analytics Platform',
      code: 'DAP',
      description: 'Enterprise data platform initiative. Building unified data lake with real-time streaming, ML/AI capabilities, and self-service BI for business users.',
      status: 'PLANNING',
      ownerTeam: 'Data & Analytics Centre of Excellence',
      ownerEmail: 'data-coe@telco.com',
      businessUnit: 'Corporate IT',
      costCenter: 'CC-IT-088',
      createdBy: 'Alex Kumar',
    },
  });

  const securityComplianceProject = await prisma.project.create({
    data: {
      id: 'project-security-compliance',
      name: 'Security & Compliance Uplift',
      code: 'SEC-CMP',
      description: 'Security hardening and compliance programme. Implementing zero-trust architecture, enhanced IAM, and regulatory compliance (PCI-DSS, SOC2, GDPR).',
      status: 'ACTIVE',
      ownerTeam: 'Information Security',
      ownerEmail: 'infosec@telco.com',
      businessUnit: 'Risk & Compliance',
      costCenter: 'CC-SEC-015',
      createdBy: 'Maria Santos',
    },
  });

  console.log(`✓ Created 4 projects`);

  // ============================================
  // FLOW TEMPLATES - Allowed transition patterns
  // ============================================
  const standardFlowTemplate = await prisma.flowTemplate.create({
    data: {
      id: 'flow-standard',
      name: 'Standard Release Flow',
      description: 'DEV → SIT → UAT → PREPROD → PROD',
      status: 'ACTIVE',
      isDefault: true,
    },
  });

  const nftFlowTemplate = await prisma.flowTemplate.create({
    data: {
      id: 'flow-with-nft',
      name: 'Release Flow with NFT',
      description: 'DEV → SIT → UAT → NFT → PREPROD → PROD',
      status: 'ACTIVE',
      isDefault: false,
    },
  });

  // Add stages to flow templates
  await Promise.all([
    // Standard flow: DEV → SIT → UAT → PREPROD → PROD_RO
    prisma.flowTemplateStage.create({ data: { flowTemplateId: standardFlowTemplate.id, stageId: 'stage-dev', sortOrder: 1, isRequired: true } }),
    prisma.flowTemplateStage.create({ data: { flowTemplateId: standardFlowTemplate.id, stageId: 'stage-sit', sortOrder: 2, isRequired: true } }),
    prisma.flowTemplateStage.create({ data: { flowTemplateId: standardFlowTemplate.id, stageId: 'stage-uat', sortOrder: 3, isRequired: true } }),
    prisma.flowTemplateStage.create({ data: { flowTemplateId: standardFlowTemplate.id, stageId: 'stage-preprod', sortOrder: 4, isRequired: true } }),
    prisma.flowTemplateStage.create({ data: { flowTemplateId: standardFlowTemplate.id, stageId: 'stage-prod-ro', sortOrder: 5, isRequired: true } }),
    // NFT flow: DEV → SIT → UAT → NFT → PREPROD → PROD_RO
    prisma.flowTemplateStage.create({ data: { flowTemplateId: nftFlowTemplate.id, stageId: 'stage-dev', sortOrder: 1, isRequired: true } }),
    prisma.flowTemplateStage.create({ data: { flowTemplateId: nftFlowTemplate.id, stageId: 'stage-sit', sortOrder: 2, isRequired: true } }),
    prisma.flowTemplateStage.create({ data: { flowTemplateId: nftFlowTemplate.id, stageId: 'stage-uat', sortOrder: 3, isRequired: true } }),
    prisma.flowTemplateStage.create({ data: { flowTemplateId: nftFlowTemplate.id, stageId: 'stage-nft', sortOrder: 4, isRequired: false } }),
    prisma.flowTemplateStage.create({ data: { flowTemplateId: nftFlowTemplate.id, stageId: 'stage-preprod', sortOrder: 5, isRequired: true } }),
    prisma.flowTemplateStage.create({ data: { flowTemplateId: nftFlowTemplate.id, stageId: 'stage-prod-ro', sortOrder: 6, isRequired: true } }),
  ]);
  console.log(`✓ Created 2 flow templates with stages`);

  // ============================================
  // PEOPLE - People registry
  // ============================================
  const people = await Promise.all([
    prisma.person.create({
      data: {
        id: 'person-john-smith',
        email: 'john.smith@telco.com',
        displayName: 'John Smith',
        department: 'Engineering',
        team: 'Platform Engineering',
        role: 'Tech Lead',
        status: 'ACTIVE',
      },
    }),
    prisma.person.create({
      data: {
        id: 'person-jane-doe',
        email: 'jane.doe@telco.com',
        displayName: 'Jane Doe',
        department: 'Engineering',
        team: 'Order Fulfillment',
        role: 'Senior Developer',
        status: 'ACTIVE',
      },
    }),
    prisma.person.create({
      data: {
        id: 'person-mike-wilson',
        email: 'mike.wilson@telco.com',
        displayName: 'Mike Wilson',
        department: 'Operations',
        team: 'DBA Team',
        role: 'Database Administrator',
        status: 'ACTIVE',
      },
    }),
    prisma.person.create({
      data: {
        id: 'person-sarah-chen',
        email: 'sarah.chen@telco.com',
        displayName: 'Sarah Chen',
        department: 'Engineering',
        team: 'Network Automation',
        role: 'Principal Engineer',
        status: 'ACTIVE',
      },
    }),
    prisma.person.create({
      data: {
        id: 'person-tom-brown',
        email: 'tom.brown@telco.com',
        displayName: 'Tom Brown',
        department: 'Quality Assurance',
        team: 'Test Team',
        role: 'QA Lead',
        status: 'ACTIVE',
      },
    }),
  ]);
  console.log(`✓ Created ${people.length} people`);

  // ============================================
  // GOVERNANCE RULES
  // ============================================
  await Promise.all([
    prisma.governanceRule.create({
      data: {
        id: 'rule-version-pattern',
        name: 'Version Format Compliance',
        description: 'All deployments must have semantic version format',
        ruleType: 'VERSION_CHECK',
        severity: 'ERROR',
        isActive: true,
        configJson: { pattern: '^\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9]+)?$' },
        targetStages: ['UAT', 'NFT', 'PREPROD', 'PROD_RO'],
      },
    }),
    prisma.governanceRule.create({
      data: {
        id: 'rule-api-gateway-required',
        name: 'API Gateway Required',
        description: 'All environments must have an API Gateway component',
        ruleType: 'COMPONENT_PRESENCE',
        severity: 'BLOCKER',
        isActive: true,
        configJson: { componentName: 'API_GW' },
        targetStages: ['SIT', 'UAT', 'NFT', 'PREPROD', 'PROD_RO'],
      },
    }),
    prisma.governanceRule.create({
      data: {
        id: 'rule-db-connection',
        name: 'Database Connection Required',
        description: 'Application components must connect to database',
        ruleType: 'CONNECTION_REQUIRED',
        severity: 'WARNING',
        isActive: true,
        configJson: { connectionRequired: { from: 'APPLICATION', to: 'DATABASE' } },
        targetStages: ['SIT', 'UAT', 'PREPROD'],
      },
    }),
  ]);
  console.log(`✓ Created 3 governance rules`);

  // ============================================
  // CONNECTORS
  // ============================================
  await Promise.all([
    prisma.connector.create({
      data: {
        id: 'connector-k8s-sit',
        name: 'Kubernetes SIT Cluster',
        connectorType: 'KUBERNETES',
        description: 'Auto-discovery from SIT Kubernetes cluster',
        status: 'ACTIVE',
        configJson: { namespace: 'telco-sit', labelSelector: 'app.kubernetes.io/managed-by=nexorium' },
        scheduleJson: { enabled: true, intervalMinutes: 60 },
        lastRunAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        lastRunStatus: 'SUCCESS',
      },
    }),
    prisma.connector.create({
      data: {
        id: 'connector-cmdb',
        name: 'ServiceNow CMDB',
        connectorType: 'CMDB',
        description: 'Import from ServiceNow Configuration Management Database',
        status: 'ACTIVE',
        configJson: { instanceUrl: 'https://telco.service-now.com', tableName: 'cmdb_ci_server' },
        scheduleJson: { enabled: true, cronExpression: '0 2 * * *' },
        lastRunAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        lastRunStatus: 'SUCCESS',
      },
    }),
    prisma.connector.create({
      data: {
        id: 'connector-manual',
        name: 'Manual Import',
        connectorType: 'MANUAL',
        description: 'Manual YAML/JSON imports',
        status: 'ACTIVE',
      },
    }),
  ]);
  console.log(`✓ Created 3 connectors`);

  // ============================================
  // PLATFORM SETTINGS
  // ============================================
  await Promise.all([
    prisma.platformSetting.create({
      data: {
        key: 'staleness.threshold.days',
        value: '30',
        valueType: 'number',
        scope: 'GLOBAL',
        description: 'Number of days before data is considered stale',
      },
    }),
    prisma.platformSetting.create({
      data: {
        key: 'snapshot.auto.create',
        value: 'true',
        valueType: 'boolean',
        scope: 'GLOBAL',
        description: 'Automatically create snapshots after connector runs',
      },
    }),
    prisma.platformSetting.create({
      data: {
        key: 'governance.enforce.promotion',
        value: 'true',
        valueType: 'boolean',
        scope: 'GLOBAL',
        description: 'Enforce governance rules before promotion',
      },
    }),
  ]);
  console.log(`✓ Created 3 platform settings`);

  // ============================================
  // DEV Environment - Development (BSS Transformation)
  // ============================================
  const devEnv = await prisma.environment.create({
    data: {
      id: 'dev-env-001',
      name: 'BSS-TX DEV',
      type: 'DEV',
      description: 'Development environment for BSS Transformation - Feature development and unit testing',
      stageId: 'stage-dev',
      projectId: bssTransformProject.id,
    },
  });
  console.log(`✓ Created environment: ${devEnv.name}`);

  // DEV Environment Nodes
  const devNodes = [
    { id: 'dev-api-gateway', name: 'Kong-API-Gateway', type: 'GATEWAY' as const, owner: 'Platform Engineering', criticality: 'HIGH' as const, metadata: { hostname: 'kong-dev.telco.internal', ip: '10.0.1.10', port: 8443, version: '3.4.2' } },
    { id: 'dev-crm-app', name: 'Salesforce-CRM', type: 'APPLICATION' as const, owner: 'CRM Team', criticality: 'HIGH' as const, metadata: { hostname: 'crm-dev.telco.internal', ip: '10.0.2.10', port: 8080, version: 'Spring 2024' } },
    { id: 'dev-cpq-engine', name: 'CPQ-Engine', type: 'APPLICATION' as const, owner: 'CPQ Team', criticality: 'HIGH' as const, metadata: { hostname: 'cpq-dev.telco.internal', ip: '10.0.2.11', port: 8080, version: '5.2.0' } },
    { id: 'dev-order-mgmt', name: 'Order-Management-System', type: 'APPLICATION' as const, owner: 'Order Fulfillment Team', criticality: 'HIGH' as const, metadata: { hostname: 'oms-dev.telco.internal', ip: '10.0.3.10', port: 8080, version: '7.3.1' } },
    { id: 'dev-kafka', name: 'Kafka-Local', type: 'MESSAGE_QUEUE' as const, owner: 'Platform Engineering', criticality: 'MEDIUM' as const, metadata: { hostname: 'kafka-dev.telco.internal', ip: '10.0.4.10', port: 9092, version: '3.6.0', brokers: 1 } },
    { id: 'dev-postgres', name: 'PostgreSQL-Dev', type: 'DATABASE' as const, owner: 'DBA Team', criticality: 'HIGH' as const, metadata: { hostname: 'pg-dev.telco.internal', ip: '10.0.5.10', port: 5432, database: 'telco_dev' } },
    { id: 'dev-redis', name: 'Redis-Local', type: 'DATABASE' as const, owner: 'Platform Engineering', criticality: 'MEDIUM' as const, metadata: { hostname: 'redis-dev.telco.internal', ip: '10.0.5.11', port: 6379 } },
    { id: 'dev-mock-payment', name: 'Mock-Payment-Gateway', type: 'EXTERNAL' as const, owner: 'Dev Team', criticality: 'LOW' as const, metadata: { endpoint: 'http://localhost:9999/mock-payment' } },
  ];

  for (const node of devNodes) {
    await prisma.node.create({
      data: {
        ...node,
        environmentId: devEnv.id,
        lastSeenAt: new Date(),
        metadata: node.metadata,
      },
    });
  }
  console.log(`✓ Created ${devNodes.length} nodes for DEV`);

  const devEdges = [
    { source: 'dev-api-gateway', target: 'dev-crm-app', protocol: 'REST' as const, port: 8080, confidence: 0.95 },
    { source: 'dev-api-gateway', target: 'dev-cpq-engine', protocol: 'REST' as const, port: 8080, confidence: 0.95 },
    { source: 'dev-api-gateway', target: 'dev-order-mgmt', protocol: 'REST' as const, port: 8080, confidence: 0.95 },
    { source: 'dev-crm-app', target: 'dev-cpq-engine', protocol: 'REST' as const, port: 8080, confidence: 0.88 },
    { source: 'dev-cpq-engine', target: 'dev-order-mgmt', protocol: 'REST' as const, port: 8080, confidence: 0.90 },
    { source: 'dev-crm-app', target: 'dev-postgres', protocol: 'JDBC' as const, port: 5432, confidence: 0.99 },
    { source: 'dev-cpq-engine', target: 'dev-postgres', protocol: 'JDBC' as const, port: 5432, confidence: 0.99 },
    { source: 'dev-order-mgmt', target: 'dev-postgres', protocol: 'JDBC' as const, port: 5432, confidence: 0.99 },
    { source: 'dev-order-mgmt', target: 'dev-kafka', protocol: 'EVENT' as const, port: 9092, confidence: 0.92 },
    { source: 'dev-api-gateway', target: 'dev-redis', protocol: 'JDBC' as const, port: 6379, confidence: 0.95 },
    { source: 'dev-order-mgmt', target: 'dev-mock-payment', protocol: 'REST' as const, port: 9999, confidence: 0.75 },
  ];

  let devEdgeIndex = 0;
  for (const edge of devEdges) {
    await prisma.edge.create({
      data: {
        id: `dev-edge-${devEdgeIndex}`,
        environmentId: devEnv.id,
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
        protocol: edge.protocol,
        port: edge.port,
        confidenceScore: edge.confidence,
        lastObservedAt: new Date(),
      },
    });
    devEdgeIndex++;
  }
  console.log(`✓ Created ${devEdges.length} edges for DEV`);

  // Add database metadata for DEV databases
  await Promise.all([
    prisma.databaseMetadata.create({
      data: {
        nodeId: 'dev-postgres',
        engine: 'PostgreSQL',
        version: '15.3',
        host: 'pg-dev.telco.internal',
        port: 5432,
      },
    }),
    prisma.databaseMetadata.create({
      data: {
        nodeId: 'dev-redis',
        engine: 'Redis',
        version: '7.0.0',
        host: 'redis-dev.telco.internal',
        port: 6379,
      },
    }),
  ]);
  console.log(`✓ Created 2 database metadata entries for DEV`);

  // ============================================
  // SIT Environment - Full Telco OSS/BSS Stack (BSS Transformation)
  // ============================================
  const sitEnv = await prisma.environment.create({
    data: {
      id: 'sit-env-001',
      name: 'BSS-TX SIT',
      type: 'SIT',
      description: 'System Integration Test - Full OSS/BSS stack with CRM, CPQ, Order Fulfillment, Network Orchestration',
      stageId: 'stage-sit',
      projectId: bssTransformProject.id,
    },
  });
  console.log(`✓ Created environment: ${sitEnv.name}`);

  // ============================================
  // UAT Environment - Business Validation (BSS Transformation)
  // ============================================
  const uatEnv = await prisma.environment.create({
    data: {
      id: 'uat-env-001',
      name: 'BSS-TX UAT',
      type: 'UAT',
      description: 'User Acceptance Test - Business validation with production-like data for BSS Transformation',
      stageId: 'stage-uat',
      projectId: bssTransformProject.id,
    },
  });
  console.log(`✓ Created environment: ${uatEnv.name}`);

  // ============================================
  // NFT Environment - Performance Testing (OSS Modernisation)
  // ============================================
  const nftEnv = await prisma.environment.create({
    data: {
      id: 'nft-env-001',
      name: 'OSS-MOD NFT',
      type: 'NFT',
      description: 'Non-Functional Test - Performance and load testing for OSS Modernisation network orchestration components',
      stageId: 'stage-nft',
      projectId: ossModernProject.id,
    },
  });
  console.log(`✓ Created environment: ${nftEnv.name}`);

  // ============================================
  // PREPROD Environment - Pre-Production (Security & Compliance)
  // ============================================
  const preprodEnv = await prisma.environment.create({
    data: {
      id: 'preprod-env-001',
      name: 'SEC-CMP PREPROD',
      type: 'PREPROD',
      description: 'Pre-Production - Final validation for Security & Compliance Uplift programme with full PCI-DSS scope',
      stageId: 'stage-preprod',
      projectId: securityComplianceProject.id,
    },
  });
  console.log(`✓ Created environment: ${preprodEnv.name}`);

  // PREPROD Environment Nodes - Production-mirror topology
  const preprodNodes = [
    { id: 'preprod-f5-lb', name: 'F5-LTM-PREPROD', type: 'LOAD_BALANCER' as const, owner: 'Network Operations', criticality: 'CRITICAL' as const, metadata: { hostname: 'f5-preprod.telco.internal', ip: '10.60.1.10', segment: 'DMZ', vendor: 'F5 Networks' } },
    { id: 'preprod-firewall', name: 'Palo-Alto-PREPROD', type: 'GATEWAY' as const, owner: 'Security Operations', criticality: 'CRITICAL' as const, metadata: { hostname: 'pa-fw-preprod.telco.internal', ip: '10.60.1.1', segment: 'DMZ', vendor: 'Palo Alto' } },
    { id: 'preprod-api-gw', name: 'Kong-API-Gateway', type: 'GATEWAY' as const, owner: 'Platform Engineering', criticality: 'CRITICAL' as const, metadata: { hostname: 'kong-preprod.telco.internal', ip: '10.60.2.10', port: 8443, version: '3.4.2' } },
    { id: 'preprod-crm', name: 'Salesforce-CRM', type: 'APPLICATION' as const, owner: 'CRM Team', criticality: 'CRITICAL' as const, metadata: { hostname: 'crm-preprod.telco.internal', instance: 'telco-preprod.my.salesforce.com', version: 'Spring 2024' } },
    { id: 'preprod-cpq', name: 'CPQ-Engine', type: 'APPLICATION' as const, owner: 'CPQ Team', criticality: 'CRITICAL' as const, metadata: { hostname: 'cpq-preprod.telco.internal', port: 8080, version: '5.2.0' } },
    { id: 'preprod-product-catalog', name: 'Product-Catalog-Service', type: 'SERVICE' as const, owner: 'Product Team', criticality: 'HIGH' as const, metadata: { hostname: 'catalog-preprod.telco.internal', port: 8083, version: '4.0.2' } },
    { id: 'preprod-oms', name: 'Order-Management-System', type: 'APPLICATION' as const, owner: 'Order Fulfillment Team', criticality: 'CRITICAL' as const, metadata: { hostname: 'oms-preprod.telco.internal', port: 8080, version: '7.3.1' } },
    { id: 'preprod-orchestrator', name: 'Order-Orchestrator', type: 'SERVICE' as const, owner: 'Order Fulfillment Team', criticality: 'CRITICAL' as const, metadata: { hostname: 'order-orch-preprod.telco.internal', port: 8081, version: '3.2.0' } },
    { id: 'preprod-provisioning', name: 'Provisioning-Engine', type: 'SERVICE' as const, owner: 'Provisioning Team', criticality: 'CRITICAL' as const, metadata: { hostname: 'provision-preprod.telco.internal', port: 8083, version: '4.1.2' } },
    { id: 'preprod-nso', name: 'Cisco-NSO', type: 'APPLICATION' as const, owner: 'Network Automation Team', criticality: 'CRITICAL' as const, metadata: { hostname: 'nso-preprod.telco.internal', port: 8080, version: '6.1' } },
    { id: 'preprod-sa', name: 'Service-Assurance-Platform', type: 'APPLICATION' as const, owner: 'Service Assurance Team', criticality: 'CRITICAL' as const, metadata: { hostname: 'sa-preprod.telco.internal', port: 8080, version: '8.2.0' } },
    { id: 'preprod-alarm-mgr', name: 'Alarm-Manager', type: 'SERVICE' as const, owner: 'Service Assurance Team', criticality: 'HIGH' as const, metadata: { hostname: 'alarm-mgr-preprod.telco.internal', port: 8081, version: '3.5.0' } },
    { id: 'preprod-kafka', name: 'Kafka-Cluster', type: 'MESSAGE_QUEUE' as const, owner: 'Platform Engineering', criticality: 'CRITICAL' as const, metadata: { hostname: 'kafka-preprod.telco.internal', port: 9092, version: '3.6.0', brokers: 3 } },
    { id: 'preprod-oracle-main', name: 'Oracle-RAC-Primary', type: 'DATABASE' as const, owner: 'DBA Team', criticality: 'CRITICAL' as const, metadata: { hostname: 'ora-primary-preprod.telco.internal', port: 1521, sid: 'PREPRODDB', rac: true } },
    { id: 'preprod-postgres', name: 'PostgreSQL-Catalog', type: 'DATABASE' as const, owner: 'DBA Team', criticality: 'HIGH' as const, metadata: { hostname: 'pg-preprod.telco.internal', port: 5432, database: 'product_catalog' } },
    { id: 'preprod-mongodb', name: 'MongoDB-Events', type: 'DATABASE' as const, owner: 'DBA Team', criticality: 'HIGH' as const, metadata: { hostname: 'mongo-preprod.telco.internal', port: 27017, replicaSet: 'rs-events' } },
    { id: 'preprod-redis', name: 'Redis-Cache-Cluster', type: 'DATABASE' as const, owner: 'Platform Engineering', criticality: 'HIGH' as const, metadata: { hostname: 'redis-preprod.telco.internal', port: 6379, mode: 'cluster', nodes: 6 } },
    { id: 'preprod-payment', name: 'Payment-Gateway-API', type: 'EXTERNAL' as const, owner: 'External - Finance', criticality: 'CRITICAL' as const, metadata: { endpoint: 'https://payment-preprod.provider.com/api/v2', vendor: 'Stripe', environment: 'preprod' } },
    { id: 'preprod-sms', name: 'SMS-Gateway-API', type: 'EXTERNAL' as const, owner: 'External - Communications', criticality: 'HIGH' as const, metadata: { endpoint: 'https://sms-preprod.twilio.com/api', vendor: 'Twilio' } },
  ];

  for (const node of preprodNodes) {
    await prisma.node.create({
      data: {
        ...node,
        environmentId: preprodEnv.id,
        lastSeenAt: new Date(),
        metadata: node.metadata,
      },
    });
  }
  console.log(`✓ Created ${preprodNodes.length} nodes for PREPROD`);

  const preprodEdges = [
    // DMZ layer
    { source: 'preprod-f5-lb', target: 'preprod-firewall', protocol: 'REST' as const, port: 443, confidence: 1.0 },
    { source: 'preprod-firewall', target: 'preprod-api-gw', protocol: 'REST' as const, port: 8443, confidence: 1.0 },
    // API Gateway to applications
    { source: 'preprod-api-gw', target: 'preprod-crm', protocol: 'REST' as const, port: 443, confidence: 0.98 },
    { source: 'preprod-api-gw', target: 'preprod-cpq', protocol: 'REST' as const, port: 8080, confidence: 0.97 },
    { source: 'preprod-api-gw', target: 'preprod-oms', protocol: 'REST' as const, port: 8080, confidence: 0.97 },
    { source: 'preprod-api-gw', target: 'preprod-sa', protocol: 'REST' as const, port: 8080, confidence: 0.95 },
    // CRM → CPQ flow
    { source: 'preprod-crm', target: 'preprod-cpq', protocol: 'REST' as const, port: 8080, confidence: 0.92 },
    { source: 'preprod-cpq', target: 'preprod-product-catalog', protocol: 'REST' as const, port: 8083, confidence: 0.96 },
    // CPQ → Order flow
    { source: 'preprod-cpq', target: 'preprod-oms', protocol: 'REST' as const, port: 8080, confidence: 0.94 },
    { source: 'preprod-oms', target: 'preprod-orchestrator', protocol: 'REST' as const, port: 8081, confidence: 0.97 },
    { source: 'preprod-orchestrator', target: 'preprod-provisioning', protocol: 'REST' as const, port: 8083, confidence: 0.96 },
    // Provisioning → NSO
    { source: 'preprod-provisioning', target: 'preprod-nso', protocol: 'REST' as const, port: 8080, confidence: 0.93 },
    // NSO → Service Assurance
    { source: 'preprod-nso', target: 'preprod-sa', protocol: 'REST' as const, port: 8080, confidence: 0.90 },
    { source: 'preprod-sa', target: 'preprod-alarm-mgr', protocol: 'REST' as const, port: 8081, confidence: 0.95 },
    // Event streaming
    { source: 'preprod-oms', target: 'preprod-kafka', protocol: 'EVENT' as const, port: 9092, confidence: 0.96 },
    { source: 'preprod-alarm-mgr', target: 'preprod-kafka', protocol: 'EVENT' as const, port: 9092, confidence: 0.94 },
    // Database connections
    { source: 'preprod-crm', target: 'preprod-oracle-main', protocol: 'JDBC' as const, port: 1521, confidence: 0.99 },
    { source: 'preprod-cpq', target: 'preprod-oracle-main', protocol: 'JDBC' as const, port: 1521, confidence: 0.99 },
    { source: 'preprod-oms', target: 'preprod-oracle-main', protocol: 'JDBC' as const, port: 1521, confidence: 0.99 },
    { source: 'preprod-orchestrator', target: 'preprod-oracle-main', protocol: 'JDBC' as const, port: 1521, confidence: 0.98 },
    { source: 'preprod-product-catalog', target: 'preprod-postgres', protocol: 'JDBC' as const, port: 5432, confidence: 0.99 },
    { source: 'preprod-sa', target: 'preprod-mongodb', protocol: 'JDBC' as const, port: 27017, confidence: 0.97 },
    { source: 'preprod-alarm-mgr', target: 'preprod-mongodb', protocol: 'JDBC' as const, port: 27017, confidence: 0.96 },
    // Cache
    { source: 'preprod-api-gw', target: 'preprod-redis', protocol: 'JDBC' as const, port: 6379, confidence: 0.98 },
    { source: 'preprod-cpq', target: 'preprod-redis', protocol: 'JDBC' as const, port: 6379, confidence: 0.95 },
    { source: 'preprod-product-catalog', target: 'preprod-redis', protocol: 'JDBC' as const, port: 6379, confidence: 0.97 },
    // External integrations
    { source: 'preprod-oms', target: 'preprod-payment', protocol: 'REST' as const, port: 443, confidence: 0.88 },
    { source: 'preprod-orchestrator', target: 'preprod-sms', protocol: 'REST' as const, port: 443, confidence: 0.82 },
  ];

  let preprodEdgeIndex = 0;
  for (const edge of preprodEdges) {
    await prisma.edge.create({
      data: {
        id: `preprod-edge-${preprodEdgeIndex}`,
        environmentId: preprodEnv.id,
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
        protocol: edge.protocol,
        port: edge.port,
        confidenceScore: edge.confidence,
        lastObservedAt: new Date(),
      },
    });
    preprodEdgeIndex++;
  }
  console.log(`✓ Created ${preprodEdges.length} edges for PREPROD`);

  // Add database metadata for PREPROD databases
  await Promise.all([
    prisma.databaseMetadata.create({
      data: {
        nodeId: 'preprod-oracle-main',
        engine: 'Oracle',
        version: '19c',
        host: 'ora-primary-preprod.telco.internal',
        port: 1521,
      },
    }),
    prisma.databaseMetadata.create({
      data: {
        nodeId: 'preprod-postgres',
        engine: 'PostgreSQL',
        version: '15.4',
        host: 'pg-preprod.telco.internal',
        port: 5432,
      },
    }),
    prisma.databaseMetadata.create({
      data: {
        nodeId: 'preprod-mongodb',
        engine: 'MongoDB',
        version: '7.0',
        host: 'mongo-preprod.telco.internal',
        port: 27017,
      },
    }),
    prisma.databaseMetadata.create({
      data: {
        nodeId: 'preprod-redis',
        engine: 'Redis',
        version: '7.2.0',
        host: 'redis-preprod.telco.internal',
        port: 6379,
      },
    }),
  ]);
  console.log(`✓ Created 4 database metadata entries for PREPROD`);

  // ============================================
  // OSS-MOD SIT Environment - Network Orchestration Focus
  // ============================================
  const ossModSitEnv = await prisma.environment.create({
    data: {
      id: 'oss-mod-sit-001',
      name: 'OSS-MOD SIT',
      type: 'SIT',
      description: 'System Integration Test for OSS Modernisation - Network orchestration and service provisioning testing',
      stageId: 'stage-sit',
      projectId: ossModernProject.id,
    },
  });
  console.log(`✓ Created environment: ${ossModSitEnv.name}`);

  // OSS-MOD SIT Nodes - Network and orchestration focused
  const ossModSitNodes = [
    { id: 'oss-sit-nso', name: 'Cisco-NSO-Primary', type: 'APPLICATION' as const, owner: 'Network Automation Team', criticality: 'CRITICAL' as const, metadata: { hostname: 'nso-sit.telco.internal', ip: '10.30.1.10', port: 8080, version: '6.1.2', clustered: true } },
    { id: 'oss-sit-nso-secondary', name: 'Cisco-NSO-Secondary', type: 'APPLICATION' as const, owner: 'Network Automation Team', criticality: 'CRITICAL' as const, metadata: { hostname: 'nso-sit-2.telco.internal', ip: '10.30.1.11', port: 8080, version: '6.1.2', clustered: true } },
    { id: 'oss-sit-netact', name: 'Nokia-NetAct', type: 'APPLICATION' as const, owner: 'Network Operations', criticality: 'HIGH' as const, metadata: { hostname: 'netact-sit.telco.internal', ip: '10.30.2.10', port: 443, version: '22.2', vendor: 'Nokia' } },
    { id: 'oss-sit-inventory', name: 'Resource-Inventory-Service', type: 'SERVICE' as const, owner: 'Inventory Team', criticality: 'HIGH' as const, metadata: { hostname: 'inventory-sit.telco.internal', ip: '10.30.3.10', port: 8081, version: '3.4.0' } },
    { id: 'oss-sit-topology', name: 'Network-Topology-Service', type: 'SERVICE' as const, owner: 'Network Engineering', criticality: 'HIGH' as const, metadata: { hostname: 'topology-sit.telco.internal', ip: '10.30.3.11', port: 8082, version: '2.1.0' } },
    { id: 'oss-sit-provisioning', name: 'Service-Provisioning-Engine', type: 'SERVICE' as const, owner: 'Provisioning Team', criticality: 'CRITICAL' as const, metadata: { hostname: 'provision-sit.telco.internal', ip: '10.30.4.10', port: 8083, version: '4.2.0' } },
    { id: 'oss-sit-ansible', name: 'Ansible-Automation-Platform', type: 'APPLICATION' as const, owner: 'Platform Engineering', criticality: 'MEDIUM' as const, metadata: { hostname: 'ansible-sit.telco.internal', ip: '10.30.5.10', port: 443, version: '2.4', vendor: 'Red Hat' } },
    { id: 'oss-sit-neo4j', name: 'Neo4j-Topology-Graph', type: 'DATABASE' as const, owner: 'DBA Team', criticality: 'HIGH' as const, metadata: { hostname: 'neo4j-sit.telco.internal', ip: '10.30.6.10', port: 7687, version: '5.9.0', mode: 'cluster' } },
    { id: 'oss-sit-postgres', name: 'PostgreSQL-Inventory', type: 'DATABASE' as const, owner: 'DBA Team', criticality: 'HIGH' as const, metadata: { hostname: 'pg-oss-sit.telco.internal', ip: '10.30.6.11', port: 5432, database: 'resource_inventory', version: '15.3' } },
    { id: 'oss-sit-timescale', name: 'TimescaleDB-Metrics', type: 'DATABASE' as const, owner: 'DBA Team', criticality: 'MEDIUM' as const, metadata: { hostname: 'timescale-sit.telco.internal', ip: '10.30.6.12', port: 5432, database: 'network_metrics', version: '2.11.0' } },
    { id: 'oss-sit-kafka', name: 'Kafka-Events', type: 'MESSAGE_QUEUE' as const, owner: 'Platform Engineering', criticality: 'HIGH' as const, metadata: { hostname: 'kafka-oss-sit.telco.internal', ip: '10.30.7.10', port: 9092, version: '3.5.0', brokers: 3 } },
    { id: 'oss-sit-network-sim', name: 'Network-Simulator', type: 'EXTERNAL' as const, owner: 'Network Testing Team', criticality: 'LOW' as const, metadata: { endpoint: 'http://network-sim.telco.internal:8888', vendor: 'EVE-NG' } },
  ];

  for (const node of ossModSitNodes) {
    await prisma.node.create({
      data: {
        ...node,
        environmentId: ossModSitEnv.id,
        lastSeenAt: new Date(),
        metadata: node.metadata,
      },
    });
  }
  console.log(`✓ Created ${ossModSitNodes.length} nodes for OSS-MOD SIT`);

  // Add database metadata for OSS-MOD SIT databases
  await Promise.all([
    prisma.databaseMetadata.create({
      data: {
        nodeId: 'oss-sit-neo4j',
        engine: 'Neo4j',
        version: '5.9.0',
        host: 'neo4j-sit.telco.internal',
        port: 7687,
      },
    }),
    prisma.databaseMetadata.create({
      data: {
        nodeId: 'oss-sit-postgres',
        engine: 'PostgreSQL',
        version: '15.3',
        host: 'pg-oss-sit.telco.internal',
        port: 5432,
      },
    }),
    prisma.databaseMetadata.create({
      data: {
        nodeId: 'oss-sit-timescale',
        engine: 'TimescaleDB',
        version: '2.11.0',
        host: 'timescale-sit.telco.internal',
        port: 5432,
      },
    }),
  ]);
  console.log(`✓ Created 3 database metadata entries for OSS-MOD SIT`);

  const ossModSitEdges = [
    // NSO cluster
    { source: 'oss-sit-nso', target: 'oss-sit-nso-secondary', protocol: 'REST' as const, port: 8080, confidence: 1.0 },
    // NSO to NetAct integration
    { source: 'oss-sit-nso', target: 'oss-sit-netact', protocol: 'REST' as const, port: 443, confidence: 0.94 },
    // NSO to provisioning
    { source: 'oss-sit-nso', target: 'oss-sit-provisioning', protocol: 'REST' as const, port: 8083, confidence: 0.96 },
    // Provisioning to inventory
    { source: 'oss-sit-provisioning', target: 'oss-sit-inventory', protocol: 'REST' as const, port: 8081, confidence: 0.97 },
    // Inventory to topology
    { source: 'oss-sit-inventory', target: 'oss-sit-topology', protocol: 'REST' as const, port: 8082, confidence: 0.95 },
    // Topology to graph DB
    { source: 'oss-sit-topology', target: 'oss-sit-neo4j', protocol: 'JDBC' as const, port: 7687, confidence: 0.99 },
    // Inventory to PostgreSQL
    { source: 'oss-sit-inventory', target: 'oss-sit-postgres', protocol: 'JDBC' as const, port: 5432, confidence: 0.99 },
    // NSO uses Ansible
    { source: 'oss-sit-nso', target: 'oss-sit-ansible', protocol: 'REST' as const, port: 443, confidence: 0.88 },
    // Event streaming
    { source: 'oss-sit-provisioning', target: 'oss-sit-kafka', protocol: 'EVENT' as const, port: 9092, confidence: 0.95 },
    { source: 'oss-sit-inventory', target: 'oss-sit-kafka', protocol: 'EVENT' as const, port: 9092, confidence: 0.94 },
    // Metrics to TimescaleDB
    { source: 'oss-sit-netact', target: 'oss-sit-timescale', protocol: 'JDBC' as const, port: 5432, confidence: 0.96 },
    // Network simulation
    { source: 'oss-sit-nso', target: 'oss-sit-network-sim', protocol: 'REST' as const, port: 8888, confidence: 0.75 },
  ];

  let ossModSitEdgeIndex = 0;
  for (const edge of ossModSitEdges) {
    await prisma.edge.create({
      data: {
        id: `oss-sit-edge-${ossModSitEdgeIndex}`,
        environmentId: ossModSitEnv.id,
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
        protocol: edge.protocol,
        port: edge.port,
        confidenceScore: edge.confidence,
        lastObservedAt: new Date(),
      },
    });
    ossModSitEdgeIndex++;
  }
  console.log(`✓ Created ${ossModSitEdges.length} edges for OSS-MOD SIT`);

  // ============================================
  // Data & Analytics DEV Environment - Data Platform Focus
  // ============================================
  const dapDevEnv = await prisma.environment.create({
    data: {
      id: 'dap-dev-001',
      name: 'DAP DEV',
      type: 'DEV',
      description: 'Development environment for Data & Analytics Platform - Data lake, streaming, and ML experimentation',
      stageId: 'stage-dev',
      projectId: dataAnalyticsProject.id,
    },
  });
  console.log(`✓ Created environment: ${dapDevEnv.name}`);

  // DAP DEV Nodes - Data and analytics focused
  const dapDevNodes = [
    { id: 'dap-dev-airflow', name: 'Apache-Airflow', type: 'APPLICATION' as const, owner: 'Data Engineering', criticality: 'HIGH' as const, metadata: { hostname: 'airflow-dev.telco.internal', ip: '10.50.1.10', port: 8080, version: '2.7.0', executor: 'KubernetesExecutor' } },
    { id: 'dap-dev-spark', name: 'Spark-Cluster', type: 'APPLICATION' as const, owner: 'Data Engineering', criticality: 'HIGH' as const, metadata: { hostname: 'spark-dev.telco.internal', ip: '10.50.1.11', port: 7077, version: '3.5.0', mode: 'kubernetes' } },
    { id: 'dap-dev-kafka', name: 'Kafka-Streaming', type: 'MESSAGE_QUEUE' as const, owner: 'Platform Engineering', criticality: 'HIGH' as const, metadata: { hostname: 'kafka-dap-dev.telco.internal', ip: '10.50.2.10', port: 9092, version: '3.6.0', brokers: 3 } },
    { id: 'dap-dev-flink', name: 'Apache-Flink', type: 'APPLICATION' as const, owner: 'Data Engineering', criticality: 'HIGH' as const, metadata: { hostname: 'flink-dev.telco.internal', ip: '10.50.1.12', port: 8081, version: '1.18.0', jobManagerMode: 'kubernetes' } },
    { id: 'dap-dev-metabase', name: 'Metabase-BI', type: 'APPLICATION' as const, owner: 'BI Team', criticality: 'MEDIUM' as const, metadata: { hostname: 'metabase-dev.telco.internal', ip: '10.50.3.10', port: 3000, version: '0.47.0' } },
    { id: 'dap-dev-mlflow', name: 'MLflow-Server', type: 'APPLICATION' as const, owner: 'ML Team', criticality: 'MEDIUM' as const, metadata: { hostname: 'mlflow-dev.telco.internal', ip: '10.50.3.11', port: 5000, version: '2.8.0' } },
    { id: 'dap-dev-minio', name: 'MinIO-Object-Storage', type: 'DATABASE' as const, owner: 'Platform Engineering', criticality: 'HIGH' as const, metadata: { hostname: 'minio-dev.telco.internal', ip: '10.50.4.10', port: 9000, version: '2024-01', mode: 'distributed', nodes: 4 } },
    { id: 'dap-dev-trino', name: 'Trino-Query-Engine', type: 'APPLICATION' as const, owner: 'Data Engineering', criticality: 'HIGH' as const, metadata: { hostname: 'trino-dev.telco.internal', ip: '10.50.1.13', port: 8080, version: '435', workers: 3 } },
    { id: 'dap-dev-hive', name: 'Hive-Metastore', type: 'SERVICE' as const, owner: 'Data Engineering', criticality: 'HIGH' as const, metadata: { hostname: 'hive-meta-dev.telco.internal', ip: '10.50.5.10', port: 9083, version: '3.1.3' } },
    { id: 'dap-dev-postgres-meta', name: 'PostgreSQL-Metadata', type: 'DATABASE' as const, owner: 'DBA Team', criticality: 'HIGH' as const, metadata: { hostname: 'pg-dap-dev.telco.internal', ip: '10.50.6.10', port: 5432, database: 'dap_metadata', version: '15.4' } },
    { id: 'dap-dev-redis', name: 'Redis-Cache', type: 'DATABASE' as const, owner: 'Platform Engineering', criticality: 'MEDIUM' as const, metadata: { hostname: 'redis-dap-dev.telco.internal', ip: '10.50.6.11', port: 6379, version: '7.2.0' } },
    { id: 'dap-dev-clickhouse', name: 'ClickHouse-OLAP', type: 'DATABASE' as const, owner: 'DBA Team', criticality: 'HIGH' as const, metadata: { hostname: 'clickhouse-dev.telco.internal', ip: '10.50.6.12', port: 8123, version: '24.1', cluster: 'dap_cluster', shards: 2, replicas: 2 } },
  ];

  for (const node of dapDevNodes) {
    await prisma.node.create({
      data: {
        ...node,
        environmentId: dapDevEnv.id,
        lastSeenAt: new Date(),
        metadata: node.metadata,
      },
    });
  }
  console.log(`✓ Created ${dapDevNodes.length} nodes for DAP DEV`);

  // Add database metadata for DAP DEV databases
  await Promise.all([
    prisma.databaseMetadata.create({
      data: {
        nodeId: 'dap-dev-postgres-meta',
        engine: 'PostgreSQL',
        version: '15.4',
        host: 'pg-dap-dev.telco.internal',
        port: 5432,
      },
    }),
    prisma.databaseMetadata.create({
      data: {
        nodeId: 'dap-dev-clickhouse',
        engine: 'ClickHouse',
        version: '24.1',
        host: 'clickhouse-dev.telco.internal',
        port: 8123,
      },
    }),
    prisma.databaseMetadata.create({
      data: {
        nodeId: 'dap-dev-minio',
        engine: 'MinIO',
        version: '2024-01',
        host: 'minio-dev.telco.internal',
        port: 9000,
      },
    }),
    prisma.databaseMetadata.create({
      data: {
        nodeId: 'dap-dev-redis',
        engine: 'Redis',
        version: '7.2.0',
        host: 'redis-dap-dev.telco.internal',
        port: 6379,
      },
    }),
  ]);
  console.log(`✓ Created 4 database metadata entries for DAP DEV`);

  const dapDevEdges = [
    // Airflow orchestration
    { source: 'dap-dev-airflow', target: 'dap-dev-spark', protocol: 'REST' as const, port: 7077, confidence: 0.96 },
    { source: 'dap-dev-airflow', target: 'dap-dev-flink', protocol: 'REST' as const, port: 8081, confidence: 0.94 },
    { source: 'dap-dev-airflow', target: 'dap-dev-trino', protocol: 'REST' as const, port: 8080, confidence: 0.95 },
    // Spark and Flink to storage
    { source: 'dap-dev-spark', target: 'dap-dev-minio', protocol: 'REST' as const, port: 9000, confidence: 0.98 },
    { source: 'dap-dev-flink', target: 'dap-dev-minio', protocol: 'REST' as const, port: 9000, confidence: 0.97 },
    { source: 'dap-dev-spark', target: 'dap-dev-hive', protocol: 'REST' as const, port: 9083, confidence: 0.96 },
    // Streaming
    { source: 'dap-dev-flink', target: 'dap-dev-kafka', protocol: 'EVENT' as const, port: 9092, confidence: 0.98 },
    { source: 'dap-dev-spark', target: 'dap-dev-kafka', protocol: 'EVENT' as const, port: 9092, confidence: 0.95 },
    // Trino to data sources
    { source: 'dap-dev-trino', target: 'dap-dev-hive', protocol: 'REST' as const, port: 9083, confidence: 0.99 },
    { source: 'dap-dev-trino', target: 'dap-dev-clickhouse', protocol: 'JDBC' as const, port: 8123, confidence: 0.97 },
    { source: 'dap-dev-trino', target: 'dap-dev-postgres-meta', protocol: 'JDBC' as const, port: 5432, confidence: 0.98 },
    // Hive metastore to PostgreSQL
    { source: 'dap-dev-hive', target: 'dap-dev-postgres-meta', protocol: 'JDBC' as const, port: 5432, confidence: 0.99 },
    // BI to Trino
    { source: 'dap-dev-metabase', target: 'dap-dev-trino', protocol: 'JDBC' as const, port: 8080, confidence: 0.92 },
    { source: 'dap-dev-metabase', target: 'dap-dev-clickhouse', protocol: 'JDBC' as const, port: 8123, confidence: 0.90 },
    // MLflow to storage
    { source: 'dap-dev-mlflow', target: 'dap-dev-minio', protocol: 'REST' as const, port: 9000, confidence: 0.95 },
    { source: 'dap-dev-mlflow', target: 'dap-dev-postgres-meta', protocol: 'JDBC' as const, port: 5432, confidence: 0.97 },
    // Cache layer
    { source: 'dap-dev-metabase', target: 'dap-dev-redis', protocol: 'JDBC' as const, port: 6379, confidence: 0.93 },
    { source: 'dap-dev-trino', target: 'dap-dev-redis', protocol: 'JDBC' as const, port: 6379, confidence: 0.88 },
  ];

  let dapDevEdgeIndex = 0;
  for (const edge of dapDevEdges) {
    await prisma.edge.create({
      data: {
        id: `dap-dev-edge-${dapDevEdgeIndex}`,
        environmentId: dapDevEnv.id,
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
        protocol: edge.protocol,
        port: edge.port,
        confidenceScore: edge.confidence,
        lastObservedAt: new Date(),
      },
    });
    dapDevEdgeIndex++;
  }
  console.log(`✓ Created ${dapDevEdges.length} edges for DAP DEV`);

  // ============================================
  // ENVIRONMENT LINKS - Promotion paths
  // ============================================
  await Promise.all([
    prisma.environmentLink.create({
      data: {
        upstreamEnvironmentId: devEnv.id,
        downstreamEnvironmentId: sitEnv.id,
        linkType: 'PROMOTION',
        isActive: true,
        notes: 'Standard DEV to SIT promotion',
      },
    }),
    prisma.environmentLink.create({
      data: {
        upstreamEnvironmentId: sitEnv.id,
        downstreamEnvironmentId: uatEnv.id,
        linkType: 'PROMOTION',
        isActive: true,
        notes: 'Standard SIT to UAT promotion',
      },
    }),
    prisma.environmentLink.create({
      data: {
        upstreamEnvironmentId: uatEnv.id,
        downstreamEnvironmentId: nftEnv.id,
        linkType: 'PROMOTION',
        isActive: true,
        notes: 'UAT to NFT for performance testing',
      },
    }),
    prisma.environmentLink.create({
      data: {
        upstreamEnvironmentId: uatEnv.id,
        downstreamEnvironmentId: preprodEnv.id,
        linkType: 'PROMOTION',
        isActive: true,
        notes: 'Standard UAT to PREPROD promotion',
      },
    }),
    prisma.environmentLink.create({
      data: {
        upstreamEnvironmentId: nftEnv.id,
        downstreamEnvironmentId: preprodEnv.id,
        linkType: 'PROMOTION',
        isActive: true,
        notes: 'NFT to PREPROD after performance validation',
      },
    }),
  ]);
  console.log(`✓ Created 5 environment links`);

  // ============================================
  // RACI MAPPINGS
  // ============================================
  await Promise.all([
    prisma.rACIMapping.create({
      data: {
        personId: 'person-john-smith',
        entityType: 'ENVIRONMENT',
        entityId: sitEnv.id,
        raciRole: 'ACCOUNTABLE',
        assignedBy: 'system',
        assignedAt: new Date(),
      },
    }),
    prisma.rACIMapping.create({
      data: {
        personId: 'person-jane-doe',
        entityType: 'ENVIRONMENT',
        entityId: sitEnv.id,
        raciRole: 'RESPONSIBLE',
        assignedBy: 'system',
        assignedAt: new Date(),
      },
    }),
    prisma.rACIMapping.create({
      data: {
        personId: 'person-mike-wilson',
        entityType: 'ENVIRONMENT',
        entityId: sitEnv.id,
        raciRole: 'CONSULTED',
        assignedBy: 'system',
        assignedAt: new Date(),
      },
    }),
    prisma.rACIMapping.create({
      data: {
        personId: 'person-tom-brown',
        entityType: 'ENVIRONMENT',
        entityId: uatEnv.id,
        raciRole: 'ACCOUNTABLE',
        assignedBy: 'system',
        assignedAt: new Date(),
      },
    }),
    prisma.rACIMapping.create({
      data: {
        personId: 'person-sarah-chen',
        entityType: 'ENVIRONMENT',
        entityId: nftEnv.id,
        raciRole: 'ACCOUNTABLE',
        assignedBy: 'system',
        assignedAt: new Date(),
      },
    }),
  ]);
  console.log(`✓ Created 5 RACI mappings`);

  // ============================================
  // SIT NODES - Realistic Telco Topology
  // ============================================
  const sitNodes = [
    // === DMZ Layer - Load Balancers & Firewalls ===
    {
      id: 'sit-f5-external',
      name: 'F5-LTM-External',
      type: 'LOAD_BALANCER' as const,
      owner: 'Network Operations',
      criticality: 'CRITICAL' as const,
      metadata: {
        hostname: 'f5-ext-sit.telco.internal',
        ip: '10.10.1.10',
        segment: 'DMZ',
        vendor: 'F5 Networks',
        model: 'BIG-IP LTM',
        vips: ['10.10.1.100', '10.10.1.101', '10.10.1.102'],
      },
    },
    {
      id: 'sit-firewall-dmz',
      name: 'Palo-Alto-DMZ',
      type: 'GATEWAY' as const,
      owner: 'Security Operations',
      criticality: 'CRITICAL' as const,
      metadata: {
        hostname: 'pa-fw-dmz-sit.telco.internal',
        ip: '10.10.1.1',
        segment: 'DMZ',
        vendor: 'Palo Alto',
        model: 'PA-5220',
        zones: ['untrust', 'dmz', 'trust'],
      },
    },

    // === API Gateway Layer ===
    {
      id: 'sit-api-gateway',
      name: 'Kong-API-Gateway',
      type: 'GATEWAY' as const,
      owner: 'Platform Engineering',
      criticality: 'CRITICAL' as const,
      metadata: {
        hostname: 'kong-gw-sit.telco.internal',
        ip: '10.20.1.10',
        port: 8443,
        segment: 'Application',
        version: '3.4.2',
        plugins: ['rate-limiting', 'jwt', 'oauth2', 'cors'],
      },
    },

    // === CRM Layer ===
    {
      id: 'sit-crm-app',
      name: 'Salesforce-CRM',
      type: 'APPLICATION' as const,
      owner: 'CRM Team',
      criticality: 'CRITICAL' as const,
      metadata: {
        hostname: 'crm-sit.telco.internal',
        ip: '10.20.2.10',
        port: 8080,
        segment: 'Application',
        version: 'Spring 2024',
        instance: 'telco-sit.my.salesforce.com',
      },
    },
    {
      id: 'sit-crm-adapter',
      name: 'CRM-Integration-Adapter',
      type: 'SERVICE' as const,
      owner: 'Integration Team',
      criticality: 'HIGH' as const,
      metadata: {
        hostname: 'crm-adapter-sit.telco.internal',
        ip: '10.20.2.11',
        port: 8081,
        segment: 'Application',
        version: '2.3.1',
      },
    },

    // === CPQ Layer (Configure-Price-Quote) ===
    {
      id: 'sit-cpq-engine',
      name: 'CPQ-Engine',
      type: 'APPLICATION' as const,
      owner: 'CPQ Team',
      criticality: 'CRITICAL' as const,
      metadata: {
        hostname: 'cpq-engine-sit.telco.internal',
        ip: '10.20.3.10',
        port: 8080,
        segment: 'Application',
        version: '5.2.0',
        vendor: 'Oracle CPQ Cloud',
      },
    },
    {
      id: 'sit-cpq-rules',
      name: 'CPQ-Rules-Service',
      type: 'SERVICE' as const,
      owner: 'CPQ Team',
      criticality: 'HIGH' as const,
      metadata: {
        hostname: 'cpq-rules-sit.telco.internal',
        ip: '10.20.3.11',
        port: 8082,
        segment: 'Application',
        version: '3.1.0',
      },
    },
    {
      id: 'sit-product-catalog',
      name: 'Product-Catalog-Service',
      type: 'SERVICE' as const,
      owner: 'Product Team',
      criticality: 'HIGH' as const,
      metadata: {
        hostname: 'catalog-sit.telco.internal',
        ip: '10.20.3.12',
        port: 8083,
        segment: 'Application',
        version: '4.0.2',
      },
    },

    // === Order Fulfillment Layer ===
    {
      id: 'sit-order-mgmt',
      name: 'Order-Management-System',
      type: 'APPLICATION' as const,
      owner: 'Order Fulfillment Team',
      criticality: 'CRITICAL' as const,
      metadata: {
        hostname: 'oms-sit.telco.internal',
        ip: '10.20.4.10',
        port: 8080,
        segment: 'Application',
        version: '7.3.1',
        vendor: 'Oracle Communications',
      },
    },
    {
      id: 'sit-order-orchestrator',
      name: 'Order-Orchestrator',
      type: 'SERVICE' as const,
      owner: 'Order Fulfillment Team',
      criticality: 'CRITICAL' as const,
      metadata: {
        hostname: 'order-orch-sit.telco.internal',
        ip: '10.20.4.11',
        port: 8081,
        segment: 'Application',
        version: '3.2.0',
      },
    },
    {
      id: 'sit-inventory-service',
      name: 'Inventory-Service',
      type: 'SERVICE' as const,
      owner: 'Order Fulfillment Team',
      criticality: 'HIGH' as const,
      metadata: {
        hostname: 'inventory-sit.telco.internal',
        ip: '10.20.4.12',
        port: 8082,
        segment: 'Application',
        version: '2.8.0',
      },
    },
    {
      id: 'sit-provisioning-engine',
      name: 'Provisioning-Engine',
      type: 'SERVICE' as const,
      owner: 'Provisioning Team',
      criticality: 'CRITICAL' as const,
      metadata: {
        hostname: 'provision-sit.telco.internal',
        ip: '10.20.4.13',
        port: 8083,
        segment: 'Application',
        version: '4.1.2',
      },
    },

    // === CISCO NSO (Network Service Orchestrator) ===
    {
      id: 'sit-cisco-nso',
      name: 'Cisco-NSO',
      type: 'APPLICATION' as const,
      owner: 'Network Automation Team',
      criticality: 'CRITICAL' as const,
      metadata: {
        hostname: 'nso-sit.telco.internal',
        ip: '10.20.5.10',
        port: 8080,
        ncsPort: 2022,
        segment: 'Network Management',
        version: '6.1',
        vendor: 'Cisco',
        nedPackages: ['cisco-ios-cli', 'cisco-iosxr', 'juniper-junos'],
      },
    },
    {
      id: 'sit-nso-adapter',
      name: 'NSO-Southbound-Adapter',
      type: 'SERVICE' as const,
      owner: 'Network Automation Team',
      criticality: 'HIGH' as const,
      metadata: {
        hostname: 'nso-adapter-sit.telco.internal',
        ip: '10.20.5.11',
        port: 8084,
        segment: 'Network Management',
        version: '2.0.1',
      },
    },

    // === Service Assurance Layer ===
    {
      id: 'sit-service-assurance',
      name: 'Service-Assurance-Platform',
      type: 'APPLICATION' as const,
      owner: 'Service Assurance Team',
      criticality: 'CRITICAL' as const,
      metadata: {
        hostname: 'sa-platform-sit.telco.internal',
        ip: '10.20.6.10',
        port: 8080,
        segment: 'Operations',
        version: '8.2.0',
        vendor: 'Nokia NetAct',
      },
    },
    {
      id: 'sit-alarm-manager',
      name: 'Alarm-Manager',
      type: 'SERVICE' as const,
      owner: 'Service Assurance Team',
      criticality: 'HIGH' as const,
      metadata: {
        hostname: 'alarm-mgr-sit.telco.internal',
        ip: '10.20.6.11',
        port: 8081,
        segment: 'Operations',
        version: '3.5.0',
      },
    },
    {
      id: 'sit-performance-monitor',
      name: 'Performance-Monitor',
      type: 'SERVICE' as const,
      owner: 'Service Assurance Team',
      criticality: 'HIGH' as const,
      metadata: {
        hostname: 'perf-mon-sit.telco.internal',
        ip: '10.20.6.12',
        port: 8082,
        segment: 'Operations',
        version: '4.1.0',
      },
    },
    {
      id: 'sit-sla-engine',
      name: 'SLA-Engine',
      type: 'SERVICE' as const,
      owner: 'Service Assurance Team',
      criticality: 'HIGH' as const,
      metadata: {
        hostname: 'sla-engine-sit.telco.internal',
        ip: '10.20.6.13',
        port: 8083,
        segment: 'Operations',
        version: '2.2.0',
      },
    },

    // === Messaging Layer ===
    {
      id: 'sit-kafka-cluster',
      name: 'Kafka-Event-Bus',
      type: 'MESSAGE_QUEUE' as const,
      owner: 'Platform Engineering',
      criticality: 'CRITICAL' as const,
      metadata: {
        hostname: 'kafka-sit.telco.internal',
        ip: '10.30.1.10',
        port: 9092,
        segment: 'Messaging',
        version: '3.6.0',
        brokers: 3,
        topics: ['orders', 'provisioning', 'alarms', 'events', 'metrics'],
      },
    },
    {
      id: 'sit-rabbitmq',
      name: 'RabbitMQ-Broker',
      type: 'MESSAGE_QUEUE' as const,
      owner: 'Platform Engineering',
      criticality: 'HIGH' as const,
      metadata: {
        hostname: 'rabbitmq-sit.telco.internal',
        ip: '10.30.1.11',
        port: 5672,
        mgmtPort: 15672,
        segment: 'Messaging',
        version: '3.12.0',
      },
    },

    // === Database Layer ===
    {
      id: 'sit-oracle-crm',
      name: 'Oracle-CRM-DB',
      type: 'DATABASE' as const,
      owner: 'DBA Team',
      criticality: 'CRITICAL' as const,
      metadata: {
        hostname: 'ora-crm-sit.telco.internal',
        ip: '10.30.2.10',
        port: 1521,
        segment: 'Database',
        sid: 'CRMDB',
        rac: true,
      },
    },
    {
      id: 'sit-oracle-oms',
      name: 'Oracle-OMS-DB',
      type: 'DATABASE' as const,
      owner: 'DBA Team',
      criticality: 'CRITICAL' as const,
      metadata: {
        hostname: 'ora-oms-sit.telco.internal',
        ip: '10.30.2.11',
        port: 1521,
        segment: 'Database',
        sid: 'OMSDB',
        rac: true,
      },
    },
    {
      id: 'sit-postgres-catalog',
      name: 'PostgreSQL-Catalog-DB',
      type: 'DATABASE' as const,
      owner: 'DBA Team',
      criticality: 'HIGH' as const,
      metadata: {
        hostname: 'pg-catalog-sit.telco.internal',
        ip: '10.30.2.12',
        port: 5432,
        segment: 'Database',
        database: 'product_catalog',
      },
    },
    {
      id: 'sit-mongodb-events',
      name: 'MongoDB-Events-DB',
      type: 'DATABASE' as const,
      owner: 'DBA Team',
      criticality: 'HIGH' as const,
      metadata: {
        hostname: 'mongo-events-sit.telco.internal',
        ip: '10.30.2.13',
        port: 27017,
        segment: 'Database',
        replicaSet: 'rs-events',
      },
    },
    {
      id: 'sit-redis-cache',
      name: 'Redis-Cache-Cluster',
      type: 'DATABASE' as const,
      owner: 'Platform Engineering',
      criticality: 'HIGH' as const,
      metadata: {
        hostname: 'redis-sit.telco.internal',
        ip: '10.30.2.14',
        port: 6379,
        segment: 'Database',
        mode: 'cluster',
        nodes: 6,
      },
    },

    // === External Integrations ===
    {
      id: 'sit-payment-gateway',
      name: 'Payment-Gateway-API',
      type: 'EXTERNAL' as const,
      owner: 'External - Finance',
      criticality: 'CRITICAL' as const,
      metadata: {
        endpoint: 'https://payment-sandbox.provider.com/api/v2',
        segment: 'External',
        vendor: 'Stripe',
        environment: 'sandbox',
      },
    },
    {
      id: 'sit-sms-gateway',
      name: 'SMS-Gateway-API',
      type: 'EXTERNAL' as const,
      owner: 'External - Communications',
      criticality: 'HIGH' as const,
      metadata: {
        endpoint: 'https://sms-test.twilio.com/api',
        segment: 'External',
        vendor: 'Twilio',
        environment: 'test',
      },
    },
    {
      id: 'sit-address-validation',
      name: 'Address-Validation-API',
      type: 'EXTERNAL' as const,
      owner: 'External - Data',
      criticality: 'MEDIUM' as const,
      metadata: {
        endpoint: 'https://api-test.loqate.com/validate',
        segment: 'External',
        vendor: 'Loqate',
        environment: 'test',
      },
    },
    {
      id: 'sit-credit-check',
      name: 'Credit-Check-API',
      type: 'EXTERNAL' as const,
      owner: 'External - Risk',
      criticality: 'HIGH' as const,
      metadata: {
        endpoint: 'https://sandbox.experian.com/credit/v2',
        segment: 'External',
        vendor: 'Experian',
        environment: 'sandbox',
      },
    },

    // === Network Elements (Simulated) ===
    {
      id: 'sit-network-sim',
      name: 'Network-Element-Simulator',
      type: 'RUNTIME' as const,
      owner: 'Network Lab Team',
      criticality: 'MEDIUM' as const,
      metadata: {
        hostname: 'ne-sim-sit.telco.internal',
        ip: '10.40.1.10',
        port: 830,
        segment: 'Lab',
        simulatedDevices: 50,
        protocols: ['NETCONF', 'SNMP', 'CLI'],
      },
    },
  ];

  for (const node of sitNodes) {
    await prisma.node.create({
      data: {
        ...node,
        environmentId: sitEnv.id,
        lastSeenAt: new Date(),
        metadata: node.metadata,
      },
    });
  }
  console.log(`✓ Created ${sitNodes.length} nodes for SIT`);

  // ============================================
  // SIT EDGES - Integration Flows
  // ============================================
  const sitEdges = [
    // === External to DMZ ===
    { source: 'sit-f5-external', target: 'sit-firewall-dmz', protocol: 'REST' as const, port: 443, path: '/*', confidence: 1.0 },
    { source: 'sit-firewall-dmz', target: 'sit-api-gateway', protocol: 'REST' as const, port: 8443, path: '/api/*', confidence: 1.0 },

    // === API Gateway to Applications ===
    { source: 'sit-api-gateway', target: 'sit-crm-adapter', protocol: 'REST' as const, port: 8081, path: '/api/crm/*', confidence: 0.95 },
    { source: 'sit-api-gateway', target: 'sit-cpq-engine', protocol: 'REST' as const, port: 8080, path: '/api/cpq/*', confidence: 0.95 },
    { source: 'sit-api-gateway', target: 'sit-order-mgmt', protocol: 'REST' as const, port: 8080, path: '/api/orders/*', confidence: 0.95 },
    { source: 'sit-api-gateway', target: 'sit-service-assurance', protocol: 'REST' as const, port: 8080, path: '/api/assurance/*', confidence: 0.92 },

    // === CRM Flow: CRM -> CPQ ===
    { source: 'sit-crm-adapter', target: 'sit-crm-app', protocol: 'REST' as const, port: 443, path: '/services/data/v58.0/*', confidence: 0.98 },
    { source: 'sit-crm-app', target: 'sit-cpq-engine', protocol: 'REST' as const, port: 8080, path: '/api/quotes', confidence: 0.88 },
    { source: 'sit-crm-adapter', target: 'sit-kafka-cluster', protocol: 'EVENT' as const, port: 9092, path: 'crm.events', confidence: 0.92 },

    // === CPQ Flow: CPQ -> Order Fulfillment ===
    { source: 'sit-cpq-engine', target: 'sit-cpq-rules', protocol: 'GRPC' as const, port: 8082, path: '/rules.RulesService/*', confidence: 0.95 },
    { source: 'sit-cpq-engine', target: 'sit-product-catalog', protocol: 'REST' as const, port: 8083, path: '/api/products/*', confidence: 0.97 },
    { source: 'sit-cpq-engine', target: 'sit-order-mgmt', protocol: 'REST' as const, port: 8080, path: '/api/orders', confidence: 0.93 },
    { source: 'sit-cpq-engine', target: 'sit-kafka-cluster', protocol: 'EVENT' as const, port: 9092, path: 'quotes.created', confidence: 0.90 },

    // === Order Fulfillment Flow: Order -> NSO ===
    { source: 'sit-order-mgmt', target: 'sit-order-orchestrator', protocol: 'REST' as const, port: 8081, path: '/api/orchestrate', confidence: 0.96 },
    { source: 'sit-order-orchestrator', target: 'sit-inventory-service', protocol: 'REST' as const, port: 8082, path: '/api/inventory/*', confidence: 0.94 },
    { source: 'sit-order-orchestrator', target: 'sit-provisioning-engine', protocol: 'REST' as const, port: 8083, path: '/api/provision', confidence: 0.95 },
    { source: 'sit-provisioning-engine', target: 'sit-cisco-nso', protocol: 'REST' as const, port: 8080, path: '/restconf/data/*', confidence: 0.91 },
    { source: 'sit-order-mgmt', target: 'sit-kafka-cluster', protocol: 'EVENT' as const, port: 9092, path: 'orders.lifecycle', confidence: 0.93 },

    // === NSO Flow: NSO -> Service Assurance ===
    { source: 'sit-cisco-nso', target: 'sit-nso-adapter', protocol: 'REST' as const, port: 8084, path: '/api/devices/*', confidence: 0.89 },
    { source: 'sit-cisco-nso', target: 'sit-network-sim', protocol: 'REST' as const, port: 830, path: '/netconf', confidence: 0.85 },
    { source: 'sit-cisco-nso', target: 'sit-service-assurance', protocol: 'REST' as const, port: 8080, path: '/api/services/status', confidence: 0.87 },
    { source: 'sit-cisco-nso', target: 'sit-kafka-cluster', protocol: 'EVENT' as const, port: 9092, path: 'network.changes', confidence: 0.88 },

    // === Service Assurance Internal ===
    { source: 'sit-service-assurance', target: 'sit-alarm-manager', protocol: 'REST' as const, port: 8081, path: '/api/alarms/*', confidence: 0.94 },
    { source: 'sit-service-assurance', target: 'sit-performance-monitor', protocol: 'REST' as const, port: 8082, path: '/api/metrics/*', confidence: 0.93 },
    { source: 'sit-service-assurance', target: 'sit-sla-engine', protocol: 'REST' as const, port: 8083, path: '/api/sla/*', confidence: 0.91 },
    { source: 'sit-alarm-manager', target: 'sit-kafka-cluster', protocol: 'EVENT' as const, port: 9092, path: 'alarms.events', confidence: 0.95 },
    { source: 'sit-performance-monitor', target: 'sit-kafka-cluster', protocol: 'EVENT' as const, port: 9092, path: 'metrics.stream', confidence: 0.94 },

    // === Database Connections ===
    { source: 'sit-crm-adapter', target: 'sit-oracle-crm', protocol: 'JDBC' as const, port: 1521, confidence: 0.99 },
    { source: 'sit-cpq-engine', target: 'sit-oracle-crm', protocol: 'JDBC' as const, port: 1521, confidence: 0.97 },
    { source: 'sit-order-mgmt', target: 'sit-oracle-oms', protocol: 'JDBC' as const, port: 1521, confidence: 0.99 },
    { source: 'sit-order-orchestrator', target: 'sit-oracle-oms', protocol: 'JDBC' as const, port: 1521, confidence: 0.98 },
    { source: 'sit-inventory-service', target: 'sit-oracle-oms', protocol: 'JDBC' as const, port: 1521, confidence: 0.97 },
    { source: 'sit-product-catalog', target: 'sit-postgres-catalog', protocol: 'JDBC' as const, port: 5432, confidence: 0.99 },
    { source: 'sit-service-assurance', target: 'sit-mongodb-events', protocol: 'JDBC' as const, port: 27017, confidence: 0.96 },
    { source: 'sit-alarm-manager', target: 'sit-mongodb-events', protocol: 'JDBC' as const, port: 27017, confidence: 0.95 },

    // === Cache Connections ===
    { source: 'sit-api-gateway', target: 'sit-redis-cache', protocol: 'JDBC' as const, port: 6379, confidence: 0.98 },
    { source: 'sit-cpq-engine', target: 'sit-redis-cache', protocol: 'JDBC' as const, port: 6379, confidence: 0.94 },
    { source: 'sit-product-catalog', target: 'sit-redis-cache', protocol: 'JDBC' as const, port: 6379, confidence: 0.96 },

    // === External API Integrations ===
    { source: 'sit-order-mgmt', target: 'sit-payment-gateway', protocol: 'REST' as const, port: 443, path: '/v2/charges', confidence: 0.82 },
    { source: 'sit-order-orchestrator', target: 'sit-sms-gateway', protocol: 'REST' as const, port: 443, path: '/Messages.json', confidence: 0.78 },
    { source: 'sit-crm-adapter', target: 'sit-address-validation', protocol: 'REST' as const, port: 443, path: '/validate', confidence: 0.75 },
    { source: 'sit-order-mgmt', target: 'sit-credit-check', protocol: 'REST' as const, port: 443, path: '/credit/check', confidence: 0.80 },

    // === Message Queue Internal ===
    { source: 'sit-kafka-cluster', target: 'sit-rabbitmq', protocol: 'MQ' as const, port: 5672, path: 'bridge.queue', confidence: 0.85 },
  ];

  let edgeIndex = 0;
  for (const edge of sitEdges) {
    await prisma.edge.create({
      data: {
        id: `sit-edge-${edgeIndex}`,
        environmentId: sitEnv.id,
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
        protocol: edge.protocol,
        port: edge.port,
        pathOrTopic: edge.path,
        confidenceScore: edge.confidence,
        lastObservedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random within last 7 days
      },
    });
    edgeIndex++;
  }
  console.log(`✓ Created ${sitEdges.length} edges for SIT`);

  // ============================================
  // DATABASE METADATA & TEST DATA
  // ============================================
  const databases = [
    {
      nodeId: 'sit-oracle-crm',
      engine: 'Oracle',
      version: '19c',
      sizeGB: 245.8,
      host: 'ora-crm-sit.telco.internal',
      port: 1521,
      testData: {
        sourceType: 'MASKED' as const,
        refreshDaysAgo: 12,
        refreshMethod: 'PIPELINE' as const,
        maskingVersion: 'v3.2.1',
        owner: 'Data Engineering',
        consumers: ['crm-adapter', 'cpq-engine', 'reporting'],
      },
    },
    {
      nodeId: 'sit-oracle-oms',
      engine: 'Oracle',
      version: '19c',
      sizeGB: 512.3,
      host: 'ora-oms-sit.telco.internal',
      port: 1521,
      testData: {
        sourceType: 'PROD_CLONE' as const,
        refreshDaysAgo: 35, // Stale!
        refreshMethod: 'MANUAL' as const,
        maskingVersion: 'v3.1.0',
        owner: 'DBA Team',
        consumers: ['order-mgmt', 'order-orchestrator', 'inventory-service'],
      },
    },
    {
      nodeId: 'sit-postgres-catalog',
      engine: 'PostgreSQL',
      version: '15.4',
      sizeGB: 28.5,
      host: 'pg-catalog-sit.telco.internal',
      port: 5432,
      testData: {
        sourceType: 'SYNTHETIC' as const,
        refreshDaysAgo: 5,
        refreshMethod: 'AUTOMATED' as const,
        maskingVersion: null,
        owner: 'Product Team',
        consumers: ['product-catalog', 'cpq-engine'],
      },
    },
    {
      nodeId: 'sit-mongodb-events',
      engine: 'MongoDB',
      version: '7.0',
      sizeGB: 156.2,
      host: 'mongo-events-sit.telco.internal',
      port: 27017,
      testData: {
        sourceType: 'SYNTHETIC' as const,
        refreshDaysAgo: 2,
        refreshMethod: 'AUTOMATED' as const,
        maskingVersion: null,
        owner: 'Platform Engineering',
        consumers: ['service-assurance', 'alarm-manager', 'analytics'],
      },
    },
    {
      nodeId: 'sit-redis-cache',
      engine: 'Redis',
      version: '7.2',
      sizeGB: 16.0,
      host: 'redis-sit.telco.internal',
      port: 6379,
      testData: {
        sourceType: 'STATIC' as const,
        refreshDaysAgo: 0,
        refreshMethod: 'AUTOMATED' as const,
        maskingVersion: null,
        owner: 'Platform Engineering',
        consumers: ['api-gateway', 'cpq-engine', 'product-catalog'],
      },
    },
  ];

  for (const db of databases) {
    const dbMeta = await prisma.databaseMetadata.create({
      data: {
        nodeId: db.nodeId,
        engine: db.engine,
        version: db.version,
        sizeGB: db.sizeGB,
        host: db.host,
        port: db.port,
      },
    });

    const refreshDate = new Date();
    refreshDate.setDate(refreshDate.getDate() - db.testData.refreshDaysAgo);

    await prisma.testDataSet.create({
      data: {
        databaseId: dbMeta.id,
        sourceType: db.testData.sourceType,
        lastRefreshDate: refreshDate,
        refreshMethod: db.testData.refreshMethod,
        maskingPolicyVersion: db.testData.maskingVersion,
        owner: db.testData.owner,
        downstreamConsumers: db.testData.consumers,
      },
    });
  }
  console.log(`✓ Created ${databases.length} database metadata records with test data sets`);

  // ============================================
  // UAT Environment - Simplified Production-like
  // ============================================
  const uatNodes = [
    { id: 'uat-f5-lb', name: 'F5-LTM-UAT', type: 'LOAD_BALANCER' as const, owner: 'Network Operations', criticality: 'CRITICAL' as const, metadata: { hostname: 'f5-uat.telco.internal', ip: '10.50.1.10', segment: 'DMZ' } },
    { id: 'uat-api-gw', name: 'Kong-API-Gateway', type: 'GATEWAY' as const, owner: 'Platform Engineering', criticality: 'CRITICAL' as const, metadata: { hostname: 'kong-uat.telco.internal', ip: '10.50.2.10', port: 8443 } },
    { id: 'uat-crm', name: 'Salesforce-CRM', type: 'APPLICATION' as const, owner: 'CRM Team', criticality: 'CRITICAL' as const, metadata: { hostname: 'crm-uat.telco.internal', instance: 'telco-uat.my.salesforce.com' } },
    { id: 'uat-cpq', name: 'CPQ-Engine', type: 'APPLICATION' as const, owner: 'CPQ Team', criticality: 'CRITICAL' as const, metadata: { hostname: 'cpq-uat.telco.internal', port: 8080 } },
    { id: 'uat-oms', name: 'Order-Management-System', type: 'APPLICATION' as const, owner: 'Order Fulfillment Team', criticality: 'CRITICAL' as const, metadata: { hostname: 'oms-uat.telco.internal', port: 8080 } },
    { id: 'uat-nso', name: 'Cisco-NSO', type: 'APPLICATION' as const, owner: 'Network Automation Team', criticality: 'CRITICAL' as const, metadata: { hostname: 'nso-uat.telco.internal', port: 8080 } },
    { id: 'uat-sa', name: 'Service-Assurance-Platform', type: 'APPLICATION' as const, owner: 'Service Assurance Team', criticality: 'CRITICAL' as const, metadata: { hostname: 'sa-uat.telco.internal', port: 8080 } },
    { id: 'uat-kafka', name: 'Kafka-Cluster', type: 'MESSAGE_QUEUE' as const, owner: 'Platform Engineering', criticality: 'CRITICAL' as const, metadata: { hostname: 'kafka-uat.telco.internal', port: 9092 } },
    { id: 'uat-oracle-db', name: 'Oracle-RAC-Cluster', type: 'DATABASE' as const, owner: 'DBA Team', criticality: 'CRITICAL' as const, metadata: { hostname: 'ora-uat.telco.internal', port: 1521 } },
    { id: 'uat-payment', name: 'Payment-Gateway', type: 'EXTERNAL' as const, owner: 'External', criticality: 'CRITICAL' as const, metadata: { endpoint: 'https://payment-uat.provider.com' } },
  ];

  for (const node of uatNodes) {
    await prisma.node.create({
      data: {
        ...node,
        environmentId: uatEnv.id,
        lastSeenAt: new Date(),
        metadata: node.metadata,
      },
    });
  }
  console.log(`✓ Created ${uatNodes.length} nodes for UAT`);

  const uatEdges = [
    { source: 'uat-f5-lb', target: 'uat-api-gw', protocol: 'REST' as const, port: 8443, confidence: 1.0 },
    { source: 'uat-api-gw', target: 'uat-crm', protocol: 'REST' as const, port: 443, confidence: 0.98 },
    { source: 'uat-api-gw', target: 'uat-cpq', protocol: 'REST' as const, port: 8080, confidence: 0.97 },
    { source: 'uat-api-gw', target: 'uat-oms', protocol: 'REST' as const, port: 8080, confidence: 0.97 },
    { source: 'uat-crm', target: 'uat-cpq', protocol: 'REST' as const, port: 8080, confidence: 0.92 },
    { source: 'uat-cpq', target: 'uat-oms', protocol: 'REST' as const, port: 8080, confidence: 0.94 },
    { source: 'uat-oms', target: 'uat-nso', protocol: 'REST' as const, port: 8080, confidence: 0.91 },
    { source: 'uat-nso', target: 'uat-sa', protocol: 'REST' as const, port: 8080, confidence: 0.89 },
    { source: 'uat-oms', target: 'uat-kafka', protocol: 'EVENT' as const, port: 9092, confidence: 0.95 },
    { source: 'uat-crm', target: 'uat-oracle-db', protocol: 'JDBC' as const, port: 1521, confidence: 0.99 },
    { source: 'uat-cpq', target: 'uat-oracle-db', protocol: 'JDBC' as const, port: 1521, confidence: 0.99 },
    { source: 'uat-oms', target: 'uat-oracle-db', protocol: 'JDBC' as const, port: 1521, confidence: 0.99 },
    { source: 'uat-oms', target: 'uat-payment', protocol: 'REST' as const, port: 443, confidence: 0.85 },
  ];

  let uatEdgeIndex = 0;
  for (const edge of uatEdges) {
    await prisma.edge.create({
      data: {
        id: `uat-edge-${uatEdgeIndex}`,
        environmentId: uatEnv.id,
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
        protocol: edge.protocol,
        port: edge.port,
        confidenceScore: edge.confidence,
        lastObservedAt: new Date(),
      },
    });
    uatEdgeIndex++;
  }
  console.log(`✓ Created ${uatEdges.length} edges for UAT`);

  // ============================================
  // NFT Environment - Minimal for Load Testing
  // ============================================
  const nftNodes = [
    { id: 'nft-lb', name: 'Load-Balancer', type: 'LOAD_BALANCER' as const, owner: 'Performance Team', criticality: 'HIGH' as const, metadata: { hostname: 'lb-nft.telco.internal' } },
    { id: 'nft-app-pool', name: 'App-Server-Pool', type: 'APPLICATION' as const, owner: 'Performance Team', criticality: 'HIGH' as const, metadata: { instances: 10, hostname: 'app-nft.telco.internal' } },
    { id: 'nft-db-cluster', name: 'Oracle-RAC', type: 'DATABASE' as const, owner: 'DBA Team', criticality: 'HIGH' as const, metadata: { hostname: 'ora-nft.telco.internal', nodes: 4 } },
    { id: 'nft-kafka', name: 'Kafka-Cluster', type: 'MESSAGE_QUEUE' as const, owner: 'Performance Team', criticality: 'HIGH' as const, metadata: { hostname: 'kafka-nft.telco.internal', brokers: 5 } },
  ];

  for (const node of nftNodes) {
    await prisma.node.create({
      data: {
        ...node,
        environmentId: nftEnv.id,
        lastSeenAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago - stale
        metadata: node.metadata,
      },
    });
  }
  console.log(`✓ Created ${nftNodes.length} nodes for NFT`);

  const nftEdges = [
    { source: 'nft-lb', target: 'nft-app-pool', protocol: 'REST' as const, port: 8080, confidence: 0.95 },
    { source: 'nft-app-pool', target: 'nft-db-cluster', protocol: 'JDBC' as const, port: 1521, confidence: 0.98 },
    { source: 'nft-app-pool', target: 'nft-kafka', protocol: 'EVENT' as const, port: 9092, confidence: 0.92 },
  ];

  let nftEdgeIndex = 0;
  for (const edge of nftEdges) {
    await prisma.edge.create({
      data: {
        id: `nft-edge-${nftEdgeIndex}`,
        environmentId: nftEnv.id,
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
        protocol: edge.protocol,
        port: edge.port,
        confidenceScore: edge.confidence,
        lastObservedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      },
    });
    nftEdgeIndex++;
  }
  console.log(`✓ Created ${nftEdges.length} edges for NFT`);

  console.log('\n✅ Environment seed completed!');
  console.log('\n📊 Summary:');
  console.log(`   Projects: 4`);
  console.log(`   Stages: 6`);
  console.log(`   Flow Templates: 2`);
  console.log(`   People: 5`);
  console.log(`   Governance Rules: 3`);
  console.log(`   Connectors: 3`);
  console.log(`   Environment Links: 5`);
  console.log(`   RACI Mappings: 5`);
  console.log(`   Environments: 7 total`);
  console.log(`     BSS-TX DEV: ${devNodes.length} nodes, ${devEdges.length} edges`);
  console.log(`     BSS-TX SIT: ${sitNodes.length} nodes, ${sitEdges.length} edges, ${databases.length} databases`);
  console.log(`     BSS-TX UAT: ${uatNodes.length} nodes, ${uatEdges.length} edges`);
  console.log(`     OSS-MOD NFT: ${nftNodes.length} nodes, ${nftEdges.length} edges`);
  console.log(`     OSS-MOD SIT: ${ossModSitNodes.length} nodes, ${ossModSitEdges.length} edges`);
  console.log(`     DAP DEV: ${dapDevNodes.length} nodes, ${dapDevEdges.length} edges`);
  console.log(`     SEC-CMP PREPROD: ${preprodNodes.length} nodes, ${preprodEdges.length} edges`);

  // Seed 5-layer canonical model data (for topology5 API)
  await seedCanonical5LayerData();

  // Seed cost data
  await seedCostData();

  // Seed governance alignment data
  await seedGovernanceData(prisma);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
