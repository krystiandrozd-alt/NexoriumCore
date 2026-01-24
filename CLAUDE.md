# CLAUDE.md — TelEnv IQ (MVP)

<project_context>
TelEnv IQ is a non-production environment intelligence platform for telco/IT landscapes. 
It models BSS/OSS systems, interfaces, network attributes, and test data usage using API-based connectors and snapshot versioning. 
It does NOT perform deployment, monitoring, or production control.
</project_context>


<architecture_principles>
1. API-connector-based ingestion only (NO agents).
2. Canonical internal data model is the single source of truth.
3. All ingested data must store provenance metadata.
4. Every ingestion run can create a version snapshot.
5. Production environments are strictly read-only.
6. Manual enrichment is allowed but must be audit-trailed.
7. MVP scope is strict — no CI/CD, no infra orchestration, no observability platform logic.
</architecture_principles>


<project_structure>
/apps
  /web                → Next.js frontend
  /api                → Backend (REST API)

/packages
  /core-model         → Canonical domain entities and validation
  /connectors         → Connector framework + implementations
  /diff-engine        → Snapshot comparison logic
  /auth               → RBAC and auth utilities

/db
  schema.sql or prisma schema
  migrations/

/scripts
  seed.ts             → Seed mock telco data
  run-connector.ts    → Manual connector trigger

/docs
  api-spec.md
</project_structure>


<data_model_rules>

Core Entities:
- Environment
- Component
- Deployment (component within environment)
- Endpoint (hostname/IP/NAT/VIP)
- Interface (directional, protocol-aware)
- NetworkContext (subnet/zone/LB/firewall)
- Snapshot
- TestDataSet
- TestDataVersion
- TestDataUsage

Mandatory Rules:
- All entities must include:
  id (UUID)
  created_at
  updated_at
- Ingested fields must store:
  source_system
  source_record_id
  ingested_at
- Manual edits must store:
  edited_by
  edited_at
  previous_value
- Interfaces must always specify:
  protocol_type
  protocol_detail
  direction
</data_model_rules>


<connector_framework>

Each connector must implement:

- fetch(): retrieve raw source payload
- map(): transform payload into canonical entities
- upsert(): persist normalized entities
- snapshot(): create environment snapshot
- report(): return ingestion summary

Connector types in MVP:
- MockConnector (required)
- GenericRESTConnector
- CSVImporter

Connector Design Rules:
- Must be idempotent.
- Must never delete production data.
- Must log warnings instead of crashing on partial failures.
</connector_framework>


<snapshot_and_diff>

Snapshots:
- Automatically created after successful ingestion run.
- Can be manually triggered.
- Immutable once created.

Diff Engine:
- Compare any two snapshots.
- Detect:
  - Added/removed components
  - Added/removed interfaces
  - Endpoint changes
  - Field-level modifications
- Diff must be deterministic.

Never compute diffs against live tables directly.
Always compare snapshot-to-snapshot.
</snapshot_and_diff>


<ui_requirements>

Minimum UI pages:
1. Environments Overview
2. Environment Graph View
3. Component Detail
4. Interface Detail
5. Snapshots & Diff
6. Test Data Registry
7. Connector Run History

Graph rendering must:
- Support filtering by domain and protocol.
- Avoid auto-layout recalculation on every render.
</ui_requirements>


<standards_and_conventions>

Backend:
- TypeScript only.
- Strict typing enabled.
- DTO validation via Zod or class-validator.

Frontend:
- No business logic in components.
- Use typed API client.
- Avoid duplicated state.

Database:
- Use UUIDs.
- Never store denormalized JSON blobs for core entities.
- Use migrations for schema changes.

Branch naming:
- feat/<short-description>
- fix/<short-description>
- refactor/<short-description>

PR rules:
- Must pass lint + typecheck.
- Must include migration if schema changes.
</standards_and_conventions>


<common_commands>

Install:
  npm install

Run dev:
  npm run dev

Build:
  npm run build

Run migrations:
  npm run db:migrate

Seed mock data:
  npm run seed

Run mock connector:
  npm run connector:mock

Run tests:
  npm run test

Lint:
  npm run lint

Typecheck:
  npm run typecheck
</common_commands>


<critical_notes>

1. TelEnv IQ is NOT:
   - A CMDB replacement.
   - A monitoring system.
   - A deployment tool.
   - A production control system.

2. Production environments must always:
   - Be marked as PROD_RO.
   - Be locked against write operations.

3. Avoid scope creep:
   - No Kubernetes auto-discovery.
   - No Terraform execution.
   - No firewall rule automation.
   - No test execution orchestration.

4. All topology relationships must be explicit.
   Never infer relationships silently.

5. Keep the file under 300 lines.
</critical_notes>


<examples>

Example Interface:

{
  "from": "CPQ-SIT",
  "to": "COM-SIT",
  "protocol_type": "TMF",
  "protocol_detail": "TMF622",
  "direction": "OUTBOUND",
  "auth": "OAuth2"
}

Example Endpoint:

{
  "deployment_id": "uuid",
  "endpoint_type": "VIP",
  "value": "10.10.5.25",
  "port": 443,
  "scheme": "https"
}

Example TestDataUsage:

{
  "environment": "SIT-1",
  "dataset_version": "E2E_ORDERS_v3",
  "used_for": "REGRESSION",
  "window_start": "2026-01-01"
}
</examples>

<scope_hardening_layers>

TelEnv IQ models ONLY these layers:

L1 Hosting/Network Context:
- on-prem vs cloud (AWS/Azure/GCP), region
- VPC/VNet, subnet/CIDR, zone label
- LB/private endpoint presence (light metadata)
- NAT/VIP (as needed)

L2 Host (server):
- hostname, IP, optional NAT IP, optional OS
- environment membership (DEV/SIT/UAT/PREPROD/PROD_RO)

L3 Component Instance on Host:
- component type/name (e.g., Cisco NSO, Oracle DB)
- exposed endpoints/ports (e.g., 3003, 1521), scheme/base URL (optional)

L4 Deployed Version:
- vendor/runtime version (optional)
- deployed project build/version (required) e.g., 11.1.2 / git SHA / build-1451

L5 Connections:
- component-to-component edges with protocol label (REST/SOAP/TCP/TMF optional)
- NO deep internal modeling (no NSO devices/services/intent, no CMDB relationship graphs)

Out of scope:
- ITSM tickets, CI relationship management, observability metrics/traces/logs
- infra orchestration, promotion to production, auto-discovery agents

</scope_hardening_layers>

<semi_automated_truth>
This MVP is semi-automated:
- Connectors ingest facts where available.
- Users can manually curate/override labels, versions, and diagram layout.
- The UI must support drawing/editing diagram boxes and text and assigning model entities to them.
- Manual overrides must be audit-trailed and never silently overwritten without a clear policy.
</semi_automated_truth>

<maintenance_guidelines>

- Update this file whenever architecture changes.
- Remove outdated rules immediately.
- Keep it concise.
- Prefer adding subdirectory CLAUDE.md files for:
  /connectors
  /diff-engine
  /web

Claude should always prioritize instructions in the nearest CLAUDE.md file in the directory tree.
</maintenance_guidelines>

