-- Synchronises the migration history with prisma/schema.prisma.
-- The previous migrations covered only the initial model; the rest of the schema had been applied
-- with `prisma db push`. Generated with:
--   prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --script
-- Additive only: no DROP statements.

-- CreateEnum
CREATE TYPE "NetworkZoneType" AS ENUM ('PROD', 'NON_PROD', 'DMZ', 'PARTNER', 'INTERNET', 'SECURE_CORE', 'LAB');

-- CreateEnum
CREATE TYPE "ConnectivityPolicy" AS ENUM ('RESTRICTED', 'ALLOWED_VIA_GATEWAY', 'NO_DIRECT_ACCESS');

-- CreateEnum
CREATE TYPE "BridgeMechanism" AS ENUM ('API_GATEWAY', 'PROXY', 'BASTION', 'FILE_TRANSFER', 'ESB', 'DIRECT');

-- CreateEnum
CREATE TYPE "VirtualizationType" AS ENUM ('VM', 'CONTAINER', 'CNF', 'VNF', 'BARE_METAL');

-- CreateEnum
CREATE TYPE "DataClassification" AS ENUM ('PII', 'PCI', 'CONFIDENTIAL', 'NON_SENSITIVE');

-- CreateEnum
CREATE TYPE "MaskingMethod" AS ENUM ('TOKENIZATION', 'STATIC_MASK', 'DYNAMIC_MASK', 'SYNTHETIC', 'NONE');

-- CreateEnum
CREATE TYPE "ComplianceFlag" AS ENUM ('GDPR', 'PCI_DSS', 'HIPAA', 'SOX', 'INTERNAL_POLICY', 'CCPA');

-- CreateEnum
CREATE TYPE "ActivityActionType" AS ENUM ('CONNECTOR_RUN', 'SNAPSHOT_CREATED', 'MANUAL_EDIT', 'ENRICHMENT_ADDED', 'ENRICHMENT_REVERTED', 'POLICY_VIOLATION_DETECTED', 'POLICY_VIOLATION_RESOLVED', 'APPROVAL_GRANTED', 'APPROVAL_REVOKED', 'DATA_REFRESH', 'OWNERSHIP_CHANGED');

-- CreateEnum
CREATE TYPE "TelcoLayer" AS ENUM ('BSS', 'OSS', 'NETWORK', 'SHARED', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "TelcoSubsystem" AS ENUM ('CRM', 'CPQ', 'BILLING', 'ORDER_MANAGEMENT', 'REVENUE_ASSURANCE', 'DUNNING', 'COLLECTIONS', 'PRODUCT_CATALOG', 'MEDIATION', 'RATING', 'PROVISIONING', 'ACTIVATION', 'INVENTORY', 'FAULT_MANAGEMENT', 'PERFORMANCE_MANAGEMENT', 'SERVICE_ASSURANCE', 'NETWORK_MONITORING', 'AAA', 'HSS', 'PCRF', 'SMSC', 'MMSC', 'IMS', 'VAS', 'CHANNEL', 'API_GATEWAY', 'INTEGRATION', 'DATA_WAREHOUSE', 'ANALYTICS', 'OTHER');

-- CreateEnum
CREATE TYPE "HostingType" AS ENUM ('CLOUD', 'ON_PREM', 'HYBRID', 'THIRD_PARTY', 'EDGE');

-- CreateEnum
CREATE TYPE "ArchitectureLayer" AS ENUM ('BSS', 'OSS', 'INFRA', 'EXTERNAL', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "CapabilityType" AS ENUM ('CPQ', 'CRM', 'BILLING', 'SOM', 'INVENTORY', 'ORCHESTRATOR', 'DB', 'MQ', 'API_GW', 'IDENTITY', 'ITSM', 'OTHER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ConnectionOrigin" AS ENUM ('INGESTED', 'MANUAL');

-- CreateEnum
CREATE TYPE "ConnectionConfidence" AS ENUM ('HIGH', 'MED', 'LOW');

-- CreateEnum
CREATE TYPE "CloudProvider" AS ENUM ('AWS', 'AZURE', 'GCP', 'ORACLE_CLOUD', 'IBM_CLOUD', 'ALIBABA_CLOUD', 'PRIVATE_CLOUD', 'NONE');

-- CreateEnum
CREATE TYPE "EnrichmentStatus" AS ENUM ('ACTIVE', 'REVERTED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "ViolationSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ViolationStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'SUPPRESSED');

-- CreateEnum
CREATE TYPE "ComponentCategory" AS ENUM ('BSS', 'OSS', 'INFRA', 'DATABASE', 'MESSAGING', 'INTEGRATION', 'SECURITY', 'MONITORING', 'OTHER');

-- CreateEnum
CREATE TYPE "EndpointKind" AS ENUM ('HOSTNAME', 'IP', 'NAT', 'VIP', 'URL');

-- CreateEnum
CREATE TYPE "EndpointScheme" AS ENUM ('TCP', 'HTTP', 'HTTPS', 'GRPC', 'JDBC', 'AMQP');

-- CreateEnum
CREATE TYPE "ConnectionProtocol" AS ENUM ('REST', 'SOAP', 'TCP', 'SFTP', 'GRPC', 'MQ', 'JDBC', 'OTHER');

-- CreateEnum
CREATE TYPE "ConnectorRunStatus" AS ENUM ('RUNNING', 'SUCCESS', 'PARTIAL_SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'MANUAL_OVERRIDE', 'CONFLICT_DETECTED');

-- CreateEnum
CREATE TYPE "ConflictResolution" AS ENUM ('KEEP_EXISTING', 'ACCEPT_INCOMING', 'MANUAL_MERGE');

-- CreateEnum
CREATE TYPE "CostPeriod" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "CostItemType" AS ENUM ('HOST', 'COMPONENT_LICENSE', 'SHARED_PLATFORM', 'OTHER');

-- CreateEnum
CREATE TYPE "CostUnit" AS ENUM ('PER_ENV', 'PER_HOST', 'PER_COMPONENT', 'PER_GB', 'PER_USER', 'OTHER');

-- CreateEnum
CREATE TYPE "AllocationMethod" AS ENUM ('DIRECT', 'SHARED_PRORATED');

-- CreateEnum
CREATE TYPE "StageKey" AS ENUM ('DEV', 'SIT', 'UAT', 'NFT', 'PREPROD', 'PROD_RO');

-- CreateEnum
CREATE TYPE "FlowTemplateStatus" AS ENUM ('DRAFT', 'ACTIVE', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "EnvironmentLinkType" AS ENUM ('PROMOTION', 'DATA_SYNC', 'REFERENCE');

-- CreateEnum
CREATE TYPE "BlueprintStatus" AS ENUM ('DRAFT', 'APPROVED', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "ReleaseStatus" AS ENUM ('PLANNING', 'IN_PROGRESS', 'READY', 'DEPLOYED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AlignmentStatus" AS ENUM ('ALIGNED', 'DRIFTED', 'PARTIAL', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ComparisonType" AS ENUM ('BLUEPRINT_VS_SNAPSHOT', 'SNAPSHOT_VS_RELEASE', 'CROSS_ENVIRONMENT', 'NONPROD_VS_PROD');

-- CreateEnum
CREATE TYPE "GovernanceRuleType" AS ENUM ('VERSION_CHECK', 'COMPONENT_PRESENCE', 'CONNECTION_REQUIRED', 'DATA_CLASSIFICATION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "GovernanceRuleSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'BLOCKER');

-- CreateEnum
CREATE TYPE "RACIRole" AS ENUM ('RESPONSIBLE', 'ACCOUNTABLE', 'CONSULTED', 'INFORMED');

-- CreateEnum
CREATE TYPE "PersonStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "AssetEntityType" AS ENUM ('ENVIRONMENT', 'COMPONENT', 'COMPONENT_INSTANCE', 'HOST', 'CONNECTION');

-- CreateEnum
CREATE TYPE "ConnectorStatus" AS ENUM ('ACTIVE', 'DISABLED', 'ERROR', 'PENDING_CONFIG');

-- CreateEnum
CREATE TYPE "ConnectorType" AS ENUM ('KUBERNETES', 'GITOPS', 'CMDB', 'APM', 'MANUAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "IntegrationRuleAction" AS ENUM ('MAP_FIELD', 'TRANSFORM', 'FILTER', 'MERGE', 'SKIP');

-- CreateEnum
CREATE TYPE "SettingScope" AS ENUM ('GLOBAL', 'ENVIRONMENT', 'STAGE', 'USER');

-- CreateEnum
CREATE TYPE "PolicyControlCategory" AS ENUM ('DATA_GOVERNANCE', 'VERSION_COMPLIANCE', 'TOPOLOGY_RULES', 'SECURITY', 'CHANGE_MANAGEMENT', 'OWNERSHIP', 'FRESHNESS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PolicyControlScope" AS ENUM ('GLOBAL', 'STAGE', 'ENVIRONMENT', 'COMPONENT');

-- CreateEnum
CREATE TYPE "ComplianceResultStatus" AS ENUM ('PASS', 'WARN', 'FAIL', 'NOT_APPLICABLE', 'PENDING');

-- CreateEnum
CREATE TYPE "ApprovalType" AS ENUM ('PROMOTION', 'EXCEPTION_REQUEST', 'DATA_ACCESS', 'CONFIGURATION_CHANGE', 'COUPLING_REVIEW', 'RELEASE_GATE');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExceptionStatus" AS ENUM ('REQUESTED', 'APPROVED', 'ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "CouplingStatus" AS ENUM ('UNREVIEWED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'MITIGATION_REQUIRED');

-- CreateEnum
CREATE TYPE "ManualNodeType" AS ENUM ('SERVER', 'DATABASE', 'API_SERVICE', 'QUEUE_EVENT_BUS', 'LOAD_BALANCER', 'CLOUD', 'STORAGE', 'EXTERNAL_SYSTEM', 'NOTE');

-- CreateEnum
CREATE TYPE "ManualEdgeType" AS ENUM ('API', 'EVENT', 'FILE', 'DB', 'MANUAL');

-- CreateEnum
CREATE TYPE "ManualNodeScope" AS ENUM ('GLOBAL', 'DEV', 'SIT', 'UAT', 'NFT', 'PREPROD');

-- CreateEnum
CREATE TYPE "DomainLane" AS ENUM ('CSS', 'BSS', 'OSS', 'NETWORK', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "FlowMapDomain" AS ENUM ('BSS', 'OSS', 'NETWORK', 'EXTERNAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EnvironmentType" ADD VALUE 'DEV';
ALTER TYPE "EnvironmentType" ADD VALUE 'PROD_RO';

-- AlterTable
ALTER TABLE "environments" ADD COLUMN     "entryComponentInstanceId" TEXT,
ADD COLUMN     "exitComponentInstanceId" TEXT,
ADD COLUMN     "stageId" TEXT;

-- AlterTable
ALTER TABLE "nodes" ADD COLUMN     "networkZoneId" TEXT,
ADD COLUMN     "telcoLayer" "TelcoLayer",
ADD COLUMN     "telcoSubsystem" "TelcoSubsystem";

-- AlterTable
ALTER TABLE "test_data_sets" ADD COLUMN     "approvalDate" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "complianceFlags" "ComplianceFlag"[],
ADD COLUMN     "dataClassification" "DataClassification",
ADD COLUMN     "derivedFromProdClone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maskingMethod" "MaskingMethod";

-- CreateTable
CREATE TABLE "network_zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "NetworkZoneType" NOT NULL,
    "description" TEXT,
    "vlanRange" TEXT,
    "cidrBlocks" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "network_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "network_zone_connections" (
    "id" TEXT NOT NULL,
    "sourceZoneId" TEXT NOT NULL,
    "targetZoneId" TEXT NOT NULL,
    "policy" "ConnectivityPolicy" NOT NULL,
    "bridgeMechanism" "BridgeMechanism",
    "bridgeNodeName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "network_zone_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "runtime_layers" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "virtualizationType" "VirtualizationType" NOT NULL,
    "runtimeName" TEXT,
    "runtimeVersion" TEXT,
    "orchestrator" TEXT,
    "clusterName" TEXT,
    "namespace" TEXT,
    "resourceLimits" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "runtime_layers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hosting_domains" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hostingType" "HostingType" NOT NULL,
    "cloudProvider" "CloudProvider",
    "region" TEXT,
    "accountId" TEXT,
    "dataCenter" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hosting_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "node_hosting_domains" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "hostingDomainId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "node_hosting_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environment_ownerships" (
    "id" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "projectCode" TEXT,
    "ownerTeam" TEXT NOT NULL,
    "ownerEmail" TEXT,
    "technicalLead" TEXT,
    "technicalLeadEmail" TEXT,
    "businessUnit" TEXT,
    "costCenter" TEXT,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "environment_ownerships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environment_activity_logs" (
    "id" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "action" "ActivityActionType" NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT,
    "targetType" TEXT,
    "targetId" TEXT,
    "targetName" TEXT,
    "details" JSONB,
    "checksum" TEXT NOT NULL,
    "previousLogId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "environment_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrichment_edits" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "previousValue" JSONB,
    "newValue" JSONB NOT NULL,
    "reason" TEXT,
    "editedBy" TEXT NOT NULL,
    "status" "EnrichmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "supersededById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrichment_edits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_audits" (
    "id" TEXT NOT NULL,
    "testDataSetId" TEXT NOT NULL,
    "complianceFlag" "ComplianceFlag" NOT NULL,
    "status" TEXT NOT NULL,
    "auditorId" TEXT,
    "auditorName" TEXT,
    "findings" TEXT,
    "evidence" JSONB,
    "auditDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextAuditDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_violations" (
    "id" TEXT NOT NULL,
    "environmentId" TEXT,
    "nodeId" TEXT,
    "edgeId" TEXT,
    "testDataSetId" TEXT,
    "policyName" TEXT NOT NULL,
    "policyRule" TEXT NOT NULL,
    "severity" "ViolationSeverity" NOT NULL,
    "status" "ViolationStatus" NOT NULL DEFAULT 'OPEN',
    "description" TEXT NOT NULL,
    "remediationHint" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolutionNotes" TEXT,
    "metadata" JSONB,

    CONSTRAINT "policy_violations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connector_credentials" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "connectorType" TEXT NOT NULL,
    "encryptedConfig" TEXT NOT NULL,
    "encryptionIv" TEXT NOT NULL,
    "lastTestedAt" TIMESTAMP(3),
    "lastTestSuccess" BOOLEAN,
    "lastRotatedAt" TIMESTAMP(3),
    "rotationReminder" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connector_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "network_contexts" (
    "id" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "hostingType" "HostingType" NOT NULL,
    "cloudProvider" "CloudProvider",
    "region" TEXT,
    "vpcVnet" TEXT,
    "subnetCidr" TEXT,
    "zoneLabel" TEXT,
    "hasLoadBalancer" BOOLEAN NOT NULL DEFAULT false,
    "loadBalancerRef" TEXT,
    "hasPrivateEndpoint" BOOLEAN NOT NULL DEFAULT false,
    "privateEndpointRef" TEXT,
    "notes" TEXT,
    "sourceSystem" TEXT,
    "sourceRecordId" TEXT,
    "ingestedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "network_contexts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hosts" (
    "id" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "networkContextId" TEXT,
    "hostname" TEXT NOT NULL,
    "ip" TEXT,
    "natIp" TEXT,
    "os" TEXT,
    "notes" TEXT,
    "sourceSystem" TEXT,
    "sourceRecordId" TEXT,
    "ingestedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "components" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ComponentCategory",
    "vendor" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "layer" "ArchitectureLayer" NOT NULL DEFAULT 'UNKNOWN',
    "capabilityType" "CapabilityType" NOT NULL DEFAULT 'UNKNOWN',
    "itOwnerId" TEXT,
    "productOwnerId" TEXT,
    "devOpsLeadId" TEXT,

    CONSTRAINT "components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "component_instances" (
    "id" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "hostId" TEXT,
    "componentId" TEXT NOT NULL,
    "displayName" TEXT,
    "notes" TEXT,
    "sourceSystem" TEXT,
    "sourceRecordId" TEXT,
    "ingestedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "component_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "endpoints" (
    "id" TEXT NOT NULL,
    "componentInstanceId" TEXT NOT NULL,
    "kind" "EndpointKind" NOT NULL,
    "value" TEXT NOT NULL,
    "port" INTEGER,
    "scheme" "EndpointScheme",
    "basePath" TEXT,
    "notes" TEXT,
    "sourceSystem" TEXT,
    "sourceRecordId" TEXT,
    "ingestedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deployed_versions" (
    "id" TEXT NOT NULL,
    "componentInstanceId" TEXT NOT NULL,
    "projectVersion" TEXT NOT NULL,
    "vendorVersion" TEXT,
    "buildRef" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceSystem" TEXT,
    "sourceRecordId" TEXT,
    "ingestedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deployed_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connections" (
    "id" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "fromComponentInstanceId" TEXT NOT NULL,
    "toComponentInstanceId" TEXT NOT NULL,
    "protocolType" "ConnectionProtocol" NOT NULL,
    "protocolDetail" TEXT,
    "port" INTEGER,
    "notes" TEXT,
    "sourceSystem" TEXT,
    "sourceRecordId" TEXT,
    "ingestedAt" TIMESTAMP(3),
    "origin" "ConnectionOrigin" NOT NULL DEFAULT 'INGESTED',
    "confidence" "ConnectionConfidence" NOT NULL DEFAULT 'HIGH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connector_runs" (
    "id" TEXT NOT NULL,
    "environmentId" TEXT,
    "connectorType" TEXT NOT NULL,
    "status" "ConnectorRunStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "summaryJson" JSONB,
    "errorMessage" TEXT,

    CONSTRAINT "connector_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "field" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "action" "AuditAction" NOT NULL,
    "editedBy" TEXT,
    "editedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environment_diagrams" (
    "id" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "nodesJson" JSONB NOT NULL,
    "edgesJson" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "environment_diagrams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingestion_conflicts" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "existingValue" TEXT,
    "incomingValue" TEXT NOT NULL,
    "wasManuallyEdited" BOOLEAN NOT NULL DEFAULT false,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolution" "ConflictResolution",
    "connectorRunId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingestion_conflicts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "period" "CostPeriod" NOT NULL DEFAULT 'MONTHLY',
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_items" (
    "id" TEXT NOT NULL,
    "costModelId" TEXT NOT NULL,
    "itemType" "CostItemType" NOT NULL,
    "name" TEXT NOT NULL,
    "unitCost" DECIMAL(12,2) NOT NULL,
    "unit" "CostUnit" NOT NULL,
    "defaultQuantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "allocationMethod" "AllocationMethod" NOT NULL DEFAULT 'DIRECT',
    "tagsJson" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environment_cost_overrides" (
    "id" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "fixedMonthlyCost" DECIMAL(12,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "editedBy" TEXT,
    "editedAt" TIMESTAMP(3),

    CONSTRAINT "environment_cost_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environment_cost_allocations" (
    "id" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "costModelId" TEXT NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "totalCost" DECIMAL(12,2) NOT NULL,
    "breakdownJson" JSONB NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "environment_cost_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_simulations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "baseCostModelId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paramsJson" JSONB NOT NULL,
    "resultJson" JSONB NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_simulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stages" (
    "id" TEXT NOT NULL,
    "key" "StageKey" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environment_links" (
    "id" TEXT NOT NULL,
    "upstreamEnvironmentId" TEXT NOT NULL,
    "downstreamEnvironmentId" TEXT NOT NULL,
    "linkType" "EnvironmentLinkType" NOT NULL DEFAULT 'PROMOTION',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "environment_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flow_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "FlowTemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flow_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flow_template_stages" (
    "id" TEXT NOT NULL,
    "flowTemplateId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flow_template_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blueprints" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "BlueprintStatus" NOT NULL DEFAULT 'DRAFT',
    "targetStageId" TEXT,
    "specJson" JSONB NOT NULL,
    "createdBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blueprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "releases" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "status" "ReleaseStatus" NOT NULL DEFAULT 'PLANNING',
    "targetDate" TIMESTAMP(3),
    "deployedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "release_items" (
    "id" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,
    "blueprintId" TEXT,
    "componentId" TEXT,
    "targetVersion" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "release_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "governance_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ruleType" "GovernanceRuleType" NOT NULL,
    "severity" "GovernanceRuleSeverity" NOT NULL DEFAULT 'WARNING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "configJson" JSONB NOT NULL,
    "targetStages" "StageKey"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "governance_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_evaluations" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "snapshotId" TEXT,
    "passed" BOOLEAN NOT NULL,
    "severity" "GovernanceRuleSeverity" NOT NULL,
    "message" TEXT,
    "detailsJson" JSONB,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rule_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alignment_comparisons" (
    "id" TEXT NOT NULL,
    "comparisonType" "ComparisonType" NOT NULL,
    "environmentId" TEXT,
    "snapshotId" TEXT,
    "blueprintId" TEXT,
    "releaseId" TEXT,
    "targetEnvironmentId" TEXT,
    "status" "AlignmentStatus" NOT NULL,
    "alignedCount" INTEGER NOT NULL DEFAULT 0,
    "driftedCount" INTEGER NOT NULL DEFAULT 0,
    "missingCount" INTEGER NOT NULL DEFAULT 0,
    "extraCount" INTEGER NOT NULL DEFAULT 0,
    "detailsJson" JSONB,
    "comparedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alignment_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "people" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "department" TEXT,
    "team" TEXT,
    "role" TEXT,
    "phone" TEXT,
    "status" "PersonStatus" NOT NULL DEFAULT 'ACTIVE',
    "externalId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raci_mappings" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "entityType" "AssetEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "raciRole" "RACIRole" NOT NULL,
    "notes" TEXT,
    "assignedBy" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raci_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orphaned_assets" (
    "id" TEXT NOT NULL,
    "entityType" "AssetEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "notes" TEXT,

    CONSTRAINT "orphaned_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connectors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "connectorType" "ConnectorType" NOT NULL,
    "description" TEXT,
    "status" "ConnectorStatus" NOT NULL DEFAULT 'PENDING_CONFIG',
    "credentialId" TEXT,
    "configJson" JSONB,
    "scheduleJson" JSONB,
    "lastRunAt" TIMESTAMP(3),
    "lastRunStatus" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_rules" (
    "id" TEXT NOT NULL,
    "connectorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "action" "IntegrationRuleAction" NOT NULL,
    "sourceField" TEXT NOT NULL,
    "targetField" TEXT,
    "transformExpr" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "valueType" TEXT NOT NULL DEFAULT 'string',
    "scope" "SettingScope" NOT NULL DEFAULT 'GLOBAL',
    "scopeId" TEXT,
    "description" TEXT,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_controls" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "PolicyControlCategory" NOT NULL,
    "scope" "PolicyControlScope" NOT NULL DEFAULT 'GLOBAL',
    "scopeId" TEXT,
    "severity" "GovernanceRuleSeverity" NOT NULL DEFAULT 'WARNING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "configJson" JSONB NOT NULL,
    "evaluatorType" TEXT NOT NULL,
    "remediation" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policy_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_results" (
    "id" TEXT NOT NULL,
    "policyControlId" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "snapshotId" TEXT,
    "status" "ComplianceResultStatus" NOT NULL,
    "score" INTEGER,
    "message" TEXT,
    "detailsJson" JSONB,
    "evidenceJson" JSONB,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evaluatedBy" TEXT,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "compliance_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_items" (
    "id" TEXT NOT NULL,
    "approvalType" "ApprovalType" NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "requesterId" TEXT,
    "requesterName" TEXT,
    "requesterEmail" TEXT,
    "assigneeId" TEXT,
    "assigneeName" TEXT,
    "assigneeEmail" TEXT,
    "environmentId" TEXT,
    "componentId" TEXT,
    "releaseId" TEXT,
    "contextJson" JSONB,
    "decisionReason" TEXT,
    "decisionBy" TEXT,
    "decisionAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exception_items" (
    "id" TEXT NOT NULL,
    "policyControlId" TEXT NOT NULL,
    "environmentId" TEXT,
    "componentId" TEXT,
    "status" "ExceptionStatus" NOT NULL DEFAULT 'REQUESTED',
    "reason" TEXT NOT NULL,
    "justification" TEXT,
    "riskAssessment" TEXT,
    "mitigationPlan" TEXT,
    "requestedBy" TEXT,
    "requestedByName" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedByName" TEXT,
    "approvedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedBy" TEXT,
    "revokedAt" TIMESTAMP(3),
    "revocationReason" TEXT,
    "reviewReminder" TIMESTAMP(3),
    "attachmentsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exception_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupling_links" (
    "id" TEXT NOT NULL,
    "sourceEnvironmentId" TEXT NOT NULL,
    "targetEnvironmentId" TEXT NOT NULL,
    "sourceProjectName" TEXT,
    "targetProjectName" TEXT,
    "couplingType" TEXT NOT NULL,
    "status" "CouplingStatus" NOT NULL DEFAULT 'UNREVIEWED',
    "riskLevel" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detectedBy" TEXT,
    "evidenceJson" JSONB,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "mitigationRequired" BOOLEAN NOT NULL DEFAULT false,
    "mitigationPlan" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupling_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flow_map_layouts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'default',
    "nodesJson" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "environmentId" TEXT,

    CONSTRAINT "flow_map_layouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manual_flow_map_nodes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nodeType" "ManualNodeType" NOT NULL,
    "domain" "FlowMapDomain",
    "description" TEXT,
    "scope" "ManualNodeScope" NOT NULL DEFAULT 'GLOBAL',
    "positionX" DOUBLE PRECISION NOT NULL,
    "positionY" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "domainLane" "DomainLane",
    "environmentId" TEXT,

    CONSTRAINT "manual_flow_map_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manual_flow_map_edges" (
    "id" TEXT NOT NULL,
    "sourceNodeId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "edgeType" "ManualEdgeType" NOT NULL,
    "label" TEXT,
    "metadata" JSONB,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "environmentId" TEXT,

    CONSTRAINT "manual_flow_map_edges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "network_zones_name_key" ON "network_zones"("name");

-- CreateIndex
CREATE UNIQUE INDEX "network_zone_connections_sourceZoneId_targetZoneId_key" ON "network_zone_connections"("sourceZoneId", "targetZoneId");

-- CreateIndex
CREATE UNIQUE INDEX "runtime_layers_nodeId_key" ON "runtime_layers"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "hosting_domains_name_key" ON "hosting_domains"("name");

-- CreateIndex
CREATE UNIQUE INDEX "node_hosting_domains_nodeId_hostingDomainId_key" ON "node_hosting_domains"("nodeId", "hostingDomainId");

-- CreateIndex
CREATE UNIQUE INDEX "environment_ownerships_environmentId_key" ON "environment_ownerships"("environmentId");

-- CreateIndex
CREATE INDEX "environment_activity_logs_environmentId_createdAt_idx" ON "environment_activity_logs"("environmentId", "createdAt");

-- CreateIndex
CREATE INDEX "enrichment_edits_nodeId_fieldName_idx" ON "enrichment_edits"("nodeId", "fieldName");

-- CreateIndex
CREATE INDEX "policy_violations_status_severity_idx" ON "policy_violations"("status", "severity");

-- CreateIndex
CREATE UNIQUE INDEX "connector_credentials_name_key" ON "connector_credentials"("name");

-- CreateIndex
CREATE UNIQUE INDEX "hosts_environmentId_hostname_key" ON "hosts"("environmentId", "hostname");

-- CreateIndex
CREATE UNIQUE INDEX "components_name_key" ON "components"("name");

-- CreateIndex
CREATE INDEX "connector_runs_environmentId_startedAt_idx" ON "connector_runs"("environmentId", "startedAt");

-- CreateIndex
CREATE INDEX "audit_events_entityType_entityId_idx" ON "audit_events"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "environment_diagrams_environmentId_key" ON "environment_diagrams"("environmentId");

-- CreateIndex
CREATE INDEX "ingestion_conflicts_resolved_entityType_idx" ON "ingestion_conflicts"("resolved", "entityType");

-- CreateIndex
CREATE UNIQUE INDEX "cost_models_name_key" ON "cost_models"("name");

-- CreateIndex
CREATE UNIQUE INDEX "environment_cost_overrides_environmentId_key" ON "environment_cost_overrides"("environmentId");

-- CreateIndex
CREATE UNIQUE INDEX "environment_cost_allocations_environmentId_costModelId_peri_key" ON "environment_cost_allocations"("environmentId", "costModelId", "periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "stages_key_key" ON "stages"("key");

-- CreateIndex
CREATE UNIQUE INDEX "environment_links_upstreamEnvironmentId_downstreamEnvironme_key" ON "environment_links"("upstreamEnvironmentId", "downstreamEnvironmentId");

-- CreateIndex
CREATE UNIQUE INDEX "flow_templates_name_key" ON "flow_templates"("name");

-- CreateIndex
CREATE UNIQUE INDEX "flow_template_stages_flowTemplateId_stageId_key" ON "flow_template_stages"("flowTemplateId", "stageId");

-- CreateIndex
CREATE UNIQUE INDEX "blueprints_name_key" ON "blueprints"("name");

-- CreateIndex
CREATE UNIQUE INDEX "releases_name_version_key" ON "releases"("name", "version");

-- CreateIndex
CREATE UNIQUE INDEX "governance_rules_name_key" ON "governance_rules"("name");

-- CreateIndex
CREATE INDEX "rule_evaluations_environmentId_evaluatedAt_idx" ON "rule_evaluations"("environmentId", "evaluatedAt");

-- CreateIndex
CREATE INDEX "alignment_comparisons_environmentId_comparisonType_idx" ON "alignment_comparisons"("environmentId", "comparisonType");

-- CreateIndex
CREATE UNIQUE INDEX "people_email_key" ON "people"("email");

-- CreateIndex
CREATE INDEX "raci_mappings_entityType_entityId_idx" ON "raci_mappings"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "raci_mappings_personId_entityType_entityId_raciRole_key" ON "raci_mappings"("personId", "entityType", "entityId", "raciRole");

-- CreateIndex
CREATE INDEX "orphaned_assets_entityType_idx" ON "orphaned_assets"("entityType");

-- CreateIndex
CREATE UNIQUE INDEX "orphaned_assets_entityType_entityId_key" ON "orphaned_assets"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "connectors_name_key" ON "connectors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "platform_settings_key_scope_scopeId_key" ON "platform_settings"("key", "scope", "scopeId");

-- CreateIndex
CREATE UNIQUE INDEX "policy_controls_name_key" ON "policy_controls"("name");

-- CreateIndex
CREATE INDEX "policy_controls_category_isActive_idx" ON "policy_controls"("category", "isActive");

-- CreateIndex
CREATE INDEX "compliance_results_environmentId_evaluatedAt_idx" ON "compliance_results"("environmentId", "evaluatedAt");

-- CreateIndex
CREATE INDEX "compliance_results_policyControlId_environmentId_idx" ON "compliance_results"("policyControlId", "environmentId");

-- CreateIndex
CREATE INDEX "approval_items_status_assigneeId_idx" ON "approval_items"("status", "assigneeId");

-- CreateIndex
CREATE INDEX "approval_items_environmentId_status_idx" ON "approval_items"("environmentId", "status");

-- CreateIndex
CREATE INDEX "exception_items_status_expiresAt_idx" ON "exception_items"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "exception_items_environmentId_status_idx" ON "exception_items"("environmentId", "status");

-- CreateIndex
CREATE INDEX "coupling_links_status_riskLevel_idx" ON "coupling_links"("status", "riskLevel");

-- CreateIndex
CREATE UNIQUE INDEX "coupling_links_sourceEnvironmentId_targetEnvironmentId_coup_key" ON "coupling_links"("sourceEnvironmentId", "targetEnvironmentId", "couplingType");

-- CreateIndex
CREATE INDEX "flow_map_layouts_environmentId_idx" ON "flow_map_layouts"("environmentId");

-- CreateIndex
CREATE INDEX "manual_flow_map_nodes_environmentId_idx" ON "manual_flow_map_nodes"("environmentId");

-- CreateIndex
CREATE INDEX "manual_flow_map_edges_environmentId_idx" ON "manual_flow_map_edges"("environmentId");

-- CreateIndex
CREATE UNIQUE INDEX "manual_flow_map_edges_sourceNodeId_targetNodeId_key" ON "manual_flow_map_edges"("sourceNodeId", "targetNodeId");

-- AddForeignKey
ALTER TABLE "environments" ADD CONSTRAINT "environments_entryComponentInstanceId_fkey" FOREIGN KEY ("entryComponentInstanceId") REFERENCES "component_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environments" ADD CONSTRAINT "environments_exitComponentInstanceId_fkey" FOREIGN KEY ("exitComponentInstanceId") REFERENCES "component_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environments" ADD CONSTRAINT "environments_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_networkZoneId_fkey" FOREIGN KEY ("networkZoneId") REFERENCES "network_zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "network_zone_connections" ADD CONSTRAINT "network_zone_connections_sourceZoneId_fkey" FOREIGN KEY ("sourceZoneId") REFERENCES "network_zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "network_zone_connections" ADD CONSTRAINT "network_zone_connections_targetZoneId_fkey" FOREIGN KEY ("targetZoneId") REFERENCES "network_zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "runtime_layers" ADD CONSTRAINT "runtime_layers_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_hosting_domains" ADD CONSTRAINT "node_hosting_domains_hostingDomainId_fkey" FOREIGN KEY ("hostingDomainId") REFERENCES "hosting_domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_hosting_domains" ADD CONSTRAINT "node_hosting_domains_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environment_ownerships" ADD CONSTRAINT "environment_ownerships_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environment_activity_logs" ADD CONSTRAINT "environment_activity_logs_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrichment_edits" ADD CONSTRAINT "enrichment_edits_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_audits" ADD CONSTRAINT "compliance_audits_testDataSetId_fkey" FOREIGN KEY ("testDataSetId") REFERENCES "test_data_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "network_contexts" ADD CONSTRAINT "network_contexts_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hosts" ADD CONSTRAINT "hosts_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hosts" ADD CONSTRAINT "hosts_networkContextId_fkey" FOREIGN KEY ("networkContextId") REFERENCES "network_contexts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "components" ADD CONSTRAINT "components_itOwnerId_fkey" FOREIGN KEY ("itOwnerId") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "components" ADD CONSTRAINT "components_productOwnerId_fkey" FOREIGN KEY ("productOwnerId") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "components" ADD CONSTRAINT "components_devOpsLeadId_fkey" FOREIGN KEY ("devOpsLeadId") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "component_instances" ADD CONSTRAINT "component_instances_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "components"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "component_instances" ADD CONSTRAINT "component_instances_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "component_instances" ADD CONSTRAINT "component_instances_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "hosts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "endpoints" ADD CONSTRAINT "endpoints_componentInstanceId_fkey" FOREIGN KEY ("componentInstanceId") REFERENCES "component_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployed_versions" ADD CONSTRAINT "deployed_versions_componentInstanceId_fkey" FOREIGN KEY ("componentInstanceId") REFERENCES "component_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_fromComponentInstanceId_fkey" FOREIGN KEY ("fromComponentInstanceId") REFERENCES "component_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_toComponentInstanceId_fkey" FOREIGN KEY ("toComponentInstanceId") REFERENCES "component_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connector_runs" ADD CONSTRAINT "connector_runs_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "environments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environment_diagrams" ADD CONSTRAINT "environment_diagrams_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_items" ADD CONSTRAINT "cost_items_costModelId_fkey" FOREIGN KEY ("costModelId") REFERENCES "cost_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environment_cost_overrides" ADD CONSTRAINT "environment_cost_overrides_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environment_cost_allocations" ADD CONSTRAINT "environment_cost_allocations_costModelId_fkey" FOREIGN KEY ("costModelId") REFERENCES "cost_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environment_cost_allocations" ADD CONSTRAINT "environment_cost_allocations_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_simulations" ADD CONSTRAINT "cost_simulations_baseCostModelId_fkey" FOREIGN KEY ("baseCostModelId") REFERENCES "cost_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environment_links" ADD CONSTRAINT "environment_links_downstreamEnvironmentId_fkey" FOREIGN KEY ("downstreamEnvironmentId") REFERENCES "environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environment_links" ADD CONSTRAINT "environment_links_upstreamEnvironmentId_fkey" FOREIGN KEY ("upstreamEnvironmentId") REFERENCES "environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_template_stages" ADD CONSTRAINT "flow_template_stages_flowTemplateId_fkey" FOREIGN KEY ("flowTemplateId") REFERENCES "flow_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_template_stages" ADD CONSTRAINT "flow_template_stages_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_items" ADD CONSTRAINT "release_items_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "blueprints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_items" ADD CONSTRAINT "release_items_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "components"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_items" ADD CONSTRAINT "release_items_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "releases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_evaluations" ADD CONSTRAINT "rule_evaluations_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_evaluations" ADD CONSTRAINT "rule_evaluations_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "governance_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_evaluations" ADD CONSTRAINT "rule_evaluations_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "environment_snapshots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alignment_comparisons" ADD CONSTRAINT "alignment_comparisons_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "blueprints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alignment_comparisons" ADD CONSTRAINT "alignment_comparisons_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alignment_comparisons" ADD CONSTRAINT "alignment_comparisons_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "releases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alignment_comparisons" ADD CONSTRAINT "alignment_comparisons_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "environment_snapshots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raci_mappings" ADD CONSTRAINT "raci_environment" FOREIGN KEY ("entityId") REFERENCES "environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raci_mappings" ADD CONSTRAINT "raci_mappings_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_rules" ADD CONSTRAINT "integration_rules_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "connectors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_results" ADD CONSTRAINT "compliance_results_policyControlId_fkey" FOREIGN KEY ("policyControlId") REFERENCES "policy_controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exception_items" ADD CONSTRAINT "exception_items_policyControlId_fkey" FOREIGN KEY ("policyControlId") REFERENCES "policy_controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_map_layouts" ADD CONSTRAINT "flow_map_layouts_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_flow_map_nodes" ADD CONSTRAINT "manual_flow_map_nodes_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_flow_map_edges" ADD CONSTRAINT "manual_flow_map_edges_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_flow_map_edges" ADD CONSTRAINT "manual_flow_map_edges_sourceNodeId_fkey" FOREIGN KEY ("sourceNodeId") REFERENCES "manual_flow_map_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_flow_map_edges" ADD CONSTRAINT "manual_flow_map_edges_targetNodeId_fkey" FOREIGN KEY ("targetNodeId") REFERENCES "manual_flow_map_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

