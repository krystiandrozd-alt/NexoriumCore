-- CreateEnum
CREATE TYPE "EnvironmentType" AS ENUM ('SIT', 'UAT', 'NFT', 'PREPROD');

-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('APPLICATION', 'SERVICE', 'DATABASE', 'GATEWAY', 'EXTERNAL', 'RUNTIME', 'MESSAGE_QUEUE', 'LOAD_BALANCER');

-- CreateEnum
CREATE TYPE "Criticality" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "Protocol" AS ENUM ('REST', 'GRPC', 'MQ', 'JDBC', 'SFTP', 'EVENT', 'WEBSOCKET', 'SOAP', 'GRAPHQL');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('PROD_CLONE', 'MASKED', 'SYNTHETIC', 'STATIC');

-- CreateEnum
CREATE TYPE "RefreshMethod" AS ENUM ('MANUAL', 'PIPELINE', 'SCRIPT', 'AUTOMATED');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('NODE', 'EDGE', 'DATABASE', 'TESTDATA');

-- CreateTable
CREATE TABLE "environments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "EnvironmentType" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "environments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nodes" (
    "id" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "type" "NodeType" NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT,
    "criticality" "Criticality" NOT NULL DEFAULT 'MEDIUM',
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edges" (
    "id" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "sourceNodeId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "protocol" "Protocol" NOT NULL,
    "port" INTEGER,
    "pathOrTopic" TEXT,
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "lastObservedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "edges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "database_metadata" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "engine" TEXT NOT NULL,
    "version" TEXT,
    "sizeGB" DOUBLE PRECISION,
    "host" TEXT,
    "port" INTEGER,

    CONSTRAINT "database_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_data_sets" (
    "id" TEXT NOT NULL,
    "databaseId" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "lastRefreshDate" TIMESTAMP(3),
    "refreshMethod" "RefreshMethod" NOT NULL DEFAULT 'MANUAL',
    "maskingPolicyVersion" TEXT,
    "changeReference" TEXT,
    "owner" TEXT,
    "downstreamConsumers" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_data_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_records" (
    "id" TEXT NOT NULL,
    "testDataSetId" TEXT NOT NULL,
    "refreshDate" TIMESTAMP(3) NOT NULL,
    "refreshedBy" TEXT,
    "method" "RefreshMethod" NOT NULL,
    "notes" TEXT,
    "changeReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence" (
    "id" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "payload" JSONB NOT NULL,

    CONSTRAINT "evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environment_snapshots" (
    "id" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "snapshotHash" TEXT NOT NULL,
    "snapshotData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "environment_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "database_metadata_nodeId_key" ON "database_metadata"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "test_data_sets_databaseId_key" ON "test_data_sets"("databaseId");

-- CreateIndex
CREATE INDEX "evidence_entityType_entityId_idx" ON "evidence"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edges" ADD CONSTRAINT "edges_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edges" ADD CONSTRAINT "edges_sourceNodeId_fkey" FOREIGN KEY ("sourceNodeId") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edges" ADD CONSTRAINT "edges_targetNodeId_fkey" FOREIGN KEY ("targetNodeId") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "database_metadata" ADD CONSTRAINT "database_metadata_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_data_sets" ADD CONSTRAINT "test_data_sets_databaseId_fkey" FOREIGN KEY ("databaseId") REFERENCES "database_metadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_records" ADD CONSTRAINT "refresh_records_testDataSetId_fkey" FOREIGN KEY ("testDataSetId") REFERENCES "test_data_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environment_snapshots" ADD CONSTRAINT "environment_snapshots_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
