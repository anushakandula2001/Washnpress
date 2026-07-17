# Environment Variables List

## Files
| File | Purpose | Commit? |
|---|---|---|
| `.env.example` | Local Next.js template (copy → `.env.local`) | Yes |
| `.env.local` | Local secrets / overrides (auto-loaded by Next.js) | No |
| `deployment/.env.example` | Docker / deploy template | Yes |
| `deployment/.env` | Values used by `docker-compose.yml` | No |

## Variables

| Variable | Required now? | Description |
|---|---|---|
| NODE_ENV | Recommended | Runtime mode (`development` / `production`) |
| PORT | Recommended | Application port (default `3000`) |
| APP_BASE_URL | Recommended | Public base URL (e.g. `http://localhost:3000`) |
| LOG_LEVEL | Recommended | Logging verbosity (`info`, `debug`, …) |
| NEXT_TELEMETRY_DISABLED | Optional | Set `1` to disable Next.js telemetry |
| DATABASE_URL | When DB is used | PostgreSQL connection string |
| REDIS_URL | When cache/sessions used | Redis connection string |
| AUTH_SECRET | When auth is enabled | Session/JWT signing secret |
| OTP_PROVIDER_API_KEY | When OTP login is enabled | OTP delivery provider key |
| PAYMENT_PROVIDER_API_KEY | Planned | Payment integration key |
| WHATSAPP_PROVIDER_API_KEY | Planned | WhatsApp notifications key |
| PUSH_PROVIDER_API_KEY | Planned | Push notification provider key |

## Notes
- The current Next.js UI can start with `npm run dev` without a database.
- Use Docker Compose Postgres/Redis when you need the full production-style stack.
- For local Next.js, use `localhost` hostnames; for Compose services, use `postgres` / `redis`.
