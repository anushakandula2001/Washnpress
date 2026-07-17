# Wash N Press API Documentation

## 1. Overview
This document describes the currently implemented API endpoints in the codebase.

Base URL (local):
- http://localhost:3000

Content type:
- application/json

## 2. Endpoints

### 2.1 POST /api/schedule
Selects the next available pickup slot based on preferred windows and capacity fallback.

Request body:
```json
{
  "preferredWindows": ["Morning", "Afternoon"],
  "nowIso": "2026-07-16T07:00:00.000Z"
}
```

Request fields:
- preferredWindows: optional array of Morning | Afternoon | Evening (defaults to [])
- nowIso: optional ISO datetime used for deterministic slot selection

Success response: 200
```json
{
  "slot": {
    "id": "slot-2",
    "date": "2026-07-16",
    "window": "Evening",
    "startTime24h": "18:00",
    "endTime24h": "20:00",
    "remainingCapacity": 2
  }
}
```

Error responses:
- 400: invalid request body
```json
{
  "errors": {
    "formErrors": [],
    "fieldErrors": {
      "preferredWindows": ["Invalid enum value"]
    }
  }
}
```

- 404: no slot available
```json
{
  "message": "No slot available"
}
```

### 2.2 POST /api/operations/qc
Validates quality control decision and enforces fail reason when QC fails.

Request body:
```json
{
  "orderId": "WNP-10022",
  "pass": false,
  "reason": "Stain not removed"
}
```

Request fields:
- orderId: required non-empty string
- pass: required boolean
- reason: optional string; required if pass is false

Success response: 200
```json
{
  "orderId": "WNP-10022",
  "status": "QC Hold",
  "supportTicketCreated": true
}
```

Validation errors:
- 400: invalid request body shape
- 422: pass is false and reason is missing
```json
{
  "message": "QC fail reason is mandatory and opens a support ticket."
}
```

### 2.3 GET /api/sustainability
Returns sustainability summary from water usage logs.

Request body:
- none

Success response: 200
```json
{
  "totalGarments": 55,
  "totalActualLiters": 338,
  "totalSavedLiters": 102
}
```

## 3. Domain Rule References
These rules are implemented in src/lib/domain.ts and used by API/UI:
- isValidIndianMobile(input)
- isOtpUsable(otp, issuedAtIso, attempts, now)
- choosePickupSlot(slots, preferredWindows, now)
- canCancelPickup(pickupDateIso, cutoffHours, now)
- canMarkDelivered(pickupCount, deliveryCount)
- calculateWaterSaved(log)
- summarizeWaterLogs(logs)

## 4. Current Constraints
- APIs currently use in-memory datasets from src/lib/mock-data.ts.
- Authentication and role checks are not yet applied to endpoints.
- No rate limits or idempotency protections are implemented yet.

## 5. Recommended Next API Enhancements
1. Add auth middleware and RBAC checks on all non-public endpoints.
2. Introduce versioning strategy (for example, /api/v1).
3. Add OpenAPI schema generation and contract validation in CI.
4. Add idempotency keys for create/update operations.
5. Add structured error format with error codes and trace IDs.
