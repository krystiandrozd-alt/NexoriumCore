# Cost & Budget Module

## Overview

The Cost & Budget module helps test environment managers understand and simulate the cost of non-production environments (e.g., CPQ, ITSM, OSS stacks). It provides:

- **Cost tracking** per environment and component/host
- **Rollup views** by environment family, stage, and hosting type
- **What-if simulation** for capacity planning
- **Manual overrides** with audit trail

This module is designed for test environments only and is NOT a full FinOps platform.

---

## Data Model

### Core Entities

| Entity | Description |
|--------|-------------|
| `CostModel` | Template defining cost structure (e.g., "CPQ Non-Prod Model") |
| `CostItem` | Line item within a cost model (e.g., "AWS m5.xlarge", "Oracle DB license") |
| `EnvironmentCostOverride` | Per-environment fixed cost override |
| `EnvironmentCostAllocation` | Computed/saved allocation per environment per period |
| `CostSimulation` | Saved what-if scenarios |

### Cost Item Types

- `HOST` - VM/instance costs
- `COMPONENT_LICENSE` - Software licenses
- `SHARED_PLATFORM` - Prorated shared infrastructure
- `OTHER` - Miscellaneous costs

### Allocation Methods

- `DIRECT` - Applied directly to each environment (qty * unit_cost)
- `SHARED_PRORATED` - Split equally across selected environments

---

## Cost Calculation Logic

### Direct Costs

For each environment, direct costs are calculated as:

```
item_cost = quantity * unit_cost
```

Quantity is determined by:
- `PER_ENV`: Always 1
- `PER_HOST`: Count of hosts in the environment
- `PER_COMPONENT`: Count of component instances
- Default: Uses `defaultQuantity` from cost item

### Shared Costs

Shared items are prorated across all selected environments:

```
per_env_cost = (quantity * unit_cost) / environment_count
```

### Overrides

If an environment has a `fixedMonthlyCost` override set, it takes precedence over calculated costs.

---

## API Endpoints

### Cost Models

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cost-models` | List all cost models |
| POST | `/api/cost-models` | Create cost model |
| GET | `/api/cost-models/[id]` | Get cost model with items |
| PUT | `/api/cost-models/[id]` | Update cost model |
| DELETE | `/api/cost-models/[id]` | Delete cost model |

### Cost Items

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cost-models/[id]/items` | List items for a model |
| POST | `/api/cost-models/[id]/items` | Create cost item |
| PUT | `/api/cost-models/[id]/items` | Update cost item |
| DELETE | `/api/cost-models/[id]/items?itemId=xxx` | Delete cost item |

### Cost Computation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cost/compute` | Compute costs for environments |
| POST | `/api/cost/rollups` | Get aggregated rollups |

### Simulations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cost/simulations` | List saved simulations |
| POST | `/api/cost/simulations` | Run simulation |
| POST | `/api/cost/simulations?save=true` | Run and save simulation |
| GET | `/api/cost/simulations/[id]` | Get simulation details |
| DELETE | `/api/cost/simulations/[id]` | Delete simulation |

### Environment Costs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/environments/[id]/cost` | Get cost data for environment |
| PUT | `/api/environments/[id]/cost` | Update cost override |
| DELETE | `/api/environments/[id]/cost` | Remove cost override |

---

## UI Pages

### 1. Cost Overview Dashboard (`/dashboard/cost`)

- Total monthly cost KPI
- Average cost per environment
- Distribution by family (CPQ, ITSM, etc.)
- Distribution by stage (DEV, SIT, UAT, etc.)
- Environment costs table

### 2. Cost Model Manager (`/dashboard/cost/models`)

- Create/edit cost models
- Add/edit/delete cost items
- View item breakdown

### 3. What-if Simulator (`/dashboard/cost/simulator`)

- Select cost model and filters
- Add N environments
- Apply scaling factor
- View projected costs and delta
- Save simulations

### 4. Environment Cost Detail (`/dashboard/cost/environments/[id]`)

- View cost breakdown
- Set/edit fixed cost override
- View allocation history

---

## Running Locally

### 1. Start Development Server

```bash
npm run dev
```

### 2. Seed Demo Data

```bash
npm run db:seed
```

This creates:
- 3 environments (SIT, UAT, NFT)
- 3 cost models (CPQ, ITSM, OSS/BSS)
- Sample cost items
- Sample allocations and overrides
- 2 saved simulations

### 3. Access the Module

Navigate to: `http://localhost:3003/dashboard/cost`

---

## Using the Module

### View Cost Rollups

1. Go to `/dashboard/cost`
2. Select a cost model from the dropdown
3. View KPI cards and distribution charts
4. Scroll down to see per-environment costs

### Edit a Cost Model

1. Go to `/dashboard/cost/models`
2. Click "Configure" on a model
3. Add/edit/delete cost items
4. Items with `SHARED_PRORATED` allocation will be split across environments

### Run a Simulation: "Add 2 CPQ Environments"

1. Go to `/dashboard/cost/simulator`
2. Select "CPQ Non-Prod Model" as the cost model
3. Set "Environment Family" to "CPQ"
4. Set "Add New Environments" to 2
5. Click "Run Simulation"
6. View projected cost and delta
7. Click "Save Simulation" to store the scenario

### Set an Environment Cost Override

1. Go to `/dashboard/cost`
2. Click the arrow on an environment row
3. Click "Edit Override"
4. Enter a fixed monthly cost and notes
5. Click "Save Override"

---

## Assumptions

### Currency

- Default: USD
- Supported: USD, EUR, GBP, NOK
- Each cost model has a single currency

### Period

- Default: MONTHLY
- All costs and simulations assume monthly period
- Rollups are computed for current month

### Allocation Default

- `SHARED_PRORATED` items are split equally by default
- Future enhancement: weight by node count or other factors

### Family Inference

Environment "family" is inferred from component capability types:
- CPQ, CRM, BILLING, ITSM, SOM, INVENTORY, OSS, OTHER

### Hosting Type

Determined from `NetworkContext.hostingType` (CLOUD, ON_PREM, etc.)

---

## Audit Trail

All cost override changes are recorded in the `audit_events` table:
- Entity type: `EnvironmentCostOverride`
- Fields: old/new values, editedBy, editedAt, reason

---

## Limitations (MVP)

- No automated cloud billing integration
- No complex tagging/chargeback workflows
- No cost optimization recommendations
- No historical trend analysis
- Shared cost allocation is equal split only

---

## Future Enhancements

- Cloud cost API integration (AWS Cost Explorer, Azure Cost Management)
- Weighted shared cost allocation
- Budget alerts and thresholds
- Historical cost trending
- Export to CSV/Excel
