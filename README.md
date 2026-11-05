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

- **Frontend**: Next.js 16 (App Router), TypeScript, React, TailwindCSS, React Flow
- **Backend**: Next.js API routes, Node.js
- **Database**: PostgreSQL on Neon, Prisma ORM (schema `nexorium_core`)

## Getting Started

### Prerequisites

- Node.js 20.9+
- A Neon project (or any PostgreSQL 14+ for local development)
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
# Edit .env: database connection strings (see Database below) and Neon Auth settings (see Authentication below)
```

4. Generate Prisma client and run migrations:
```bash
npx prisma generate
npx prisma migrate deploy   # local database; for Neon use the workflow described under Database
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

## Database

The application data lives in PostgreSQL on [Neon](https://neon.com): database `neondb`, schema `nexorium_core` (Neon Auth keeps its own tables in the `neon_auth` schema of the same database). Prisma migrations in `prisma/migrations` are the only way the schema changes.

Connection strings, both from the Neon Console (project → branch → **Connect**, database `neondb`):

| Variable | Host | Used by |
|---|---|---|
| `DATABASE_URL` | pooled (`…-pooler.…`) | the running app |
| `DIRECT_URL` | direct (no `-pooler`) | Prisma CLI: migrations, seed |

Both end with `?sslmode=require&schema=nexorium_core`; `DATABASE_URL` may add `connect_timeout=15` to cover Neon's scale-to-zero wake-up.

### Applying migrations to Neon

Migrations are applied by the manual GitHub Actions workflow **Deploy database schema to Neon** (`.github/workflows/deploy-db-to-neon.yml`):

1. Add the repository secret `NEON_DIRECT_URL`: the direct connection string including `?sslmode=require&schema=nexorium_core`.
2. Actions → **Deploy database schema to Neon** → **Run workflow**, type `DEPLOY_NEON`, leave **seed** on to load the demo data.
3. The run refuses the pooled host, any database other than `neondb`, and a schema that already has tables unless **allow_existing** is set.

The workflow runs `prisma migrate deploy` and then the seed script. For local development, point `DATABASE_URL` and `DIRECT_URL` at a local PostgreSQL and run `npx prisma migrate deploy` yourself.

## Authentication

Sign-in is handled by [Neon Auth](https://neon.com/docs/auth/overview) through the `@neon/auth` SDK. The app exposes `/api/auth/*`, which proxies to Neon Auth and keeps the session in an encrypted cookie; `proxy.ts` requires a valid session on the application routes.

- **Methods:** email/password and GitHub.
- **Invite-only:** there is no sign-up page and `/api/auth/sign-up/*` returns 404. Create users in the Neon Console (project → branch → **Auth**). Note that a GitHub sign-in may still create an account on first use unless sign-ups are restricted on the Neon side.

Setup:

1. In the Neon Console, open the project and branch, go to **Settings → Auth** and enable Auth. Copy the **Auth URL** (ends in `/<database>/auth`) into `NEON_AUTH_BASE_URL`.
2. Generate a cookie secret with `openssl rand -base64 32` and put it in `NEON_AUTH_COOKIE_SECRET`.
3. For GitHub: under **OAuth providers**, add GitHub with your own OAuth app credentials. In the GitHub OAuth app, set the authorization callback URL to `{NEON_AUTH_BASE_URL}/callback/github` (copy the exact value from the Neon dialog).
4. Add every origin the app runs on (for example `http://localhost:3003`) to the trusted domains in the Neon Auth settings, otherwise the OAuth round trip is rejected.

API routes bypass authentication when `NODE_ENV=development` and act as an admin user (see `src/lib/auth/api-auth.ts`).

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
