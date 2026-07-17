# Wash N Press Admin Guide

## 1. Purpose
This guide explains how administrators use the current Admin Console and what is planned for full production operations.

## 2. Access
Current Admin Console path:
- /admin

Current state:
- Page is accessible through navigation and direct URL.
- Role-based access control is not yet enforced.

## 3. Admin Console Overview
The Admin Console currently provides a strategic operations view with the following modules:

1. KPI Overview
- Active societies
- Active subscriptions
- Subscription revenue
- Complaints per 1K orders

2. Lifecycle Visibility
- Order lifecycle stage distribution

3. Pricing Configuration View
- Plan tiers, garment caps, discounts, monthly pricing
- Current view is read-only UI

4. Sustainability Snapshot
- Garments processed
- Water saved
- Carbon reduction indicators

5. Women-Led Network Metrics
- Active units
- Trained operators
- Communities served
- Revenue shared

6. Expansion Intelligence
- Society opportunities with confidence and MRR potential

7. Order Quality & Complaints Overview
- Order cards and QC hold visibility

## 4. Current Admin Workflow (As Implemented)
Use this flow in the current MVP:
1. Open /admin and review KPI trend cards.
2. Check lifecycle widget for current distribution.
3. Review pricing table for plan values.
4. Review impact and expansion modules for network planning context.
5. Cross-reference QC hold entries in order quality section.

Important: This is currently analytics-oriented UI and not a transactional operations console.

## 5. Known Limitations
- No enforced admin authentication or role checks
- No editing or save actions for pricing/configuration
- No society onboarding or contract management forms
- No complaint resolution workflow engine
- No audit log trail for admin actions

## 6. Recommended Admin Operating Model for Production
1. Access control
- Enforce admin SSO/OTP + RBAC
- Scope permissions by capability (pricing, finance, support, ops)

2. Governance and change control
- Introduce approval workflow for pricing and refund changes
- Record immutable audit entries for all privileged actions

3. Incident and quality operations
- Define SLA queues for complaints and QC exceptions
- Add escalation matrix by severity and turnaround commitments

4. Reporting and compliance
- Implement downloadable reports (financial, ESG, operational)
- Add retention and privacy controls for admin-accessed data

## 7. Admin Readiness Checklist
Before using this portal in production, ensure:
- RBAC is enabled
- All critical admin actions are transactional and persisted
- Audit logs are enabled and searchable
- Sensitive operations require explicit confirmation and approval
- Monitoring alerts are configured for anomalies

## 8. Quick Reference
- Console route: /admin
- Related APIs currently implemented:
  - POST /api/schedule
  - POST /api/operations/qc
  - GET /api/sustainability
- Supporting rule utilities: src/lib/domain.ts
