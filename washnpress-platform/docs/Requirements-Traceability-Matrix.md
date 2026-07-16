# Requirements Traceability Matrix (RTM)

Source documents:
- d:/WashNPress/WashNPress_DPR_Functional.txt
- d:/WashNPress/WashNPress_App_Functional_Spec.txt
- d:/WashNPress/WashNPress_Brand_Website.txt

Legend:
- ✅ Fully Implemented
- ⚠️ Partially Implemented
- ❌ Missing

## A. Resident App Requirements

| Requirement ID | Requirement | Status | Evidence |
|---|---|---|---|
| RES-01 | Society selection with search/geofence and notify-me capture | ⚠️ | Route exists but no dedicated society onboarding flow implemented |
| RES-02 | Mobile + OTP sign in with validation, expiry, lockout | ⚠️ | Rules in src/lib/domain.ts; login UI only in src/app/login/page.tsx |
| RES-03 | Returning user to Home, new user to Profile Setup | ❌ | No profile setup or branching logic |
| RES-04 | Profile setup with unit validation and alternate contact | ❌ | No persisted profile workflow |
| RES-05 | Home subscription summary and quick links | ⚠️ | Visual implementation in src/app/resident/page.tsx, static data |
| RES-06 | Plan comparison and plan detail with billing cycle and auto-renew | ⚠️ | Plan table present; no transactional selection/payment |
| RES-07 | Upgrade/downgrade/pause/cancel with proration | ❌ | Not implemented as actionable backend flow |
| RES-08 | Slot selection by society capacity | ⚠️ | choosePickupSlot logic + /api/schedule exists; UI not end-to-end wired |
| RES-09 | Recurring pickup and proactive reschedule on capacity change | ❌ | Not implemented |
| RES-10 | Add-ons and special instructions | ❌ | Mentioned in content only |
| RES-11 | Order lifecycle timeline | ⚠️ | Visual lifecycle widget with static values |
| RES-12 | Itemized receipt, masked contact, live map | ❌ | Not implemented as working feature |
| RES-13 | Rating and dispute with photo upload within 48h | ❌ | Not implemented |
| RES-14 | Wallet, invoices, saved payment methods | ⚠️ | Billing table shown, no real wallet/payment methods |
| RES-15 | Support ticketing with SLA | ⚠️ | Static support cards only |
| RES-16 | Profile/settings, language, notification toggles, deletion request | ❌ | Not implemented |
| RES-17 | Sustainability widget for residents | ⚠️ | Sustainability metrics displayed from static datasets |

## B. Operations App Requirements

| Requirement ID | Requirement | Status | Evidence |
|---|---|---|---|
| OPS-01 | Login and mode routing (unit/route/hub) | ❌ | No functional auth and no mode routing |
| OPS-02 | Unit-mode daily bookings view | ⚠️ | Queue visible in src/app/operations/page.tsx; static |
| OPS-03 | Pickup garment logging with category/count | ❌ | No persisted pickup form workflow |
| OPS-04 | QR tagging at pickup and scan through lifecycle | ⚠️ | QR UI affordance only |
| OPS-05 | Wash->Dry->Iron->QC pipeline logging | ⚠️ | Pipeline shown visually; no transactional writes |
| OPS-06 | QC fail requires reason and support ticket | ✅ | Enforced in src/app/api/operations/qc/route.ts |
| OPS-07 | Water usage log per cycle (manual/telemetry) | ❌ | No operator input workflow |
| OPS-08 | Delivery mismatch blocks completion | ✅ | Rule in src/lib/domain.ts and shown in operations page |
| OPS-09 | Delivery confirmation OTP/signature | ❌ | Not implemented |
| OPS-10 | Route mode and turn-by-turn stop flow | ❌ | Not implemented |
| OPS-11 | Hub mode receive/process/dispatch | ❌ | Not implemented |
| OPS-12 | Earnings dashboard and performance metrics | ⚠️ | Visual cards present, static |
| OPS-13 | Training modules and completion tracking | ❌ | Not implemented |
| OPS-14 | Escalation flow to ops manager | ❌ | Not implemented |
| OPS-15 | Offline queue and sync behavior | ⚠️ | Offline banner shown; no sync engine |

## C. Admin Console Requirements

| Requirement ID | Requirement | Status | Evidence |
|---|---|---|---|
| ADM-01 | Society profile, contracts, slot capacity setup | ❌ | No forms/workflow |
| ADM-02 | Unit upload/manual resident unit verification | ❌ | Not implemented |
| ADM-03 | Women-led unit profile and training status | ⚠️ | Impact metrics displayed, no CRUD |
| ADM-04 | Revenue-share config per unit | ❌ | Not implemented |
| ADM-05 | Recruitment pipeline tracker | ❌ | Not implemented |
| ADM-06 | Unit performance dashboard | ⚠️ | Static metrics shown |
| ADM-07 | Tier/pricing/add-on/promo configuration | ⚠️ | Pricing table view only |
| ADM-08 | Real-time operations dashboard | ⚠️ | Dashboard visuals, no live data pipeline |
| ADM-09 | Sustainability dashboard with export | ⚠️ | Metrics shown; export absent |
| ADM-10 | Business reports (subscription/revenue/economics/social/sustainability) | ⚠️ | Visual dashboards only |
| ADM-11 | Complaints/support workflow and refunds | ❌ | Not implemented |
| ADM-12 | RBAC and audit logging | ❌ | Not implemented |

## D. Cross-App and NFR Requirements

| Requirement ID | Requirement | Status | Evidence |
|---|---|---|---|
| X-01 | Notification matrix across lifecycle events | ❌ | No push/SMS/WhatsApp integration |
| X-02 | Validations for phone, OTP, slot fallback, mismatch blocking | ✅ | src/lib/domain.ts + src/lib/domain.test.ts |
| X-03 | Payment timeout reconciliation | ❌ | Not implemented |
| X-04 | QR fallback manual entry logging | ❌ | Not implemented |
| NFR-01 | Responsive UX and modern UI | ✅ | Implemented across pages/components |
| NFR-02 | Offline action caching/sync | ❌ | Not implemented |
| NFR-03 | Security, privacy, and compliance controls | ❌ | Major controls absent |
| NFR-04 | Performance/reliability observability | ❌ | No telemetry stack |
| NFR-05 | Localization English/Hindi | ❌ | Not implemented |

## E. Brand/Website Requirements

| Requirement ID | Requirement | Status | Evidence |
|---|---|---|---|
| BR-01 | Aqua/teal brand direction in product UI | ✅ | globals.css theme tokens align with brand palette |
| BR-02 | Women-led and sustainability storytelling | ✅ | Home/Admin content and impact modules |
| BR-03 | Marketing website IA: Home/Plans/Societies/Story/HowItWorks/Contact | ❌ | Separate marketing site pages not implemented |
| BR-04 | RWA conversion CTAs (proposal/demo/WhatsApp) | ❌ | Not implemented |
| BR-05 | Finalized logo system and assets rollout | ❌ | Not implemented as brand asset package |

## Summary
- ✅ Fully Implemented: 7
- ⚠️ Partially Implemented: 21
- ❌ Missing: 27

Interpretation:
- Core validation logic and investor-demo UX are strong.
- Production-grade operations platform requirements remain largely pending and should drive backlog priorities.
