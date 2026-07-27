# Docker

Container configuration for local development and production deployment.

## Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Postgres, Redis, and web app services |
| `Dockerfile` | Multi-stage Next.js production image |
| `.env.example` | Environment template for Docker services |

## Quick start

```bash
# From washnpress-platform root:

# 1. Start Postgres + Redis only
npm run db:up

# 2. Or start full stack (web + db + redis)
npm run docker:up

# 3. Run migrations (first time)
DATABASE_URL="postgresql://washnpress:washnpress@localhost:5434/washnpress" npm run db:setup

# 4. Stop everything
npm run docker:down
```

## Services

| Service | Host port | Internal |
|---------|-----------|----------|
| Web (Next.js) | 3000 | 3000 |
| PostgreSQL | 5434 | 5432 |
| Redis | 6379 | 6379 |

## Environment

Copy `docker/.env.example` to `docker/.env` for compose overrides, or use the root `.env.local` when running `npm run dev` directly.

```
DATABASE_URL=postgresql://washnpress:washnpress@localhost:5434/washnpress
REDIS_URL=redis://localhost:6379
```

When using `docker compose` for the web service, use hostnames `postgres` and `redis` instead of `localhost`.
