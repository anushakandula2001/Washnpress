# Unit Test Plan

## Scope
- Domain rules in src/lib/domain.ts
- New service modules to be added in sprint 0+
- Utility and pure UI helper functions

## Objectives
- Validate deterministic business rules.
- Prevent regressions for OTP, slot fallback, cancellation, mismatch blocking, water calculations.

## Cases
1. OTP happy path and expiry/attempt lockout
2. Pickup slot preference and fallback behavior
3. Delivery mismatch blocking behavior
4. Water saving calculations and aggregate summaries
5. Edge cases for invalid inputs and boundary timestamps

## Tools
- Vitest
- Coverage provider: v8

## Exit Criteria
- All critical rule paths covered
- No failed tests in CI pipeline
