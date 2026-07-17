# Wash N Press Requirements Gap Analysis

Date: 2026-07-15
Scope audited against:
- WashNPress_DPR_Functional.txt
- WashNPress_App_Functional_Spec.txt
- WashNPress_Brand_Website.txt

Code evidence reviewed:
- src/app/page.tsx
- src/app/resident/page.tsx
- src/app/operations/page.tsx
- src/app/admin/page.tsx
- src/app/login/page.tsx
- src/app/api/schedule/route.ts
- src/app/api/operations/qc/route.ts
- src/app/api/sustainability/route.ts
- src/lib/domain.ts
- src/lib/domain.test.ts
- src/lib/mock-data.ts
- src/lib/experience-data.ts
- src/components/app-shell.tsx
- src/app/globals.css

Legend:
- ✅ Implemented
- ⚠️ Partial
- ❌ Missing

## 1) Resident App Requirements

- ⚠️ Society selection with geofenced search and notify-me capture
- ⚠️ OTP validation rules (10-digit Indian mobile, expiry, lockout) implemented in domain logic but not in full auth flow
- ❌ Returning/new user routing after OTP verification
- ❌ Profile setup (name, flat/tower, alternate contact, preferred windows) with validation
- ⚠️ Home/subscription summary and quick links (visual only, static)
- ⚠️ Plan comparison (static table present)
- ❌ Plan detail, billing-cycle selector, auto-renew behavior, payment confirmation flow
- ❌ Upgrade/downgrade/pause/cancel with proration and reason capture
- ⚠️ Slot fallback logic exists in domain/API; scheduling UX is static
- ❌ Recurring pickup toggle/day selection
- ❌ Add-ons and special instructions flow
- ⚠️ Cancellation cutoff logic exists in domain; no fully wired resident action flow
- ⚠️ Order status timeline is visual; not live state machine per order
- ❌ Order detail with itemized receipt, masked operator contact, live map
- ❌ Rate/dispute flow with upload and resolution window
- ⚠️ Billing/invoice visuals exist; no wallet/payment integration
- ❌ Saved payment method management
- ⚠️ Support desk/status shown as static data
- ❌ New ticket creation flow (category/order/photo)
- ❌ Profile/settings (notification controls, language, logout, delete request)
- ⚠️ Sustainability widget is visual/static

## 2) Operations App Requirements

- ❌ Real operator login and mode routing (Unit/Route/Hub)
- ⚠️ Today bookings queue visualized (static)
- ⚠️ Pickup/delivery action buttons exist (not transactional)
- ❌ Garment category/count entry flow
- ⚠️ QR affordance exists (button/FAB), scanner integration missing
- ⚠️ Wash->Dry->Iron->QC visual pipeline present, not persisted workflow
- ✅ QC fail reason enforcement and support ticket flag in API
- ⚠️ Water usage represented in data/UI but no input capture flow
- ✅ Delivery mismatch blocking rule in domain logic
- ❌ Resident OTP/digital signature confirmation on delivery
- ❌ Route mode stop sequencing + summaries
- ❌ Hub worker mode queues and receive/dispatch flows
- ⚠️ Earnings/performance cards visualized (static)
- ❌ Training module access/completion tracking
- ❌ Escalation/report issue workflow
- ⚠️ Offline indicator shown; no local queue + sync engine

## 3) Admin Console Requirements

- ❌ Society onboarding forms and contract workflow
- ❌ Unit upload/verification management
- ❌ Slot/capacity configuration per unit/route
- ⚠️ Women-led impact dashboard visualized; no management CRUD
- ❌ Revenue-share configuration and thresholds
- ❌ Recruitment pipeline tracker
- ⚠️ Unit performance metrics visualized (static)
- ⚠️ Pricing configuration table visualized; no editable config workflow
- ❌ Add-ons/proration/cancellation/promo configuration
- ⚠️ Operations dashboard visualized; no real-time backend state
- ❌ Route performance and garment-loss analytics
- ⚠️ Sustainability dashboard visualized; export workflow not implemented
- ⚠️ Reporting/analytics shown as static modules
- ⚠️ Complaints overview visualized; no unified ticket workflow
- ❌ Refund/credit issuance workflow and approvals
- ❌ Role-based access control implementation
- ❌ Audit logging

## 4) Cross-App + Workflow Requirements

- ❌ Notification matrix implementation (push/SMS/WhatsApp events)
- ✅ Core validation rules implemented and tested (phone/OTP, slot fallback, mismatch block, water-saved calc)
- ❌ Payment timeout reconciliation behavior
- ⚠️ End-to-end workflow represented visually, not fully transactional

## 5) Non-Functional Requirements

- ⚠️ Responsive UX and modern design substantially improved
- ⚠️ Offline resilience is visual only
- ❌ Performance SLO instrumentation and verification
- ❌ Availability architecture/SLO implementation
- ❌ Security hardening for PCI/PII
- ❌ DPDP compliance workflows
- ❌ Localization (English + Hindi)
- ❌ Scale architecture validation

## 6) Third-Party Integrations

- ❌ Payment gateway integration
- ❌ SMS/WhatsApp integration
- ❌ Push notification integration
- ❌ Real maps/navigation integration (current map is custom visual)
- ❌ Native QR scanner integration
- ❌ Telemetry ingestion for machine water-usage

## 7) Brand/Website Document Alignment

- ⚠️ Brand palette and visual direction largely aligned in app
- ⚠️ Women-led and sustainability storytelling strongly represented
- ❌ Standalone marketing website IA pages (Plans, For Societies, Our Story, How It Works, Contact/Join)
- ❌ RWA conversion flows (proposal download, demo request form, WhatsApp CTA)
- ❌ Formal logo/asset system rollout

## Prioritized Backlog

### P0 (Critical Functional MVP)
1. Implement real OTP auth + sessions + role routing (resident/operator/admin).
2. Build persistence layer for societies, residents, subscriptions, orders, batches, tickets.
3. Complete resident transactional flows: onboarding/profile, recurring scheduling, add-ons, disputes.
4. Complete operations transactional flows: garment logging, QR scan/generation, status progression, delivery confirmation.
5. Complete admin workflows: society onboarding, unit management, slot capacity, ticket queue, RBAC.

### P1 (High Business Value)
1. Integrate payments (gateway, wallet, saved methods, invoices, subscription lifecycle actions).
2. Implement notification matrix via push/SMS/WhatsApp.
3. Build support workflow engine with SLA, refunds/credits, and approvals.
4. Implement route/hub operational modes.
5. Implement exportable sustainability reporting with unit-level drilldowns.

### P2 (Scale, Compliance, Investor Hardening)
1. Add localization (English/Hindi), accessibility hardening, and DPDP flows.
2. Add SLO observability for performance, freshness, reliability.
3. Add advanced analytics (churn/ARPU/unit economics/garment risk per 1k).
4. Integrate real map provider with interactive overlays.
5. Add training modules and operator escalation workflows.

## Final Status Summary

Current state is a strong investor-demo UI foundation plus tested domain validation utilities.

It is not yet a complete production operations platform because most transactional workflows,
integrations, security/compliance controls, and role-secure backend capabilities are still partial or missing.
