# WashNPress Platform

Full-stack laundry management platform — resident portal, operations dashboard, and admin console.

## Project structure

```
washnpress-platform/
├── backend/          # Database, migrations, API spec, server logic
├── frontend/         # UI docs + Next.js pages/components
├── docker/           # Docker Compose, Dockerfile, env templates
├── src/
│   ├── app/          # Next.js routes (pages + API handlers)
│   ├── backend/      # DB, repositories, services (imported by API routes)
│   ├── frontend/     # API client (imported by pages)
│   ├── components/   # React UI components
│   └── lib/          # Shared domain logic & mock data
├── docs/             # Architecture, deployment, user guides
├── deployment/       # Azure Bicep, CI/CD env docs
├── tests/            # Test plans
└── public/           # Static assets
```

## Quick start

```bash
# Install dependencies
npm install

# Start Postgres + Redis
npm run db:up

# Run database migrations + seeds
cp .env.example .env.local
npm run db:setup

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Resident APIs work in dev without login (demo user auto-session).

Health check: `GET /api/health`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run test` | Run Vitest tests |
| `npm run db:up` | Start Postgres + Redis (Docker) |
| `npm run db:setup` | Run migrations + seeds |
| `npm run db:down` | Stop database containers |
| `npm run docker:up` | Start full stack (web + db + redis) |
| `npm run docker:down` | Stop all containers |

## Tech stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS v4, TypeScript
- **Backend:** Next.js API routes, PostgreSQL (`pg`), Redis (`ioredis`)
- **Infra:** Docker Compose, GitHub Actions CI/CD

## Documentation

- [Backend](./backend/README.md) — database, API routes, server logic
- [Frontend](./frontend/README.md) — pages, components, routing
- [Docker](./docker/README.md) — container setup
- [Architecture](./docs/Architecture.md) — system design
- [API docs](./docs/API_Documentation.md) — endpoint reference
