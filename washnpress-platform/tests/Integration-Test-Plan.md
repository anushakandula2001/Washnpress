# Integration Test Plan

## Scope
- API handlers with service layer and persistence
- Session and RBAC middleware
- DB repositories and transaction boundaries

## Scenarios
1. Auth flow creates and validates session.
2. Resident scheduling consumes live slot capacity.
3. Operations QC fail creates support ticket.
4. Delivery completion validates garment count and updates subscription usage.
5. Admin pricing update requires admin role and creates audit log.

## Environments
- CI test DB (ephemeral)
- Staging environment with production-like config

## Exit Criteria
- All P0 workflow integrations pass
- No data consistency failures across transaction steps
