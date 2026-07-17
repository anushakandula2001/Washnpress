# API Specification

## Overview
Current API endpoints are minimal and demo-oriented. This specification captures existing endpoints and defines production extensions required for launch.

## Existing Endpoints

### POST /api/schedule
Purpose: choose next available pickup slot with preferred-window fallback.

Request JSON:
- preferredWindows: array of Morning | Afternoon | Evening
- nowIso: optional ISO datetime

Responses:
- 200 with slot object
- 400 for validation errors
- 404 when no slot is available

### POST /api/operations/qc
Purpose: validate QC pass/fail and enforce fail reason.

Request JSON:
- orderId: string
- pass: boolean
- reason: optional string, required when pass=false

Responses:
- 200 with status and supportTicketCreated
- 400 for validation errors
- 422 when fail reason missing

### GET /api/sustainability
Purpose: aggregate water savings summary.

Responses:
- 200 with totalGarments, totalActualLiters, totalSavedLiters

## Production API Roadmap

### Auth
- POST /api/v1/auth/send-otp
- POST /api/v1/auth/verify-otp
- POST /api/v1/auth/logout
- GET /api/v1/auth/me

### Resident
- GET /api/v1/resident/profile
- PUT /api/v1/resident/profile
- GET /api/v1/resident/plans
- POST /api/v1/resident/subscriptions
- POST /api/v1/resident/pickups
- PATCH /api/v1/resident/pickups/{pickupId}
- GET /api/v1/resident/orders
- GET /api/v1/resident/orders/{orderId}
- POST /api/v1/resident/tickets

### Operations
- GET /api/v1/operations/bookings
- POST /api/v1/operations/pickups/{pickupId}/collect
- POST /api/v1/operations/batches/{batchId}/stage
- POST /api/v1/operations/batches/{batchId}/qc
- POST /api/v1/operations/deliveries/{deliveryId}/confirm

### Admin
- POST /api/v1/admin/societies
- POST /api/v1/admin/societies/{societyId}/units/import
- PUT /api/v1/admin/pricing
- GET /api/v1/admin/reports/sustainability
- GET /api/v1/admin/reports/operations

## Security and Contract Rules
- Use JWT/session cookie with role claims
- Every write endpoint requires idempotency key
- Standard error envelope with code, message, requestId
- Pagination required for all list endpoints

## OpenAPI Source
See api/openapi.yaml for the machine-readable contract seed.
