# Wash N Press Deployment Guide

## 1. Scope
This guide covers local setup, production build, and deployment patterns for the current Next.js application.

## 2. Prerequisites
- Node.js 20 or later
- npm 10 or later
- Access to environment variable management in target platform

## 3. Local Development
From project root:

```bash
npm install
npm run dev
```

Open:
- http://localhost:3000

Useful checks:

```bash
npm run lint
npm test
npm run build
```

## 4. Production Build
```bash
npm ci
npm run build
npm run start
```

Default production server port is 3000 unless overridden by platform settings.

## 5. Environment Variables
Current code does not require mandatory env vars for basic startup. For production, define the following baseline variables before adding integrations:

- NODE_ENV=production
- NEXT_TELEMETRY_DISABLED=1 (optional)
- APP_BASE_URL (recommended)
- LOG_LEVEL (recommended)

When auth and integrations are added, include:
- AUTH_SECRET
- OTP_PROVIDER_API_KEY
- DATABASE_URL
- REDIS_URL
- PAYMENT_PROVIDER_KEYS

## 6. Hosting Options
### Option A: Vercel
1. Import repository.
2. Framework preset: Next.js.
3. Build command: npm run build
4. Output: managed by Next.js adapter.
5. Configure env vars in Vercel project settings.

### Option B: Self-Hosted Node Runtime
1. Build artifact with npm run build.
2. Run with npm run start behind reverse proxy (Nginx/Traefik).
3. Enable HTTPS/TLS termination at proxy.
4. Set health checks to root route and API readiness endpoint (recommended to add /api/health).

## 7. CI/CD Pipeline Recommendations
Add a pipeline with these stages:
1. Install: npm ci
2. Static checks: npm run lint
3. Tests: npm test
4. Build: npm run build
5. Artifact publish or image build
6. Deploy to staging
7. Smoke test
8. Deploy to production with approval gate

## 8. Release Checklist
- Lint, tests, and build passing
- No high-severity vulnerabilities in dependencies
- Environment variables validated
- Rollback plan prepared
- Monitoring and alerting active

## 9. Post-Deployment Validation
- Verify navigation pages: /, /resident, /operations, /admin, /login
- Verify API responses:
  - POST /api/schedule
  - POST /api/operations/qc
  - GET /api/sustainability
- Verify browser console has no runtime errors

## 10. Production Hardening Tasks (Pending)
- Add real auth and RBAC
- Add persistence layer
- Add rate limiting and audit logs
- Add observability (logs, metrics, traces)
- Add backup and disaster recovery procedures
