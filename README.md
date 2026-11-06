# Nexorium Core

**The architectural control layer for non-production environments.**

Nexorium Core provides structural visibility, governance enforcement, and cross-environment awareness for enterprise technology landscapes.

## Overview

Nexorium Core addresses two fundamental challenges in enterprise test environments:

1. **Structural Ambiguity** — No reliable, authoritative view of what exists across SIT/UAT/NFT environments
2. **Governance Gaps** — No mechanism to enforce alignment with blueprints, releases, or architectural standards

## Core Capabilities

| Capability | Description |
|------------|-------------|
| **Environment Modelling** | Define and visualize system topology, integrations, and hosting context across all non-production environments. |
| **Governance Alignment** | Enforce blueprints, track release alignment, and detect drift before it impacts delivery. |
| **Cross-Environment Visibility** | Map relationships between DEV, SIT, UAT, and beyond — understand dependencies and flow. |
| **Structural Accountability** | Assign ownership, track RACI, and surface orphaned assets with clarity. |
| **Controlled Change** | Snapshot environments, compare states, and validate readiness with deterministic precision. |

## Connectors

- **Kubernetes Connector**: Read-only discovery from K8s namespaces
- **GitOps Connector**: Parse topology from manifest repositories
- **Manual YAML Import**: Import custom topology definitions

## Visualization

- Interactive environment topology graphs
- Layered architecture views (BSS → OSS → Network)
- Filter by owner, protocol, node type
- SVG/PNG export

## Snapshot & Drift Detection

- Create environment snapshots
- Compare snapshots to detect changes
- Identify new/removed nodes and edges
- Flag structural drift

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React, TailwindCSS, React Flow
- **Backend**: Next.js API routes, Node.js
- **Database**: PostgreSQL with Prisma ORM

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nexorium-core
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database connection string
```

4. Generate Prisma client and run migrations:
```bash
npx prisma generate
npx prisma db push
```

5. Seed the database (optional):
```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed/index.ts
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3003](http://localhost:3003) in your browser

### Claude Code: ISV/OEM Advisor skills (optional)

`.claude/skills/` holds the 27 skills of the Salesforce **ISV/OEM Advisor**: release `v0.2.0` of [`forcedotcom/partner-ecosystem-agentic-kit`](https://github.com/forcedotcom/partner-ecosystem-agentic-kit), installed from the [`krystiandrozd-alt` fork](https://github.com/krystiandrozd-alt/partner-ecosystem-agentic-kit) with the kit's `claude-code` bundle. They cover packaging and 2GP, Dev Hub, scratch orgs and environment selection, implementation patterns, Security Review, and release. The files are unmodified copies. The Apache-2.0 license and the source lock (commit, release tag, per-file SHA-256) are in `.claude/vendor/partner-ecosystem-agentic-kit/`.

- **Where they load:** local Claude Code sessions and Claude Code on the web both load a repository's `.claude/skills/`. A cloud session sees them only on a branch that contains them.
- **Run:** `/oem-isv-advisor` is the entry skill and routes to the other 26.
- **Documentation MCP:** not bundled. The advisor's preflight looks for Salesforce Docs MCP and asks before installing or connecting it. Without it, the advisor offers official Salesforce documentation or packaged knowledge only.
- **Context cost:** about 3,000 tokens are added to every session in this repository, and each skill invocation adds roughly 0.6k–2.6k more (measured on the identical plugin payload with `claude plugin details`, 0.2.0).
- **Do not also enable the `oem-isv-advisor` plugin in this repository:** the same 27 skills would load twice.
- **Updates:** manual. In a checkout of the kit at the new release tag, run `python3 scripts/prepare_harness.py bundle --target claude-code --output <new>.zip`, replace the 27 folders under `.claude/skills/` with the archive's `.claude/skills/`, replace `bundle-manifest.json`, and check the result with the kit's `scripts/check_installed_layout.py <path-to-this-repo>/.claude/skills`. Do not edit the copies in place: local changes are lost on update, and Apache-2.0 requires marking modified files.

The advisor's preflight saves your documentation-tool choices to `.advisor/capabilities.json` in the project root. The file holds a machine-specific absolute path, so it is gitignored.

## Project Structure

```
nexorium-core/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed/                   # Seed data scripts
├── src/
│   ├── app/
│   │   ├── (landing)/         # Landing page routes
│   │   ├── api/               # API routes
│   │   │   ├── environments/  # Environment CRUD
│   │   │   ├── snapshots/     # Snapshot & drift
│   │   │   ├── datasets/      # Test data management
│   │   │   └── connectors/    # Discovery connectors
│   │   └── dashboard/         # Dashboard pages
│   ├── components/
│   │   ├── ui/               # Base UI components
│   │   ├── graph/            # Topology visualization
│   │   ├── landing/          # Landing page sections
│   │   └── dashboard/        # Dashboard components
│   ├── lib/
│   │   ├── connectors/       # Auto-discovery connectors
│   │   ├── services/         # Business logic
│   │   └── utils/            # Utility functions
│   ├── types/                # TypeScript definitions
│   └── hooks/                # React hooks
└── public/                   # Static assets
```

## API Reference

### Environments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/environments` | List all environments |
| POST | `/api/environments` | Create environment |
| GET | `/api/environments/[id]` | Get environment with topology |
| PUT | `/api/environments/[id]` | Update environment |
| DELETE | `/api/environments/[id]` | Delete environment |
| GET | `/api/environments/[id]/stats` | Get environment statistics |
| GET | `/api/environments/[id]/topology` | Get topology for visualization |

### Snapshots

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/snapshots` | List snapshots for environment |
| POST | `/api/snapshots` | Create snapshot |
| GET | `/api/snapshots/[id]` | Get snapshot |
| POST | `/api/snapshots/[id]/compare` | Compare with another snapshot |

### Test Data Sets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/datasets` | List test data sets |
| POST | `/api/datasets` | Create test data set |
| GET | `/api/datasets/[id]` | Get test data set |
| PUT | `/api/datasets/[id]` | Update test data set |
| POST | `/api/datasets/[id]/refresh` | Record data refresh |
| GET | `/api/datasets/[id]/refresh` | Get refresh history |

### Connectors

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/connectors` | Run discovery connector |

## Domain Model

### Core Entities

- **Environment**: Test environment container (SIT/UAT/NFT/PreProd)
- **Node**: Service, database, gateway, queue, or external system
- **Edge**: Connection between nodes with protocol and confidence score
- **DatabaseMetadata**: Extended info for database nodes
- **TestDataSet**: Test data lifecycle tracking
- **Evidence**: Audit trail for discovery
- **EnvironmentSnapshot**: Point-in-time topology capture

## License

MIT
