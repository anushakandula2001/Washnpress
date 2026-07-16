# Wash N Press Platform

Women-led, water-conscious, community-first laundry platform.

This repository now includes a full engineering handover package intended for a professional software team to continue development through production launch.

## Current Implementation Status
- Frontend-rich investor/demo experience implemented for Dashboard, Resident, Operations, Admin, and Login routes.
- Domain validation rules implemented and tested in `src/lib/domain.ts` and `src/lib/domain.test.ts`.
- API stubs implemented for scheduling, QC validation, and sustainability summary.
- Authentication, RBAC, persistence, and transactional workflows are not fully implemented yet.

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
- `database/migrations/*.sql`
- `database/seeds/*.sql`
- `database/run-migrations.sql`

### API
- `api/openapi.yaml`

### Frontend
- `frontend/Component-Inventory.md`
- `frontend/Routing-Map.md`

### Tests Planning
- `tests/Unit-Test-Plan.md`
- `tests/Integration-Test-Plan.md`
- `tests/API-Test-Plan.md`
- `tests/UAT-Scripts.md`
- `tests/Regression-Suite.md`
- `tests/Performance-Test-Scenarios.md`

### Deployment
- `Dockerfile`
- `docker-compose.yml`
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
