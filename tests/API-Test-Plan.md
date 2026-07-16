# API Test Plan

## API Areas
- /api/schedule
- /api/operations/qc
- /api/sustainability
- Planned /api/v1 auth/resident/operations/admin routes

## Test Categories
1. Contract tests: request/response schema compliance
2. Auth tests: unauthorized and forbidden cases
3. Validation tests: malformed payload handling
4. Idempotency tests: repeated writes
5. Error tests: deterministic error envelopes

## Tooling
- Supertest or equivalent HTTP-level test runner
- Seeded test DB

## Exit Criteria
- 100% pass on contract and auth-negatives for P0 endpoints
