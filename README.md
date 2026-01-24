# TelEnvIQ

**Telco-focused Test Environment Auto-Discovery and Test Data Intelligence Platform**

TelEnvIQ is a production-grade SaaS MVP that provides living environment intelligence for telecom operators and complex OSS/BSS integration landscapes.

## Overview

TelEnvIQ eliminates two critical pain points in telecom test environments:

1. **Environment Topology Blindness** - No reliable, up-to-date view of SIT/UAT/NFT environments
2. **Test Data Blindness** - Teams don't know when data was last refreshed or if masking policies are applied

## Features

### Core Capabilities

- **Auto-Discovery**: Continuously discover and map services, runtimes, endpoints, and integrations
- **Evidence-Driven Topology**: Generate dynamic, confidence-scored environment graphs
- **Test Data Lifecycle Intelligence**: Track refresh dates, masking policies, lineage, and staleness

### Connectors

- **Kubernetes Connector**: Read-only discovery from K8s namespaces
- **GitOps Connector**: Parse topology from manifest repositories
- **Manual YAML Import**: Import custom topology definitions

### Visualization

- Interactive environment topology graphs (React Flow)
- Confidence-based edge styling
- Staleness indicators for nodes and data
- Filter by owner, protocol, node type
- SVG/PNG export

### Snapshot & Drift Detection

- Create environment snapshots
- Compare snapshots to detect changes
- Identify new/removed nodes and edges
- Flag newly stale databases

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
cd telenviq
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

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
telenviq/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed/                  # Seed data scripts
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

### Test Data Staleness

- **Fresh** (<14 days): Green indicator
- **Warning** (14-30 days): Amber indicator
- **Stale** (>30 days): Red indicator

## Manual Import Format

```yaml
version: "1.0"

environment:
  name: "My Environment"
  description: "Description"

nodes:
  - name: "api-gateway"
    type: "GATEWAY"
    owner: "platform-team"
    criticality: "CRITICAL"

  - name: "order-service"
    type: "SERVICE"
    owner: "commerce-team"

edges:
  - source: "api-gateway"
    target: "order-service"
    protocol: "REST"
    port: 8080
    path: "/api/orders"

databases:
  - node: "orders-db"
    engine: "PostgreSQL"
    version: "15.2"
    testData:
      sourceType: "MASKED"
      lastRefreshDate: "2024-01-15"
      refreshMethod: "PIPELINE"
      maskingPolicyVersion: "v2.1"
```

## Future Roadmap

- AI-assisted impact analysis
- Blast radius tracing
- Controlled refresh orchestration
- ITSM integration (ServiceNow, Jira)
- Multi-cluster Kubernetes support
- Real-time topology updates

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.
