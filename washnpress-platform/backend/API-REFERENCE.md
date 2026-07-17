# Wash N Press — API Reference

Base URL: `http://localhost:3000`  
Total endpoints: **91 route handlers**

All endpoints return JSON unless noted. In development, resident APIs auto-authenticate as demo user `9876543210`.

---

## System
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/health` | No |

## Auth & Onboarding
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/otp/send` | Send OTP |
| POST | `/api/auth/otp/verify` | Verify OTP, create session |
| POST | `/api/auth/logout` | Destroy session |
| GET | `/api/auth/me` | Current user |
| GET | `/api/auth/check-phone?phone=` | New vs returning user |
| POST | `/api/auth/onboarding` | Complete resident profile |

## Societies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/societies` | List societies |
| GET | `/api/societies/nearby?lat=&lng=` | Geofenced search |
| POST | `/api/societies/notify-me` | Coming-soon interest |

## Subscription & Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscription` | Active plan + usage + billing |
| GET | `/api/subscription/plans` | All plans |
| GET | `/api/subscription/plans/:id` | Plan detail |
| POST | `/api/subscription/subscribe` | New subscription |
| POST | `/api/subscription/upgrade` | Upgrade plan |
| POST | `/api/subscription/downgrade` | Downgrade plan |
| POST | `/api/subscription/pause` | Pause (`?action=resume`) |
| POST | `/api/subscription/cancel` | Cancel |
| PATCH | `/api/subscription/auto-renew` | Toggle auto-renew |
| GET | `/api/billing/invoices` | Paginated invoices |
| GET | `/api/billing/invoices/:id` | Invoice detail |
| GET | `/api/billing/invoices/:id/pdf` | Download invoice (HTML) |

## Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/payments/methods` | List / add card |
| PATCH/DELETE | `/api/payments/methods/:id` | Default / remove |
| POST | `/api/payments/charge` | Charge payment |
| POST | `/api/payments/webhook` | Gateway callback |

## Orders (Resident)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List orders |
| GET | `/api/orders/:id` | Order detail |
| GET | `/api/orders/:id/tracking` | Timeline events |
| GET | `/api/orders/:id/receipt` | Itemized receipt |
| GET | `/api/orders/:id/operator` | Masked operator contact |
| POST | `/api/orders/:id/addons` | Attach add-ons |
| POST | `/api/orders/:id/instructions` | Special instructions |
| POST | `/api/orders/:id/rate` | Rate service |
| POST | `/api/orders/:id/dispute` | Open dispute |

## Pickups
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/pickups` | Next pickup / book |
| PATCH/DELETE | `/api/pickups/:id` | Reschedule / cancel |
| PATCH | `/api/pickups/:id/recurring` | Recurring toggle |
| POST | `/api/schedule` | Find slot (legacy) |

## Wallet & Referrals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/wallet` | Balance / top-up |
| GET | `/api/wallet/transactions` | Paginated history |
| POST | `/api/wallet/withdraw` | Withdraw |
| GET | `/api/referrals/code` | Referral code |
| POST | `/api/referrals/apply` | Apply code |
| GET | `/api/referrals/history` | Earnings history |

## Support & Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/support/tickets` | List / create |
| GET | `/api/support/tickets/:id` | Detail + messages |
| POST | `/api/support/tickets/:id/reply` | Reply |
| POST | `/api/support/tickets/:id/upload` | Attachment |
| GET/PUT | `/api/resident/profile` | Profile |
| GET/PATCH | `/api/profile/settings` | Notification prefs |
| DELETE | `/api/profile/account` | Deletion request |
| GET | `/api/impact` | Sustainability dashboard |

## Notifications & Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PATCH | `/api/notifications` | List / mark read |
| POST | `/api/notifications/register` | Push token |
| POST | `/api/webhooks/sms` | SMS status |
| POST | `/api/webhooks/whatsapp` | WhatsApp status |
| GET | `/api/sustainability` | Water savings summary |
| GET | `/api/addons` | Add-on services |
| GET | `/api/maps/route?routeId=` | Delivery route |

---

## Operations App (operator role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/operations/auth/login` | Operator login |
| GET | `/api/operations/queue` | Today's queue |
| GET | `/api/operations/orders/:id` | Order view |
| PATCH | `/api/operations/orders/:id/status` | Update status |
| POST | `/api/operations/orders/:id/garments` | Garment counts |
| POST | `/api/operations/orders/:id/scan-qr` | QR scan |
| POST | `/api/operations/orders/:id/water` | Water log |
| POST | `/api/operations/orders/:id/deliver` | Confirm delivery |
| POST | `/api/operations/orders/:id/otp-verify` | Resident OTP |
| POST | `/api/operations/qc` | QC pass/fail |
| GET | `/api/operations/routes` | Active routes |
| PATCH | `/api/operations/routes/:id/stop-order` | Reorder stops |
| GET | `/api/operations/hub/queue` | Hub queue |
| GET | `/api/operations/earnings` | Earnings |
| POST | `/api/operations/issues` | Report issue |
| POST | `/api/operations/sync` | Offline sync |

## Admin Console (admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/societies` | Onboard society |
| PATCH | `/api/admin/societies/:id` | Update society |
| GET/POST | `/api/admin/units` | List / create units |
| PATCH | `/api/admin/units/:id` | Update unit |
| GET/POST | `/api/admin/slots` | Slot config |
| PATCH | `/api/admin/pricing` | Plan pricing |
| PATCH | `/api/admin/addons` | Add-on pricing |
| GET | `/api/admin/analytics/revenue` | Revenue analytics |
| GET | `/api/admin/analytics/operations` | Ops analytics |
| GET | `/api/admin/analytics/sustainability` | ESG analytics |
| GET | `/api/admin/complaints` | All tickets |
| POST | `/api/admin/refunds` | Issue refund |
| GET | `/api/admin/audit-logs` | Audit trail |
| GET | `/api/admin/users` | User list |
| PATCH | `/api/admin/users/:id/roles` | Role management |

---

## Dev demo accounts
| Phone | Role |
|-------|------|
| 9876543210 | Resident |
| 9876500002 | Operator |
| 9876500001 | Admin |
