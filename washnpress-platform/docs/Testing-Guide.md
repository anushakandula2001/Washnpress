# Testing Guide

## Current Automated Coverage
- Domain rule unit tests in src/lib/domain.test.ts

## Target Test Pyramid
1. Unit tests
- Domain rules
- Utility functions
- Isolated component logic

2. Integration tests
- API route handlers with mocked services
- Service-to-repository interaction

3. End-to-End tests
- Resident signup to delivery path
- Operator pickup to QC to delivery path
- Admin configuration and ticket management path

## Mandatory Gates Before Merge
- npm run lint
- npm test
- npm run build

## Coverage Targets
- Unit: >= 80% for domain and service layers
- Integration: all critical API routes
- E2E: all P0 business flows

## Test Data Policy
- Use deterministic fixtures and seeded test DB
- Avoid relying on mutable mock files for integration tests

## Non-Functional Testing
- Performance smoke on key pages and APIs
- Basic accessibility checks on all role portals
- Security regression checks for auth and role boundaries
