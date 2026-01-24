// TelEnvIQ - Seed Data Script
// Realistic Telco Test Environment Topology
// Run with: npx prisma db seed

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding TelEnvIQ database with realistic telco topology...\n');

  // Clear existing data
  await prisma.refreshRecord.deleteMany({});
  await prisma.testDataSet.deleteMany({});
  await prisma.databaseMetadata.deleteMany({});
  await prisma.evidence.deleteMany({});
  await prisma.environmentSnapshot.deleteMany({});
  await prisma.edge.deleteMany({});
  await prisma.node.deleteMany({});
  await prisma.environment.deleteMany({});

  // ============================================
  // SIT Environment - Full Telco OSS/BSS Stack
  // ============================================
  const sitEnv = await prisma.environment.create({
    data: {
      id: 'sit-env-001',
      name: 'SIT Environment',
      type: 'SIT',
      description: 'System Integration Test - Full OSS/BSS stack with CRM, CPQ, Order Fulfillment, Network Orchestration',
    },
  });
  console.log(`✓ Created environment: ${sitEnv.name}`);

  // ============================================
  // UAT Environment - Business Validation
  // ============================================
  const uatEnv = await prisma.environment.create({
    data: {
      id: 'uat-env-001',
      name: 'UAT Environment',
      type: 'UAT',
      description: 'User Acceptance Test - Business validation with production-like data',
    },
  });
  console.log(`✓ Created environment: ${uatEnv.name}`);

  // ============================================
  // NFT Environment - Performance Testing
  // ============================================
  const nftEnv = await prisma.environment.create({
    data: {
      id: 'nft-env-001',
      name: 'NFT Environment',
      type: 'NFT',
      description: 'Non-Functional Test - Performance, load, and stress testing',
    },
  });
  console.log(`✓ Created environment: ${nftEnv.name}`);

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

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   SIT: ${sitNodes.length} nodes, ${sitEdges.length} edges, ${databases.length} databases`);
  console.log(`   UAT: ${uatNodes.length} nodes, ${uatEdges.length} edges`);
  console.log(`   NFT: ${nftNodes.length} nodes, ${nftEdges.length} edges`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
