# Wash N Press Platform

Women-led, water-conscious, community-first laundry platform.

This repository now includes a full engineering handover package intended for a professional software team to continue development through production launch.

## Current Implementation Status
- Frontend experience for Dashboard, Resident, Operations, Admin, and Login routes.
- Backend API routes connected to PostgreSQL and Redis (22 endpoints).
- Domain validation rules in `src/lib/domain.ts`.
- Database migrations and seeds in `backend/database/`.
- Authentication uses OTP + Redis sessions; dev auto-login for demo resident.
- Operations and admin UIs are mostly static; RBAC not fully enforced yet.

## Tech Stack
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Zod
- Vitest

## Quick Start
1. Install dependencies
	- `npm ci`
2. Run development server
	- `npm run dev`
3. Run quality checks
	- `npm run lint`
	- `npm test`
	- `npm run build`

## Handover Package Structure

### Documentation
- `docs/Audit-Report.md`
- `docs/Requirements-Traceability-Matrix.md`
- `docs/Architecture.md`
- `docs/Database-Design.md`
- `docs/API-Specification.md`
- `docs/Frontend-Architecture.md`
- `docs/Deployment-Guide.md`
- `docs/Developer-Onboarding.md`
- `docs/Environment-Setup.md`
- `docs/Security-Guide.md`
- `docs/Security-Review.md`
- `docs/Testing-Guide.md`
- `docs/Launch-Readiness-Score.md`

### Database
- `backend/database/migrations/*.sql`
- `backend/database/seeds/*.sql`
- `backend/database/run-migrations.sql`

### API
- `backend/api-spec/openapi.yaml`
- `src/app/api/` (live route handlers)
- `src/backend/` (repositories, services, DB)

### Frontend
- `frontend/docs/Component-Inventory.md`
- `frontend/docs/Routing-Map.md`
- `src/app/` (pages), `src/components/` (UI)

### Deployment
- `docker/Dockerfile`
- `docker/docker-compose.yml`
- `.github/workflows/ci-cd.yml`
- `deployment/.env.example`
- `deployment/ENVIRONMENT_VARIABLES.md`
- `deployment/azure-webapp.bicep`
- `deployment/azure.parameters.example.json`
- `deployment/CI-CD-Workflow.md`

### Backlog
- `backlog/Development-Backlog.md`

## Production Readiness Summary
- Architecture: foundational but incomplete for production operations.
- Security: major controls pending (auth, RBAC, rate limiting, audit trail).
- Testing: domain rules covered; integration/E2E/performance pending implementation.
- Database and deployment artifacts provided in this handover package.

See `docs/Launch-Readiness-Score.md` for scoring and recommendation.
