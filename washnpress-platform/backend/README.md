# Backend

PostgreSQL schema, migrations, seeds, API specification, and server-side business logic for WashNPress.

## Folder structure

```
backend/
├── database/
│   ├── migrations/     # SQL schema (001–004)
│   ├── seeds/          # Demo/reference data
│   └── run-migrations.sql
├── scripts/
│   └── setup-db.mjs    # Run migrations + seeds via Node
└── api-spec/
    ├── openapi.json    # Full OpenAPI 3.1 spec (91 routes)
    └── README.md
```

## Runtime code (Next.js API routes)

Because this project uses Next.js App Router, HTTP handlers live in:

```
src/app/api/          # 91 REST endpoints
src/backend/
├── db/               # PostgreSQL + Redis connections
├── repositories/     # Data access layer
├── services/         # Business logic (auth, pickup)
├── api/              # Response helpers, session, transformers
└── types.ts          # Database/API types
```

## Commands

```bash
# Start Postgres + Redis
npm run db:up

# Run migrations and seeds
DATABASE_URL="postgresql://washnpress:washnpress@localhost:5434/washnpress" npm run db:setup

# Stop databases
npm run db:down
```

## API endpoints

See **[API-REFERENCE.md](./API-REFERENCE.md)** for the complete list of 91 endpoints.

Quick summary:
