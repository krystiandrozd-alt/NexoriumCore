// Nexorium Core - 5-Layer Canonical Model Seed Data
// Seeds Component, Host, ComponentInstance, Endpoint, DeployedVersion, Connection tables
// for DEV, SIT, and UAT environments

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// COMPONENT DEFINITIONS (Reusable across environments)
// ============================================
const componentDefinitions = [
  // BSS Layer
  { id: 'comp-api-gateway', name: 'API-Gateway', layer: 'BSS', capabilityType: 'API_GW', vendor: 'Kong', description: 'API Gateway for external traffic' },
  { id: 'comp-crm', name: 'CRM-System', layer: 'BSS', capabilityType: 'CRM', vendor: 'Salesforce', description: 'Customer Relationship Management' },
  { id: 'comp-cpq', name: 'CPQ-Engine', layer: 'BSS', capabilityType: 'CPQ', vendor: 'Oracle', description: 'Configure-Price-Quote Engine' },
  { id: 'comp-billing', name: 'Billing-System', layer: 'BSS', capabilityType: 'BILLING', vendor: 'Amdocs', description: 'Revenue Management & Billing' },
  { id: 'comp-product-catalog', name: 'Product-Catalog', layer: 'BSS', capabilityType: 'OTHER', vendor: 'Internal', description: 'Product & Offer Catalog Service' },

  // OSS Layer
  { id: 'comp-oms', name: 'Order-Management', layer: 'OSS', capabilityType: 'SOM', vendor: 'Oracle', description: 'Order Management System' },
  { id: 'comp-orchestrator', name: 'Order-Orchestrator', layer: 'OSS', capabilityType: 'ORCHESTRATOR', vendor: 'Internal', description: 'Order Orchestration Service' },
  { id: 'comp-inventory', name: 'Inventory-Service', layer: 'OSS', capabilityType: 'INVENTORY', vendor: 'Internal', description: 'Resource & Service Inventory' },
  { id: 'comp-provisioning', name: 'Provisioning-Engine', layer: 'OSS', capabilityType: 'ORCHESTRATOR', vendor: 'Internal', description: 'Service Provisioning Engine' },
  { id: 'comp-nso', name: 'Cisco-NSO', layer: 'OSS', capabilityType: 'ORCHESTRATOR', vendor: 'Cisco', description: 'Network Service Orchestrator' },
  { id: 'comp-service-assurance', name: 'Service-Assurance', layer: 'OSS', capabilityType: 'OTHER', vendor: 'Nokia', description: 'Service Assurance Platform' },
  { id: 'comp-alarm-manager', name: 'Alarm-Manager', layer: 'OSS', capabilityType: 'OTHER', vendor: 'Internal', description: 'Alarm Management Service' },

  // INFRA Layer
  { id: 'comp-oracle-db', name: 'Oracle-Database', layer: 'INFRA', capabilityType: 'DB', vendor: 'Oracle', description: 'Oracle RAC Database' },
  { id: 'comp-postgres-db', name: 'PostgreSQL-Database', layer: 'INFRA', capabilityType: 'DB', vendor: 'PostgreSQL', description: 'PostgreSQL Database' },
  { id: 'comp-mongodb', name: 'MongoDB-Database', layer: 'INFRA', capabilityType: 'DB', vendor: 'MongoDB', description: 'MongoDB Document Store' },
  { id: 'comp-redis', name: 'Redis-Cache', layer: 'INFRA', capabilityType: 'DB', vendor: 'Redis', description: 'Redis Cache Cluster' },
  { id: 'comp-kafka', name: 'Kafka-Cluster', layer: 'INFRA', capabilityType: 'MQ', vendor: 'Apache', description: 'Apache Kafka Message Broker' },
  { id: 'comp-rabbitmq', name: 'RabbitMQ-Broker', layer: 'INFRA', capabilityType: 'MQ', vendor: 'VMware', description: 'RabbitMQ Message Broker' },
  { id: 'comp-f5-lb', name: 'F5-Load-Balancer', layer: 'INFRA', capabilityType: 'OTHER', vendor: 'F5', description: 'F5 LTM Load Balancer' },

  // EXTERNAL Layer
  { id: 'comp-payment-gw', name: 'Payment-Gateway', layer: 'EXTERNAL', capabilityType: 'OTHER', vendor: 'Stripe', description: 'External Payment Gateway' },
  { id: 'comp-sms-gw', name: 'SMS-Gateway', layer: 'EXTERNAL', capabilityType: 'OTHER', vendor: 'Twilio', description: 'External SMS Gateway' },
  { id: 'comp-credit-check', name: 'Credit-Check', layer: 'EXTERNAL', capabilityType: 'OTHER', vendor: 'Experian', description: 'External Credit Check API' },
];

// ============================================
// DEV ENVIRONMENT TOPOLOGY
// ============================================
const devTopology = {
  hosts: [
    { id: 'host-dev-app-01', hostname: 'app-dev-01.telco.internal', ip: '10.0.1.10', os: 'RHEL 8' },
    { id: 'host-dev-app-02', hostname: 'app-dev-02.telco.internal', ip: '10.0.1.11', os: 'RHEL 8' },
    { id: 'host-dev-db-01', hostname: 'db-dev-01.telco.internal', ip: '10.0.2.10', os: 'RHEL 8' },
    { id: 'host-dev-mq-01', hostname: 'mq-dev-01.telco.internal', ip: '10.0.3.10', os: 'RHEL 8' },
  ],
  instances: [
    { id: 'ci-dev-api-gw', componentId: 'comp-api-gateway', hostId: 'host-dev-app-01', displayName: 'Kong-DEV' },
    { id: 'ci-dev-crm', componentId: 'comp-crm', hostId: 'host-dev-app-01', displayName: 'CRM-DEV' },
    { id: 'ci-dev-cpq', componentId: 'comp-cpq', hostId: 'host-dev-app-02', displayName: 'CPQ-DEV' },
    { id: 'ci-dev-oms', componentId: 'comp-oms', hostId: 'host-dev-app-02', displayName: 'OMS-DEV' },
    { id: 'ci-dev-postgres', componentId: 'comp-postgres-db', hostId: 'host-dev-db-01', displayName: 'PostgreSQL-DEV' },
    { id: 'ci-dev-redis', componentId: 'comp-redis', hostId: 'host-dev-db-01', displayName: 'Redis-DEV' },
    { id: 'ci-dev-kafka', componentId: 'comp-kafka', hostId: 'host-dev-mq-01', displayName: 'Kafka-DEV' },
    { id: 'ci-dev-payment', componentId: 'comp-payment-gw', hostId: null, displayName: 'Mock-Payment-DEV' },
  ],
  endpoints: [
    { componentInstanceId: 'ci-dev-api-gw', kind: 'URL', value: 'https://api-dev.telco.internal', port: 8443, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-dev-crm', kind: 'URL', value: 'https://crm-dev.telco.internal', port: 8080, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-dev-cpq', kind: 'URL', value: 'https://cpq-dev.telco.internal', port: 8080, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-dev-oms', kind: 'URL', value: 'https://oms-dev.telco.internal', port: 8080, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-dev-postgres', kind: 'HOSTNAME', value: 'db-dev-01.telco.internal', port: 5432, scheme: 'JDBC' },
    { componentInstanceId: 'ci-dev-redis', kind: 'HOSTNAME', value: 'db-dev-01.telco.internal', port: 6379, scheme: 'TCP' },
    { componentInstanceId: 'ci-dev-kafka', kind: 'HOSTNAME', value: 'mq-dev-01.telco.internal', port: 9092, scheme: 'TCP' },
  ],
  versions: [
    { componentInstanceId: 'ci-dev-api-gw', projectVersion: '3.4.2-dev', vendorVersion: 'Kong 3.4.2' },
    { componentInstanceId: 'ci-dev-crm', projectVersion: 'Spring-2024-dev', vendorVersion: 'Salesforce Spring 2024' },
    { componentInstanceId: 'ci-dev-cpq', projectVersion: '5.2.1-SNAPSHOT', vendorVersion: 'Oracle CPQ 5.2' },
    { componentInstanceId: 'ci-dev-oms', projectVersion: '7.3.2-SNAPSHOT', vendorVersion: 'Oracle OMS 7.3' },
    { componentInstanceId: 'ci-dev-postgres', projectVersion: '15.4', vendorVersion: 'PostgreSQL 15.4' },
    { componentInstanceId: 'ci-dev-redis', projectVersion: '7.2.0', vendorVersion: 'Redis 7.2' },
    { componentInstanceId: 'ci-dev-kafka', projectVersion: '3.6.0', vendorVersion: 'Apache Kafka 3.6' },
  ],
  connections: [
    // API Gateway routes
    { from: 'ci-dev-api-gw', to: 'ci-dev-crm', protocol: 'REST', port: 8080, confidence: 'HIGH' },
    { from: 'ci-dev-api-gw', to: 'ci-dev-cpq', protocol: 'REST', port: 8080, confidence: 'HIGH' },
    { from: 'ci-dev-api-gw', to: 'ci-dev-oms', protocol: 'REST', port: 8080, confidence: 'HIGH' },
    // CRM -> CPQ -> OMS flow
    { from: 'ci-dev-crm', to: 'ci-dev-cpq', protocol: 'REST', port: 8080, confidence: 'HIGH' },
    { from: 'ci-dev-cpq', to: 'ci-dev-oms', protocol: 'REST', port: 8080, confidence: 'HIGH' },
    // Database connections
    { from: 'ci-dev-crm', to: 'ci-dev-postgres', protocol: 'JDBC', port: 5432, confidence: 'HIGH' },
    { from: 'ci-dev-cpq', to: 'ci-dev-postgres', protocol: 'JDBC', port: 5432, confidence: 'HIGH' },
    { from: 'ci-dev-oms', to: 'ci-dev-postgres', protocol: 'JDBC', port: 5432, confidence: 'HIGH' },
    // Cache
    { from: 'ci-dev-api-gw', to: 'ci-dev-redis', protocol: 'TCP', port: 6379, confidence: 'HIGH' },
    // Event streaming
    { from: 'ci-dev-oms', to: 'ci-dev-kafka', protocol: 'TCP', port: 9092, confidence: 'HIGH' },
    // External
    { from: 'ci-dev-oms', to: 'ci-dev-payment', protocol: 'REST', port: 443, confidence: 'MED' },
  ],
};

// ============================================
// SIT ENVIRONMENT TOPOLOGY (Full OSS/BSS Stack)
// ============================================
const sitTopology = {
  hosts: [
    { id: 'host-sit-dmz-01', hostname: 'dmz-sit-01.telco.internal', ip: '10.10.1.10', os: 'RHEL 8' },
    { id: 'host-sit-app-01', hostname: 'app-sit-01.telco.internal', ip: '10.10.2.10', os: 'RHEL 8' },
    { id: 'host-sit-app-02', hostname: 'app-sit-02.telco.internal', ip: '10.10.2.11', os: 'RHEL 8' },
    { id: 'host-sit-app-03', hostname: 'app-sit-03.telco.internal', ip: '10.10.2.12', os: 'RHEL 8' },
    { id: 'host-sit-oss-01', hostname: 'oss-sit-01.telco.internal', ip: '10.10.3.10', os: 'RHEL 8' },
    { id: 'host-sit-oss-02', hostname: 'oss-sit-02.telco.internal', ip: '10.10.3.11', os: 'RHEL 8' },
    { id: 'host-sit-db-01', hostname: 'db-sit-01.telco.internal', ip: '10.10.4.10', os: 'Oracle Linux 8' },
    { id: 'host-sit-db-02', hostname: 'db-sit-02.telco.internal', ip: '10.10.4.11', os: 'RHEL 8' },
    { id: 'host-sit-mq-01', hostname: 'mq-sit-01.telco.internal', ip: '10.10.5.10', os: 'RHEL 8' },
  ],
  instances: [
    // DMZ Layer
    { id: 'ci-sit-f5', componentId: 'comp-f5-lb', hostId: 'host-sit-dmz-01', displayName: 'F5-LTM-SIT' },
    { id: 'ci-sit-api-gw', componentId: 'comp-api-gateway', hostId: 'host-sit-dmz-01', displayName: 'Kong-SIT' },
    // BSS Layer
    { id: 'ci-sit-crm', componentId: 'comp-crm', hostId: 'host-sit-app-01', displayName: 'Salesforce-CRM-SIT' },
    { id: 'ci-sit-cpq', componentId: 'comp-cpq', hostId: 'host-sit-app-01', displayName: 'CPQ-Engine-SIT' },
    { id: 'ci-sit-billing', componentId: 'comp-billing', hostId: 'host-sit-app-02', displayName: 'Billing-System-SIT' },
    { id: 'ci-sit-catalog', componentId: 'comp-product-catalog', hostId: 'host-sit-app-02', displayName: 'Product-Catalog-SIT' },
    // OSS Layer
    { id: 'ci-sit-oms', componentId: 'comp-oms', hostId: 'host-sit-app-03', displayName: 'Order-Mgmt-SIT' },
    { id: 'ci-sit-orchestrator', componentId: 'comp-orchestrator', hostId: 'host-sit-oss-01', displayName: 'Order-Orchestrator-SIT' },
    { id: 'ci-sit-inventory', componentId: 'comp-inventory', hostId: 'host-sit-oss-01', displayName: 'Inventory-Service-SIT' },
    { id: 'ci-sit-provisioning', componentId: 'comp-provisioning', hostId: 'host-sit-oss-01', displayName: 'Provisioning-Engine-SIT' },
    { id: 'ci-sit-nso', componentId: 'comp-nso', hostId: 'host-sit-oss-02', displayName: 'Cisco-NSO-SIT' },
    { id: 'ci-sit-sa', componentId: 'comp-service-assurance', hostId: 'host-sit-oss-02', displayName: 'Service-Assurance-SIT' },
    { id: 'ci-sit-alarm', componentId: 'comp-alarm-manager', hostId: 'host-sit-oss-02', displayName: 'Alarm-Manager-SIT' },
    // INFRA Layer
    { id: 'ci-sit-oracle-crm', componentId: 'comp-oracle-db', hostId: 'host-sit-db-01', displayName: 'Oracle-CRM-DB-SIT' },
    { id: 'ci-sit-oracle-oms', componentId: 'comp-oracle-db', hostId: 'host-sit-db-01', displayName: 'Oracle-OMS-DB-SIT' },
    { id: 'ci-sit-postgres', componentId: 'comp-postgres-db', hostId: 'host-sit-db-02', displayName: 'PostgreSQL-Catalog-SIT' },
    { id: 'ci-sit-mongodb', componentId: 'comp-mongodb', hostId: 'host-sit-db-02', displayName: 'MongoDB-Events-SIT' },
    { id: 'ci-sit-redis', componentId: 'comp-redis', hostId: 'host-sit-db-02', displayName: 'Redis-Cache-SIT' },
    { id: 'ci-sit-kafka', componentId: 'comp-kafka', hostId: 'host-sit-mq-01', displayName: 'Kafka-Cluster-SIT' },
    { id: 'ci-sit-rabbitmq', componentId: 'comp-rabbitmq', hostId: 'host-sit-mq-01', displayName: 'RabbitMQ-Broker-SIT' },
    // EXTERNAL Layer
    { id: 'ci-sit-payment', componentId: 'comp-payment-gw', hostId: null, displayName: 'Payment-Gateway-SIT' },
    { id: 'ci-sit-sms', componentId: 'comp-sms-gw', hostId: null, displayName: 'SMS-Gateway-SIT' },
    { id: 'ci-sit-credit', componentId: 'comp-credit-check', hostId: null, displayName: 'Credit-Check-SIT' },
  ],
  endpoints: [
    { componentInstanceId: 'ci-sit-f5', kind: 'VIP', value: '10.10.1.100', port: 443, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-sit-api-gw', kind: 'URL', value: 'https://api-sit.telco.internal', port: 8443, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-sit-crm', kind: 'URL', value: 'https://crm-sit.telco.internal', port: 8080, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-sit-cpq', kind: 'URL', value: 'https://cpq-sit.telco.internal', port: 8080, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-sit-billing', kind: 'URL', value: 'https://billing-sit.telco.internal', port: 8080, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-sit-catalog', kind: 'URL', value: 'https://catalog-sit.telco.internal', port: 8083, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-sit-oms', kind: 'URL', value: 'https://oms-sit.telco.internal', port: 8080, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-sit-orchestrator', kind: 'URL', value: 'https://orchestrator-sit.telco.internal', port: 8081, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-sit-inventory', kind: 'URL', value: 'https://inventory-sit.telco.internal', port: 8082, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-sit-provisioning', kind: 'URL', value: 'https://provisioning-sit.telco.internal', port: 8083, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-sit-nso', kind: 'URL', value: 'https://nso-sit.telco.internal', port: 8080, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-sit-sa', kind: 'URL', value: 'https://sa-sit.telco.internal', port: 8080, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-sit-alarm', kind: 'URL', value: 'https://alarm-sit.telco.internal', port: 8081, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-sit-oracle-crm', kind: 'HOSTNAME', value: 'db-sit-01.telco.internal', port: 1521, scheme: 'JDBC' },
    { componentInstanceId: 'ci-sit-oracle-oms', kind: 'HOSTNAME', value: 'db-sit-01.telco.internal', port: 1522, scheme: 'JDBC' },
    { componentInstanceId: 'ci-sit-postgres', kind: 'HOSTNAME', value: 'db-sit-02.telco.internal', port: 5432, scheme: 'JDBC' },
    { componentInstanceId: 'ci-sit-mongodb', kind: 'HOSTNAME', value: 'db-sit-02.telco.internal', port: 27017, scheme: 'TCP' },
    { componentInstanceId: 'ci-sit-redis', kind: 'HOSTNAME', value: 'db-sit-02.telco.internal', port: 6379, scheme: 'TCP' },
    { componentInstanceId: 'ci-sit-kafka', kind: 'HOSTNAME', value: 'mq-sit-01.telco.internal', port: 9092, scheme: 'TCP' },
    { componentInstanceId: 'ci-sit-rabbitmq', kind: 'HOSTNAME', value: 'mq-sit-01.telco.internal', port: 5672, scheme: 'AMQP' },
  ],
  versions: [
    { componentInstanceId: 'ci-sit-f5', projectVersion: '17.1.0', vendorVersion: 'F5 BIG-IP 17.1' },
    { componentInstanceId: 'ci-sit-api-gw', projectVersion: '3.4.2', vendorVersion: 'Kong 3.4.2' },
    { componentInstanceId: 'ci-sit-crm', projectVersion: 'Spring-2024', vendorVersion: 'Salesforce Spring 2024' },
    { componentInstanceId: 'ci-sit-cpq', projectVersion: '5.2.0', vendorVersion: 'Oracle CPQ 5.2' },
    { componentInstanceId: 'ci-sit-billing', projectVersion: '22.1.0', vendorVersion: 'Amdocs Billing 22.1' },
    { componentInstanceId: 'ci-sit-catalog', projectVersion: '4.0.2', vendorVersion: 'Internal v4' },
    { componentInstanceId: 'ci-sit-oms', projectVersion: '7.3.1', vendorVersion: 'Oracle OMS 7.3' },
    { componentInstanceId: 'ci-sit-orchestrator', projectVersion: '3.2.0', vendorVersion: 'Internal v3' },
    { componentInstanceId: 'ci-sit-inventory', projectVersion: '2.8.0', vendorVersion: 'Internal v2' },
    { componentInstanceId: 'ci-sit-provisioning', projectVersion: '4.1.2', vendorVersion: 'Internal v4' },
    { componentInstanceId: 'ci-sit-nso', projectVersion: '6.1.0', vendorVersion: 'Cisco NSO 6.1' },
    { componentInstanceId: 'ci-sit-sa', projectVersion: '8.2.0', vendorVersion: 'Nokia NetAct 8.2' },
    { componentInstanceId: 'ci-sit-alarm', projectVersion: '3.5.0', vendorVersion: 'Internal v3' },
    { componentInstanceId: 'ci-sit-oracle-crm', projectVersion: '19.3.0', vendorVersion: 'Oracle 19c' },
    { componentInstanceId: 'ci-sit-oracle-oms', projectVersion: '19.3.0', vendorVersion: 'Oracle 19c' },
    { componentInstanceId: 'ci-sit-postgres', projectVersion: '15.4', vendorVersion: 'PostgreSQL 15.4' },
    { componentInstanceId: 'ci-sit-mongodb', projectVersion: '7.0.2', vendorVersion: 'MongoDB 7.0' },
    { componentInstanceId: 'ci-sit-redis', projectVersion: '7.2.3', vendorVersion: 'Redis 7.2' },
    { componentInstanceId: 'ci-sit-kafka', projectVersion: '3.6.0', vendorVersion: 'Apache Kafka 3.6' },
    { componentInstanceId: 'ci-sit-rabbitmq', projectVersion: '3.12.0', vendorVersion: 'RabbitMQ 3.12' },
  ],
  connections: [
    // DMZ/Entry flow
    { from: 'ci-sit-f5', to: 'ci-sit-api-gw', protocol: 'REST', port: 8443, confidence: 'HIGH' },
    // API Gateway routes
    { from: 'ci-sit-api-gw', to: 'ci-sit-crm', protocol: 'REST', port: 8080, confidence: 'HIGH' },
    { from: 'ci-sit-api-gw', to: 'ci-sit-cpq', protocol: 'REST', port: 8080, confidence: 'HIGH' },
    { from: 'ci-sit-api-gw', to: 'ci-sit-oms', protocol: 'REST', port: 8080, confidence: 'HIGH' },
    { from: 'ci-sit-api-gw', to: 'ci-sit-sa', protocol: 'REST', port: 8080, confidence: 'HIGH' },
    // CRM flow
    { from: 'ci-sit-crm', to: 'ci-sit-cpq', protocol: 'REST', port: 8080, confidence: 'HIGH' },
    { from: 'ci-sit-crm', to: 'ci-sit-credit', protocol: 'REST', port: 443, confidence: 'MED' },
    // CPQ flow
    { from: 'ci-sit-cpq', to: 'ci-sit-catalog', protocol: 'REST', port: 8083, confidence: 'HIGH' },
    { from: 'ci-sit-cpq', to: 'ci-sit-oms', protocol: 'REST', port: 8080, confidence: 'HIGH' },
    { from: 'ci-sit-cpq', to: 'ci-sit-billing', protocol: 'REST', port: 8080, confidence: 'HIGH' },
    // Order Fulfillment flow
    { from: 'ci-sit-oms', to: 'ci-sit-orchestrator', protocol: 'REST', port: 8081, confidence: 'HIGH' },
    { from: 'ci-sit-orchestrator', to: 'ci-sit-inventory', protocol: 'REST', port: 8082, confidence: 'HIGH' },
    { from: 'ci-sit-orchestrator', to: 'ci-sit-provisioning', protocol: 'REST', port: 8083, confidence: 'HIGH' },
    { from: 'ci-sit-provisioning', to: 'ci-sit-nso', protocol: 'REST', port: 8080, confidence: 'HIGH' },
    // NSO -> Service Assurance
    { from: 'ci-sit-nso', to: 'ci-sit-sa', protocol: 'REST', port: 8080, confidence: 'HIGH' },
    { from: 'ci-sit-sa', to: 'ci-sit-alarm', protocol: 'REST', port: 8081, confidence: 'HIGH' },
    // Database connections
    { from: 'ci-sit-crm', to: 'ci-sit-oracle-crm', protocol: 'JDBC', port: 1521, confidence: 'HIGH' },
    { from: 'ci-sit-cpq', to: 'ci-sit-oracle-crm', protocol: 'JDBC', port: 1521, confidence: 'HIGH' },
    { from: 'ci-sit-billing', to: 'ci-sit-oracle-crm', protocol: 'JDBC', port: 1521, confidence: 'HIGH' },
    { from: 'ci-sit-oms', to: 'ci-sit-oracle-oms', protocol: 'JDBC', port: 1522, confidence: 'HIGH' },
    { from: 'ci-sit-orchestrator', to: 'ci-sit-oracle-oms', protocol: 'JDBC', port: 1522, confidence: 'HIGH' },
    { from: 'ci-sit-inventory', to: 'ci-sit-oracle-oms', protocol: 'JDBC', port: 1522, confidence: 'HIGH' },
    { from: 'ci-sit-catalog', to: 'ci-sit-postgres', protocol: 'JDBC', port: 5432, confidence: 'HIGH' },
    { from: 'ci-sit-sa', to: 'ci-sit-mongodb', protocol: 'TCP', port: 27017, confidence: 'HIGH' },
    { from: 'ci-sit-alarm', to: 'ci-sit-mongodb', protocol: 'TCP', port: 27017, confidence: 'HIGH' },
    // Cache connections
    { from: 'ci-sit-api-gw', to: 'ci-sit-redis', protocol: 'TCP', port: 6379, confidence: 'HIGH' },
    { from: 'ci-sit-cpq', to: 'ci-sit-redis', protocol: 'TCP', port: 6379, confidence: 'HIGH' },
    { from: 'ci-sit-catalog', to: 'ci-sit-redis', protocol: 'TCP', port: 6379, confidence: 'HIGH' },
    // Event streaming
    { from: 'ci-sit-oms', to: 'ci-sit-kafka', protocol: 'TCP', port: 9092, confidence: 'HIGH' },
    { from: 'ci-sit-crm', to: 'ci-sit-kafka', protocol: 'TCP', port: 9092, confidence: 'HIGH' },
    { from: 'ci-sit-alarm', to: 'ci-sit-kafka', protocol: 'TCP', port: 9092, confidence: 'HIGH' },
    { from: 'ci-sit-nso', to: 'ci-sit-kafka', protocol: 'TCP', port: 9092, confidence: 'HIGH' },
    // External integrations
    { from: 'ci-sit-oms', to: 'ci-sit-payment', protocol: 'REST', port: 443, confidence: 'MED' },
    { from: 'ci-sit-orchestrator', to: 'ci-sit-sms', protocol: 'REST', port: 443, confidence: 'MED' },
  ],
};

// ============================================
// UAT ENVIRONMENT TOPOLOGY (Production-like)
// ============================================
const uatTopology = {
  hosts: [
    { id: 'host-uat-dmz-01', hostname: 'dmz-uat-01.telco.internal', ip: '10.20.1.10', os: 'RHEL 8' },
    { id: 'host-uat-app-01', hostname: 'app-uat-01.telco.internal', ip: '10.20.2.10', os: 'RHEL 8' },
    { id: 'host-uat-app-02', hostname: 'app-uat-02.telco.internal', ip: '10.20.2.11', os: 'RHEL 8' },
    { id: 'host-uat-oss-01', hostname: 'oss-uat-01.telco.internal', ip: '10.20.3.10', os: 'RHEL 8' },
    { id: 'host-uat-db-01', hostname: 'db-uat-01.telco.internal', ip: '10.20.4.10', os: 'Oracle Linux 8' },
    { id: 'host-uat-mq-01', hostname: 'mq-uat-01.telco.internal', ip: '10.20.5.10', os: 'RHEL 8' },
  ],
  instances: [
    // DMZ Layer
    { id: 'ci-uat-f5', componentId: 'comp-f5-lb', hostId: 'host-uat-dmz-01', displayName: 'F5-LTM-UAT' },
    { id: 'ci-uat-api-gw', componentId: 'comp-api-gateway', hostId: 'host-uat-dmz-01', displayName: 'Kong-UAT' },
    // BSS Layer
    { id: 'ci-uat-crm', componentId: 'comp-crm', hostId: 'host-uat-app-01', displayName: 'Salesforce-CRM-UAT' },
    { id: 'ci-uat-cpq', componentId: 'comp-cpq', hostId: 'host-uat-app-01', displayName: 'CPQ-Engine-UAT' },
    { id: 'ci-uat-billing', componentId: 'comp-billing', hostId: 'host-uat-app-02', displayName: 'Billing-System-UAT' },
    // OSS Layer
    { id: 'ci-uat-oms', componentId: 'comp-oms', hostId: 'host-uat-app-02', displayName: 'Order-Mgmt-UAT' },
    { id: 'ci-uat-nso', componentId: 'comp-nso', hostId: 'host-uat-oss-01', displayName: 'Cisco-NSO-UAT' },
    { id: 'ci-uat-sa', componentId: 'comp-service-assurance', hostId: 'host-uat-oss-01', displayName: 'Service-Assurance-UAT' },
    // INFRA Layer
    { id: 'ci-uat-oracle', componentId: 'comp-oracle-db', hostId: 'host-uat-db-01', displayName: 'Oracle-RAC-UAT' },
    { id: 'ci-uat-redis', componentId: 'comp-redis', hostId: 'host-uat-db-01', displayName: 'Redis-Cache-UAT' },
    { id: 'ci-uat-kafka', componentId: 'comp-kafka', hostId: 'host-uat-mq-01', displayName: 'Kafka-Cluster-UAT' },
    // EXTERNAL Layer
    { id: 'ci-uat-payment', componentId: 'comp-payment-gw', hostId: null, displayName: 'Payment-Gateway-UAT' },
  ],
  endpoints: [
    { componentInstanceId: 'ci-uat-f5', kind: 'VIP', value: '10.20.1.100', port: 443, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-uat-api-gw', kind: 'URL', value: 'https://api-uat.telco.internal', port: 8443, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-uat-crm', kind: 'URL', value: 'https://crm-uat.telco.internal', port: 8080, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-uat-cpq', kind: 'URL', value: 'https://cpq-uat.telco.internal', port: 8080, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-uat-billing', kind: 'URL', value: 'https://billing-uat.telco.internal', port: 8080, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-uat-oms', kind: 'URL', value: 'https://oms-uat.telco.internal', port: 8080, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-uat-nso', kind: 'URL', value: 'https://nso-uat.telco.internal', port: 8080, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-uat-sa', kind: 'URL', value: 'https://sa-uat.telco.internal', port: 8080, scheme: 'HTTPS' },
    { componentInstanceId: 'ci-uat-oracle', kind: 'HOSTNAME', value: 'db-uat-01.telco.internal', port: 1521, scheme: 'JDBC' },
    { componentInstanceId: 'ci-uat-redis', kind: 'HOSTNAME', value: 'db-uat-01.telco.internal', port: 6379, scheme: 'TCP' },
    { componentInstanceId: 'ci-uat-kafka', kind: 'HOSTNAME', value: 'mq-uat-01.telco.internal', port: 9092, scheme: 'TCP' },
  ],
  versions: [
    { componentInstanceId: 'ci-uat-f5', projectVersion: '17.1.0', vendorVersion: 'F5 BIG-IP 17.1' },
    { componentInstanceId: 'ci-uat-api-gw', projectVersion: '3.4.2', vendorVersion: 'Kong 3.4.2' },
    { componentInstanceId: 'ci-uat-crm', projectVersion: 'Spring-2024', vendorVersion: 'Salesforce Spring 2024' },
    { componentInstanceId: 'ci-uat-cpq', projectVersion: '5.2.0', vendorVersion: 'Oracle CPQ 5.2' },
    { componentInstanceId: 'ci-uat-billing', projectVersion: '22.1.0', vendorVersion: 'Amdocs Billing 22.1' },
    { componentInstanceId: 'ci-uat-oms', projectVersion: '7.3.1', vendorVersion: 'Oracle OMS 7.3' },
    { componentInstanceId: 'ci-uat-nso', projectVersion: '6.1.0', vendorVersion: 'Cisco NSO 6.1' },
    { componentInstanceId: 'ci-uat-sa', projectVersion: '8.2.0', vendorVersion: 'Nokia NetAct 8.2' },
    { componentInstanceId: 'ci-uat-oracle', projectVersion: '19.3.0', vendorVersion: 'Oracle 19c' },
    { componentInstanceId: 'ci-uat-redis', projectVersion: '7.2.3', vendorVersion: 'Redis 7.2' },
    { componentInstanceId: 'ci-uat-kafka', projectVersion: '3.6.0', vendorVersion: 'Apache Kafka 3.6' },
  ],
  connections: [
    // DMZ flow
    { from: 'ci-uat-f5', to: 'ci-uat-api-gw', protocol: 'REST', port: 8443, confidence: 'HIGH' },
    // API Gateway routes
    { from: 'ci-uat-api-gw', to: 'ci-uat-crm', protocol: 'REST', port: 8080, confidence: 'HIGH' },
    { from: 'ci-uat-api-gw', to: 'ci-uat-cpq', protocol: 'REST', port: 8080, confidence: 'HIGH' },
    { from: 'ci-uat-api-gw', to: 'ci-uat-oms', protocol: 'REST', port: 8080, confidence: 'HIGH' },
    { from: 'ci-uat-api-gw', to: 'ci-uat-sa', protocol: 'REST', port: 8080, confidence: 'HIGH' },
    // CRM -> CPQ -> OMS flow
    { from: 'ci-uat-crm', to: 'ci-uat-cpq', protocol: 'REST', port: 8080, confidence: 'HIGH' },
    { from: 'ci-uat-cpq', to: 'ci-uat-billing', protocol: 'REST', port: 8080, confidence: 'HIGH' },
    { from: 'ci-uat-cpq', to: 'ci-uat-oms', protocol: 'REST', port: 8080, confidence: 'HIGH' },
    // OMS -> NSO -> SA
    { from: 'ci-uat-oms', to: 'ci-uat-nso', protocol: 'REST', port: 8080, confidence: 'HIGH' },
    { from: 'ci-uat-nso', to: 'ci-uat-sa', protocol: 'REST', port: 8080, confidence: 'HIGH' },
    // Database connections
    { from: 'ci-uat-crm', to: 'ci-uat-oracle', protocol: 'JDBC', port: 1521, confidence: 'HIGH' },
    { from: 'ci-uat-cpq', to: 'ci-uat-oracle', protocol: 'JDBC', port: 1521, confidence: 'HIGH' },
    { from: 'ci-uat-billing', to: 'ci-uat-oracle', protocol: 'JDBC', port: 1521, confidence: 'HIGH' },
    { from: 'ci-uat-oms', to: 'ci-uat-oracle', protocol: 'JDBC', port: 1521, confidence: 'HIGH' },
    // Cache
    { from: 'ci-uat-api-gw', to: 'ci-uat-redis', protocol: 'TCP', port: 6379, confidence: 'HIGH' },
    // Event streaming
    { from: 'ci-uat-oms', to: 'ci-uat-kafka', protocol: 'TCP', port: 9092, confidence: 'HIGH' },
    // External
    { from: 'ci-uat-oms', to: 'ci-uat-payment', protocol: 'REST', port: 443, confidence: 'MED' },
  ],
};

export async function seedCanonical5LayerData() {
  console.log('\n🔧 Seeding 5-layer canonical model data...\n');

  // Clear existing 5-layer data (in dependency order)
  await prisma.connection.deleteMany({});
  await prisma.deployedVersion.deleteMany({});
  await prisma.endpoint.deleteMany({});
  await prisma.componentInstance.deleteMany({});
  await prisma.host.deleteMany({});
  await prisma.component.deleteMany({});
  console.log('  ✓ Cleared existing 5-layer data');

  // Create Components
  for (const comp of componentDefinitions) {
    await prisma.component.create({
      data: {
        id: comp.id,
        name: comp.name,
        layer: comp.layer as 'BSS' | 'OSS' | 'INFRA' | 'EXTERNAL' | 'UNKNOWN',
        capabilityType: comp.capabilityType as 'CPQ' | 'CRM' | 'BILLING' | 'SOM' | 'INVENTORY' | 'ORCHESTRATOR' | 'DB' | 'MQ' | 'API_GW' | 'IDENTITY' | 'ITSM' | 'OTHER' | 'UNKNOWN',
        vendor: comp.vendor,
        description: comp.description,
      },
    });
  }
  console.log(`  ✓ Created ${componentDefinitions.length} component definitions`);

  // Helper function to seed topology for an environment
  async function seedEnvTopology(
    envId: string,
    envName: string,
    topology: typeof devTopology
  ) {
    // Create Hosts
    for (const host of topology.hosts) {
      await prisma.host.create({
        data: {
          id: host.id,
          environmentId: envId,
          hostname: host.hostname,
          ip: host.ip,
          os: host.os,
          sourceSystem: 'SEED',
          ingestedAt: new Date(),
        },
      });
    }

    // Create ComponentInstances
    for (const instance of topology.instances) {
      await prisma.componentInstance.create({
        data: {
          id: instance.id,
          environmentId: envId,
          componentId: instance.componentId,
          hostId: instance.hostId,
          displayName: instance.displayName,
          sourceSystem: 'SEED',
          ingestedAt: new Date(),
        },
      });
    }

    // Create Endpoints
    for (const endpoint of topology.endpoints) {
      await prisma.endpoint.create({
        data: {
          componentInstanceId: endpoint.componentInstanceId,
          kind: endpoint.kind as 'HOSTNAME' | 'IP' | 'NAT' | 'VIP' | 'URL',
          value: endpoint.value,
          port: endpoint.port,
          scheme: endpoint.scheme as 'TCP' | 'HTTP' | 'HTTPS' | 'GRPC' | 'JDBC' | 'AMQP' | undefined,
          sourceSystem: 'SEED',
          ingestedAt: new Date(),
        },
      });
    }

    // Create DeployedVersions
    for (const version of topology.versions) {
      await prisma.deployedVersion.create({
        data: {
          componentInstanceId: version.componentInstanceId,
          projectVersion: version.projectVersion,
          vendorVersion: version.vendorVersion,
          capturedAt: new Date(),
          sourceSystem: 'SEED',
          ingestedAt: new Date(),
        },
      });
    }

    // Create Connections
    let connIndex = 0;
    for (const conn of topology.connections) {
      await prisma.connection.create({
        data: {
          id: `conn-${envId}-${connIndex++}`,
          environmentId: envId,
          fromComponentInstanceId: conn.from,
          toComponentInstanceId: conn.to,
          protocolType: conn.protocol as 'REST' | 'SOAP' | 'TCP' | 'SFTP' | 'GRPC' | 'MQ' | 'JDBC' | 'OTHER',
          port: conn.port,
          confidence: conn.confidence as 'HIGH' | 'MED' | 'LOW',
          origin: 'INGESTED',
          sourceSystem: 'SEED',
          ingestedAt: new Date(),
        },
      });
    }

    console.log(`  ✓ ${envName}: ${topology.hosts.length} hosts, ${topology.instances.length} instances, ${topology.connections.length} connections`);
  }

  // Seed each environment
  await seedEnvTopology('dev-env-001', 'DEV', devTopology);
  await seedEnvTopology('sit-env-001', 'SIT', sitTopology);
  await seedEnvTopology('uat-env-001', 'UAT', uatTopology);

  console.log('\n✅ 5-layer canonical model seed completed!\n');
}
