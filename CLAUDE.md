# CLAUDE.md — Nexorium Core (Enterprise-Structured MVP)

<project_context>
Nexorium Core is the architectural control layer for non-production environments. It provides structural visibility, governance enforcement, and cross-environment awareness for enterprise technology landscapes.

It models:
- BSS/OSS systems
- Interfaces and topology
- Hosting/network context
- Deployed versions
- Snapshots & drift
- Governance alignment
- Impact analysis
- Organisational accountability

It does NOT perform:
- Deployment
- Monitoring/observability
- CI/CD orchestration
- Production control

Production may be connected in READ-ONLY mode only.
</project_context>


<north_star>
Nexorium Core is the architectural control layer for non-production environments.

It answers:
- What exactly is this environment composed of?
- What version is deployed where?
- How are components connected?
- Has the environment drifted?
- Is the environment structurally ready?
- Is it aligned with blueprint and release intent?
- Who owns what?

If a feature does not strengthen environment truth, governance alignment, impact visibility, or accountability, it is out of scope.
</north_star>


<brand_positioning>
Brand name: Nexorium Core

Brand personality:
- Authoritative
- Architectural
- Structural
- Composed
- Enterprise-grade
- Precise
- Calm confidence
- Minimal

Tone guidelines:
- No buzzwords
- No "intelligence"
- No "insight"
- No "360"
- No hype language
- Use clear, direct, declarative statements

The brand should feel like:
"The control plane for non-production architecture."
</brand_positioning>


<enterprise_pillars>
The product is structured into six top-level pillars:

1. Environments
2. Governance
3. Impact
4. Insight
5. Organisation
6. Configuration

Navigation must reflect these pillars explicitly.
</enterprise_pillars>


<domain_expectations>
Nexorium Core must assume enterprise telco/IT complexity.

Design decisions must reflect:

- Layered architecture (BSS → OSS → Network)
- Systems such as CRM, CPQ, Billing, ERP, Order Management, Orchestration, Inventory
- Northbound/southbound integration patterns
- API-based integrations (REST, SOAP, TMF-style APIs)
- Multi-environment landscapes (DEV, SIT, UAT, PREPROD, PROD_RO)
- 10–50+ systems per environment
- Regulatory and audit sensitivity

Avoid startup-SaaS simplifications.
Model real enterprise complexity even at MVP level.
</domain_expectations>


<enterprise_scale_assumptions>
- Must support multiple parallel environments.
- Must support branching flows (e.g., SIT1, SIT2).
- Must support cross-environment comparison.
- Must handle 30–100 nodes in graph view.
- Must assume audit and traceability requirements.
</enterprise_scale_assumptions>


<architectural_invariants>
The following invariants must never be violated:

1. Canonical model is the single source of truth.
2. Snapshots are immutable.
3. All diffs are snapshot-to-snapshot only.
4. No silent inference of topology relationships.
5. No hidden auto-corrections of data.
6. Production environments (PROD_RO) are strictly read-only.
7. All version changes must be traceable.
8. Manual overrides must never be silently overwritten by ingestion.
</architectural_invariants>


<pillar_definitions>

1️⃣ Environments (Truth Layer)
Responsible for:
- Flow Map (stage + upstream/downstream)
- Environment Graph
- Systems & Interfaces
- Version Matrix
- Snapshots Timeline
- Health Overlay
- Environment Settings

Models structural truth only.


2️⃣ Governance (Alignment Layer)
Responsible for:
- Blueprints (expected state definitions)
- Releases (target groupings)
- Alignment views:
  - Blueprint vs Snapshot
  - Snapshot vs Release
  - Cross-environment comparison
  - Non-prod vs Prod drift
- Promotion readiness rules

Governance logic must be deterministic.
No workflow engines in MVP.


3️⃣ Impact (Risk Layer)
Responsible for:
- Entry/Exit detection
- Dependency path analysis
- Blast radius calculation
- Change detection
- Stability index

Impact must be computed only from stored topology + snapshot state.


4️⃣ Insight (Reporting Layer)
Responsible for:
- Dashboard
- Deterministic reports:
  - Environment health
  - Drift
  - Cost analysis
  - Release compliance
  - Flow health
  - Stability risk
  - Dependency criticality
  - Test data integrity


5️⃣ Organisation (Accountability Layer)
Responsible for:
- People registry
- RACI mapping (R/A/C/I)
- Ownership views
- Orphaned asset detection


6️⃣ Configuration (Control Surface)
Responsible for:
- Connectors
- Flow templates
- Integration rules
- Platform settings
- RBAC
</pillar_definitions>


<architecture_principles>
1. API-connector-based ingestion only (NO agents).
2. Canonical internal data model is the single source of truth.
3. Snapshots are immutable once created.
4. Every ingestion run creates a version snapshot.
5. Manual enrichment must be audit-trailed.
6. Provenance must be stored for all ingested data.
</architecture_principles>


<data_integrity_rules>
- A Deployment belongs to exactly one Environment.
- An Endpoint belongs to exactly one Deployment.
- An Interface must reference valid source and target Deployments.
- Project_version is mandatory for every Deployment.
- No dangling references allowed.
</data_integrity_rules>


<versioning_rules>
Every Deployment must expose:
- vendor_version (optional)
- project_version (required)

Diff must detect:
- Version changes
- Endpoint changes
- Interface changes
- Component additions/removals

Version comparisons must be deterministic.
</versioning_rules>


<flow_model_rules>
- Environments belong to a Stage.
- EnvironmentLink defines upstream → downstream.
- Flow Map must auto-update on link changes.
- Flow templates define allowed transitions.
- Invalid transitions must be blocked unless override permission exists.
- Branching environments must be supported.
</flow_model_rules>


<readiness_definition>
Environment Readiness means:

1. Structural completeness
2. Version validity
3. Snapshot integrity
4. No broken topology
5. Governance alignment (if blueprint exists)

Scoring must be deterministic.
</readiness_definition>


<connector_framework>
Each connector must implement:
- fetch()
- map()
- upsert()
- snapshot()
- report()

Connector Rules:
- Idempotent
- Never delete production data
- Store provenance metadata
- Log warnings instead of crashing
</connector_framework>


<impact_rules>
Impact calculations must:
- Use graph traversal
- Be deterministic
- Avoid recursive infinite loops
</impact_rules>


<non_functional_requirements>
- Deterministic behavior
- Testability (isolated DB for tests)
- No external calls during testing
- Clear error states
- Audit traceability
- Scalable navigation structure
</non_functional_requirements>


<testing_framework>
Core flows that must always be protected:

- Connector ingestion → canonical persistence
- Environment navigation
- Flow map updates
- Snapshot diff correctness
- Blueprint alignment correctness
- RACI persistence
- Graph derivation from DB state
- Cost engine math (if active)

Required:
- Unit tests
- Integration tests
- E2E smoke tests
- Deterministic fixtures
- ≥70% global coverage
- ≥85% for core logic
</testing_framework>


<performance_constraints>
- Graph must support 30–100 nodes smoothly.
- Auto-layout must not re-run unnecessarily.
- Diff must operate snapshot-to-snapshot only.
- Avoid N+1 database queries.
</performance_constraints>


<standards_and_conventions>
Backend:
- TypeScript only
- Strict typing
- Zod validation

Frontend:
- No business logic inside components
- Typed API client only

Database:
- UUID primary keys
- Use migrations
- No denormalized JSON blobs for core entities
</standards_and_conventions>


<maintenance_guidelines>
- Update this file when architecture evolves.
- Remove outdated rules immediately.
- Prefer subdirectory CLAUDE.md files for:
  /connectors
  /governance
  /impact
  /organisation
  /web
  /knowledge (wiki schema)
</maintenance_guidelines>


<knowledge_base>
knowledge/ is the project wiki, maintained by Claude (LLM Wiki pattern): derived pages on product intent, domain model, implementation state and open contradictions.
- Schema and workflows: knowledge/CLAUDE.md. Entry point: knowledge/wiki/index.md.
- For questions about product intent, domain vocabulary or past decisions, read the index first, then the linked pages.
- The wiki never overrides this file, the code or prisma/schema.prisma. When they disagree, the wiki page is stale: refresh it.
- The repository is public: no client or personal data in knowledge/.
- Skills: /wiki-ingest, /wiki-query, /wiki-lint. Deterministic checks: npm run wiki:lint.
</knowledge_base>
