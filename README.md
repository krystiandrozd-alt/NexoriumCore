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

### Claude Code: ISV/OEM Advisor plugin (optional)

`.claude/settings.json` registers the `partner-ecosystem-agentic-kit` plugin marketplace and enables its **ISV/OEM Advisor** plugin (`oem-isv-advisor`): 27 skills for Salesforce ISV/OEM partners covering packaging and 2GP, Dev Hub, scratch orgs and environment selection, implementation patterns, Security Review, and release. The marketplace source is the [`krystiandrozd-alt` fork](https://github.com/krystiandrozd-alt/partner-ecosystem-agentic-kit) of [`forcedotcom/partner-ecosystem-agentic-kit`](https://github.com/forcedotcom/partner-ecosystem-agentic-kit), so upstream changes arrive only after the fork is synced. To follow upstream directly, change `repo` to `forcedotcom/partner-ecosystem-agentic-kit`.

- **Local (terminal, desktop app, IDE):** start Claude Code in the repository root and accept the workspace trust dialog. Claude Code then registers the marketplace and loads the plugin. No separate install step is needed because the marketplace lists the plugin by a relative path. Run it with `/oem-isv-advisor:oem-isv-advisor`.
- **Claude Code on the web:** has no effect. Cloud sessions do not install plugins that a repository's `.claude/settings.json` enables. There, the advisor needs your organization's server-managed settings (the same two keys) or its skills enabled on claude.ai.
- **Bundled MCP server:** the plugin ships a `salesforce-docs` MCP server (`https://salesforce-docs-76258744c9d7.herokuapp.com/api/mcp`). Claude Code connects plugin MCP servers automatically when the plugin is enabled. Turn it off in `/mcp` if that host is not approved.
- **Context cost:** about 3,000 tokens are added to every session in this repository, and each skill invocation adds roughly 0.6k–2.6k more (`claude plugin details oem-isv-advisor`, plugin 0.2.0).
- **Updates:** auto-update is off, which is Claude Code's default for third-party marketplaces. Sync the fork, then in `/plugin` open **Marketplaces**, select **partner-ecosystem-agentic-kit**, and choose **Update marketplace**.
- **Opt out on your machine:** set `"oem-isv-advisor@partner-ecosystem-agentic-kit": false` under `enabledPlugins` in `.claude/settings.local.json`.

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
