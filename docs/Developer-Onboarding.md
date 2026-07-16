# Developer Onboarding

## 1. Repository Setup
1. Clone repository.
2. Install Node.js 20+.
3. Run npm ci in project root.

## 2. First Run
1. Start development server: npm run dev
2. Run tests: npm test
3. Run lint: npm run lint

## 3. Codebase Map
- src/app: routes and API handlers
- src/components: shared UI and widgets
- src/lib: domain logic, types, mock datasets
- docs: architecture and handover documents
- database: schema, migrations, and seeds
- deployment: deployment configs and env references
- tests: QA planning artifacts

## 4. Development Standards
- TypeScript strict mode must remain enabled.
- Validate request payloads with zod.
- Avoid direct DB logic inside route handlers; use service/repository layers.
- Add tests for every new rule and endpoint.

## 5. Branching and PR Guidelines
- Feature branches from main.
- PR must include:
  - Scope summary
  - Test evidence
  - Risks and rollback notes

## 6. Definition of Done
- Lint, tests, build passing
- Updated docs where behavior changes
- Security impact assessed
- Migration included for schema changes

## 7. Sprint 0 Priorities
1. Implement auth/session/RBAC foundation.
2. Integrate PostgreSQL with migrations.
3. Convert mock-data-backed APIs to persistence-backed services.
4. Add integration test baseline.
