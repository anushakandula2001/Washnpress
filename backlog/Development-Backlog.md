# Development Backlog

Effort scale:
- S: <= 3 days
- M: 4-8 days
- L: 9-15 days
- XL: > 15 days

## MVP Remaining

| Item | Description | Priority | Effort | Dependencies |
|---|---|---|---|---|
| MVP-01 | Implement OTP auth backend + sessions | Critical | L | DB schema, SMS provider |
| MVP-02 | Implement RBAC guards for routes and APIs | Critical | M | MVP-01 |
| MVP-03 | Integrate PostgreSQL and repositories | Critical | L | DB migrations |
| MVP-04 | Resident scheduling transactional flow | High | L | MVP-03 |
| MVP-05 | Operator pickup->QC->delivery transactional flow | High | XL | MVP-03, MVP-02 |
| MVP-06 | Admin ticket queue and basic config CRUD | High | L | MVP-03, MVP-02 |
| MVP-07 | Notification delivery integration | High | M | MVP-01, provider keys |

## Pre-Production

| Item | Description | Priority | Effort | Dependencies |
|---|---|---|---|---|
| PRE-01 | Payment gateway integration and reconciliation | High | XL | MVP foundation |
| PRE-02 | Audit logging and reporting APIs | High | M | MVP-02, DB audit tables |
| PRE-03 | Observability stack (logs, metrics, traces) | High | M | deployment pipeline |
| PRE-04 | API versioning and error contract standardization | Medium | M | service layer |
| PRE-05 | E2E test automation for critical paths | High | L | stable workflows |
| PRE-06 | Security hardening and penetration test cycle | High | M | auth + RBAC |
| PRE-07 | Performance baseline and load test signoff | Medium | M | observability |

## Future Enhancements

| Item | Description | Priority | Effort | Dependencies |
|---|---|---|---|---|
| FUT-01 | Route mode and hub mode full implementation | Medium | XL | core workflow stable |
| FUT-02 | Localization (English/Hindi) | Medium | M | i18n framework |
| FUT-03 | Live map integration for delivery | Medium | M | API/provider |
| FUT-04 | Training module LMS for operators | Low | L | auth + media storage |
| FUT-05 | Advanced analytics and forecasting dashboards | Low | L | event telemetry |
| FUT-06 | Website marketing funnel and RWA conversion stack | Medium | L | content + CRM |
