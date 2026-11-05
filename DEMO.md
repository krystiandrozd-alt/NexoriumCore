# Nexorium Core: local demo

This branch runs Nexorium Core on your own computer with the sample telco data, without the commercial yFiles library and, optionally, without a Supabase project. It is for exploring the application, not for production use.

Compared with `main`, this branch:

- removes the yFiles dependency and shows a notice instead of the Flow Map pages;
- moves `middleware.ts` to `src/middleware.ts`, where Next.js loads it (at the repository root it is ignored, so no page asks for sign-in);
- adds a demo mode (`NEXORIUM_DEMO_MODE=true`) that opens the app without signing in, outside production builds only;
- runs the seed with `tsx` through `prisma db seed`, which reads `.env` and works on Windows;
- adds `docker-compose.yml` for a local PostgreSQL database and `npm run demo:setup` / `npm run demo:db`.

## What you need

- Node.js 20 or later (tested with Node.js 22)
- Git
- One of:
  - **Docker Desktop**, for a local PostgreSQL database (option A), or
  - a **Supabase** project, for the database and real sign-in (option B)

## Option A: Docker (no accounts needed)

Run in PowerShell (or any terminal):

```powershell
git clone https://github.com/krystiandrozd-alt/NexoriumCore.git
cd NexoriumCore
git checkout claude/local-demo
npm ci
npm run demo:setup
docker compose up -d
npm run demo:db
npm run dev
```

Open http://localhost:3003. The app opens without signing in.

| Command | What it does |
|---|---|
| `npm ci` | Installs dependencies |
| `npm run demo:setup` | Creates `.env` from `.env.demo.example` with a generated encryption key. It never overwrites an existing `.env`. |
| `docker compose up -d` | Starts PostgreSQL 16 on port 5432 |
| `npm run demo:db` | Creates all tables and loads the sample data: 7 environments, 43 systems, governance, RACI and cost data |
| `npm run dev` | Starts the app on port 3003 |

## Option B: Supabase (real sign-in)

1. Create a Supabase project.
2. Run `npm ci` and `npm run demo:setup` as in option A, then edit `.env`:
   - `DATABASE_URL` and `DIRECT_URL`: the Prisma connection strings from your project's database connection details. Keep `schema=nexorium_core` in both, so the app's tables stay separate from Supabase's own.
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`: your project URL and anon (public) key.
   - `NEXORIUM_DEMO_MODE=false`
3. In Supabase, add a user under Authentication with an email and password.
4. Run `npm run demo:db`, then `npm run dev`, open http://localhost:3003 and sign in with that user.

## Where to start

| Page | What it shows |
|---|---|
| `/dashboard/overview` | Environment and system counts, readiness, alerts |
| `/dashboard/environments/overview` | Environments grouped by programme (BSS-TX, OSS-MOD, SEC-CMP, DAP) |
| `/dashboard/environments/sit-env-001` | BSS-TX SIT: topology of systems and interfaces; **Architecture View** shows the BSS → OSS → Network layers |
| `/dashboard/governance` | Policy controls, compliance results, approvals, exceptions, coupling |
| `/dashboard/organisation/raci` | RACI per environment |
| `/dashboard/cost` | Cost models and simulations |

Known limits: the Impact and Insight pages show sample figures (they have no API yet), readiness rules always pass, and some edit actions may reject the sample data because its environment IDs are not UUIDs while parts of the API require them.

## Troubleshooting

- **Port 5432 is in use:** another PostgreSQL is running. Stop it, or change the left-hand port in `docker-compose.yml` (for example `"5433:5432"`) and in both URLs in `.env`.
- **`docker compose` fails:** start Docker Desktop and wait until it reports that it is running.
- **Start the data again:** `docker compose down -v`, `docker compose up -d`, `npm run demo:db`.
- **`.env` already exists:** `npm run demo:setup` leaves it unchanged. Delete `.env` to create a fresh one.

> Demo mode is for your own machine. In development mode the API also skips authentication, so don't run `npm run dev` on a shared network.
