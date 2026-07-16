# Frontend Architecture

## Scope
This document describes the current frontend structure and the recommended production frontend model.

## Current Implementation

### Routing
- App Router pages:
  - /
  - /resident
  - /operations
  - /admin
  - /login

### Composition
- Shared layout in src/app/layout.tsx
- Shared shell in src/components/app-shell.tsx
- Visual widgets in src/components/widgets
- UI primitives in src/components/ui

### State and Data
- Mostly static view data from src/lib/experience-data.ts and src/lib/mock-data.ts
- Minimal computed logic from src/lib/domain.ts
- No centralized client data cache (such as React Query) yet

## Frontend Strengths
- Clean design system approach
- Good use of reusable components
- Responsive layout patterns
- Strong visual hierarchy and branded styling

## Frontend Gaps
- No authenticated route guards
- No loading/error boundaries tied to real network states
- Actions are mostly non-transactional
- No feature-level test coverage for rendered behavior

## Recommended Target Frontend Design

### Feature Folder Strategy
- frontend/features/resident
- frontend/features/operations
- frontend/features/admin
- frontend/features/auth

Each feature should include:
- view components
- hooks
- api client functions
- schemas
- tests

### Data Fetching Strategy
- Adopt server actions or typed fetch clients with cache policy per endpoint
- Use stale-while-revalidate where appropriate for dashboards
- Add optimistic updates for operational actions with rollback

### Frontend Security Controls
- Route guards by role
- Redacted PII rendering by default
- Hardened client logging (no secrets/PII)

### Performance Practices
- Segment-level loading for expensive sections
- Memoization for heavy visual widgets
- Lighthouse budgets in CI

## Frontend Definition of Done (Production)
- Every CTA invokes a backed API contract
- Error state and retry behavior implemented
- Accessibility baseline (keyboard, focus, labels, contrast)
- Unit and E2E coverage for critical user journeys
