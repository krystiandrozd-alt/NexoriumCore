# Source Ingestion Strategy

## Overview

TelEnvIQ uses a **connector-based ingestion architecture** to populate its canonical data model. This document outlines what sources are supported for MVP, what is explicitly out of scope, and how the system avoids source-specific customization.

## Canonical Data Model (5-Layer Model)

All connectors ingest data into these canonical entities:

| Layer | Entity | Description |
|-------|--------|-------------|
| L1 | **NetworkContext** | Hosting/network layer (cloud/on-prem, VPC/VNet, subnet, LB, private endpoints) |
| L2 | **Host** | Server/VM level (hostname, IP, NAT IP, OS) |
| L3a | **Component** | Catalog of component types (e.g., "Cisco NSO", "Oracle Database") |
| L3b | **ComponentInstance** | Instance of a component running on a host |
| L3c | **Endpoint** | Exposed ports/URLs for component instances |
| L4 | **DeployedVersion** | Project version (REQUIRED), vendor version, build ref |
| L5 | **Connection** | Component-to-component edges with protocol labels |

## In-Scope Sources for MVP

### 1. Mock Connector (Required)
- **Purpose**: Generate realistic telco test data for demos and development
- **Data produced**: Full topology including network contexts, hosts, components, versions, and connections
- **Configuration**: Component count size (small/medium/large), drift simulation

### 2. Config Repository Connector (Required)
- **Purpose**: Read YAML/JSON topology manifests from a configured folder
- **Data extracted**:
  - Component instances and their hosts
  - Endpoints/ports
  - Project version and build refs
  - Connection definitions
- **Configuration**: `manifestPath` (file or directory)

### 3. Cloud Control Plane Connectors (Required - using fixtures)

#### AWS Adapter
- **Data extracted**:
  - VPCs → NetworkContext
  - EC2 instances → Host
  - Load balancers → NetworkContext.loadBalancerRef
  - VPC endpoints → NetworkContext.privateEndpointRef
- **MVP Implementation**: Reads from fixture JSON files (no real AWS API calls)

#### Azure Adapter
- **Data extracted**:
  - Virtual Networks → NetworkContext
  - Virtual Machines → Host
  - Load Balancers
  - Private Endpoints
- **MVP Implementation**: Reads from fixture JSON files

#### GCP Adapter
- **Data extracted**:
  - VPC Networks → NetworkContext
  - Compute Instances → Host
  - Forwarding Rules (load balancers)
- **MVP Implementation**: Reads from fixture JSON files

### 4. Terraform State Connector (Preferred)
- **Purpose**: Read terraform state JSON to extract infrastructure
- **Data extracted**:
  - `aws_vpc` / `azurerm_virtual_network` / `google_compute_network` → NetworkContext
  - `aws_instance` / `azurerm_*_virtual_machine` / `google_compute_instance` → Host
  - `aws_lb` / `aws_alb` → LoadBalancer references
  - `aws_db_instance` → Host (for database servers)
- **Configuration**: `statePath` pointing to terraform.tfstate

### 5. CSV Import (Fallback)
- **Purpose**: Simple spreadsheet-based import for manual data entry
- **Supported files**:
  - `hosts.csv`: hostname, ip, nat_ip, os, notes
  - `components.csv`: name, category, vendor, description
  - `instances.csv`: display_name, component_name, host_ref, notes
  - `endpoints.csv`: instance_ref, kind, value, port, scheme, base_path
  - `versions.csv`: instance_ref, project_version, vendor_version, build_ref
  - `connections.csv`: from_ref, to_ref, protocol, detail, port

## Explicitly Out of Scope

### NOT Supported in MVP

| Category | Examples | Why Out of Scope |
|----------|----------|------------------|
| ITSM/CMDB | ServiceNow CIs, BMC CMDB | Requires complex integration, different data model |
| CI Relationship Graphs | CMDB relationship types, dependency chains | Beyond topology modeling |
| NSO Intent/Service State | NSO services, devices, intent data | Deep vendor-specific modeling |
| Agent-Based Discovery | Running agents on hosts | Architecture principle violation |
| Real-Time Monitoring | Metrics, traces, logs | Observability platform territory |
| Deployment Orchestration | Terraform apply, Ansible runs | Deployment tool territory |
| Kubernetes Auto-Discovery | K8s API live queries | Requires cluster access, complex RBAC |
| GitOps Live Sync | ArgoCD, Flux webhooks | Beyond MVP scope |

### NOT Calling Real Cloud APIs
For MVP, cloud connectors read from **fixture files** stored in `/fixtures/cloud/`. This:
- Avoids credential management complexity
- Enables testing without cloud access
- Demonstrates the data model without infrastructure dependencies

## Avoiding Customization

### Config-Driven Mapping Templates

Each connector uses standardized mapping rules to transform source data into canonical entities:

```typescript
// Example: AWS instance to Host mapping
{
  hostname: instance.tags.Name || instance.instanceId,
  ip: instance.privateIpAddress,
  natIp: instance.publicIpAddress,
  os: instance.platform || 'Linux',
  networkContextRef: instance.vpcId,
}
```

### Canonical Model Normalization Rules

1. **All entities require provenance**:
   - `sourceSystem`: Which connector created/updated
   - `sourceRecordId`: External ID from source system
   - `ingestedAt`: When data was ingested

2. **Protocol normalization**:
   - REST, SOAP, TCP, SFTP, GRPC, MQ, JDBC, OTHER
   - Connectors map source-specific protocols to these standard types

3. **Endpoint scheme normalization**:
   - TCP, HTTP, HTTPS, GRPC, JDBC, AMQP

4. **Component categories**:
   - BSS, OSS, DATABASE, MESSAGING, INTEGRATION, SECURITY, MONITORING, OTHER

### Limited Connector Types

The connector framework supports exactly **7 connector types**:
1. Mock
2. Config Repository
3. Cloud-AWS
4. Cloud-Azure
5. Cloud-GCP
6. Terraform
7. CSV

No custom connectors are added without schema/architecture review.

## Fixture-Based Testing

All connectors can be tested using fixture files:

```
/fixtures
├── cloud/
│   ├── aws/sit-environment.json
│   ├── azure/sit-environment.json
│   └── gcp/sit-environment.json
├── config-repo/
│   └── sit-topology.yaml
└── terraform/
    └── sit-state.json
```

## Manual Enrichment

While connectors provide the source of truth for ingested data, users can:

1. **Override field values** - Manual edits are tracked in `AuditEvent`
2. **Add annotations** - Notes fields on all entities
3. **Curate diagram layouts** - Node positions saved in `EnvironmentDiagram`

### Conflict Handling

When a connector attempts to update a manually-edited field:
1. Conflict is detected
2. `IngestionConflict` record created
3. UI surfaces conflicts for resolution
4. User chooses: keep existing, accept incoming, or manual merge

## Connector Run Lifecycle

```
1. fetch()    → Retrieve raw source payload
2. map()      → Transform to canonical entities
3. upsert()   → Persist with conflict detection
4. report()   → Return ingestion summary

All runs tracked in `ConnectorRun` table with:
- Status (RUNNING, SUCCESS, PARTIAL_SUCCESS, FAILED)
- Summary JSON (counts, warnings, errors)
- Start/finish timestamps
```

## Future Considerations (Post-MVP)

1. **Kubernetes Connector**: Live K8s API discovery with service account auth
2. **GitOps Connector**: Poll git repositories for topology changes
3. **Webhook Receivers**: Accept push notifications from CI/CD pipelines
4. **Scheduled Runs**: Cron-based connector execution
5. **Snapshot Diffing**: Compare ingestion runs to detect drift
