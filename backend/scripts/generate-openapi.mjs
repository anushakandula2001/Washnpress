#!/usr/bin/env node
/**
 * Generates OpenAPI 3.1 spec for all Wash N Press API routes.
 * Run: npm run openapi:generate
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");

const tags = [
  { name: "System", description: "Health and status" },
  { name: "Auth", description: "OTP login and onboarding" },
  { name: "Societies", description: "Society search and notify-me" },
  { name: "Subscription", description: "Plans and subscription management" },
  { name: "Billing", description: "Invoices and billing history" },
  { name: "Payments", description: "Payment methods and charges" },
  { name: "Orders", description: "Resident order management" },
  { name: "Pickups", description: "Pickup scheduling" },
  { name: "Wallet", description: "Wallet and balance" },
  { name: "Referrals", description: "Referral program" },
  { name: "Support", description: "Support tickets" },
  { name: "Profile", description: "Profile and settings" },
  { name: "Notifications", description: "Push notifications" },
  { name: "Addons", description: "Add-on services" },
  { name: "Impact", description: "Sustainability impact" },
  { name: "Webhooks", description: "External webhooks" },
  { name: "Maps", description: "Delivery routing" },
  { name: "Operations", description: "Operator app APIs" },
  { name: "Admin", description: "Admin console APIs" },
];

const components = {
  securitySchemes: {
    sessionCookie: {
      type: "apiKey",
      in: "cookie",
      name: "wnp_session",
      description: "Session cookie set after OTP verify or operator login",
    },
  },
  schemas: {
    Error: {
      type: "object",
      properties: {
        message: { type: "string" },
        errors: { type: "object" },
      },
    },
    HealthResponse: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["healthy", "degraded"] },
        services: {
          type: "object",
          properties: {
            database: { type: "string" },
            redis: { type: "string" },
          },
        },
        timestamp: { type: "string", format: "date-time" },
      },
    },
    PhoneBody: {
      type: "object",
      required: ["phone"],
      properties: {
        phone: { type: "string", pattern: "^[6-9][0-9]{9}$", example: "9876543210" },
      },
    },
    OtpVerifyBody: {
      type: "object",
      required: ["phone", "otp"],
      properties: {
        phone: { type: "string", example: "9876543210" },
        otp: { type: "string", example: "123456" },
      },
    },
    OnboardingBody: {
      type: "object",
      required: ["societyId", "fullName", "unitNumber"],
      properties: {
        societyId: { type: "string", format: "uuid" },
        fullName: { type: "string" },
        unitNumber: { type: "string" },
        towerBlock: { type: "string" },
        alternateContact: { type: "string" },
        preferredWindows: {
          type: "array",
          items: { type: "string", enum: ["Morning", "Afternoon", "Evening"] },
        },
      },
    },
    PlanIdBody: {
      type: "object",
      required: ["planId"],
      properties: { planId: { type: "string", format: "uuid" } },
    },
    TopupBody: {
      type: "object",
      required: ["amount"],
      properties: { amount: { type: "number", example: 500 } },
    },
    QcBody: {
      type: "object",
      required: ["orderId", "pass"],
      properties: {
        orderId: { type: "string", example: "WNP-10021" },
        pass: { type: "boolean" },
        reason: { type: "string" },
      },
    },
    TicketCreateBody: {
      type: "object",
      required: ["category", "description"],
      properties: {
        category: { type: "string" },
        description: { type: "string", minLength: 10 },
        orderId: { type: "string", format: "uuid" },
        priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
      },
    },
    PaymentMethodBody: {
      type: "object",
      required: ["brand", "last4", "expiryMonth", "expiryYear"],
      properties: {
        brand: { type: "string", example: "Visa" },
        last4: { type: "string", example: "3245" },
        expiryMonth: { type: "integer", example: 12 },
        expiryYear: { type: "integer", example: 2028 },
        isDefault: { type: "boolean" },
      },
    },
    ChargeBody: {
      type: "object",
      required: ["amountInr", "type"],
      properties: {
        amountInr: { type: "number", example: 999 },
        type: { type: "string", enum: ["subscription", "order", "wallet_topup"] },
        metadata: { type: "object" },
      },
    },
    BookPickupBody: {
      type: "object",
      required: ["slotId"],
      properties: {
        slotId: { type: "string", format: "uuid" },
        specialInstructions: { type: "string" },
        recurring: { type: "boolean" },
      },
    },
    RateOrderBody: {
      type: "object",
      required: ["rating"],
      properties: {
        rating: { type: "integer", minimum: 1, maximum: 5 },
        comment: { type: "string" },
      },
    },
    SocietyCreateBody: {
      type: "object",
      required: ["name", "city", "state"],
      properties: {
        name: { type: "string" },
        city: { type: "string" },
        state: { type: "string" },
        addressLine1: { type: "string" },
        pincode: { type: "string" },
        status: { type: "string" },
      },
    },
    RefundBody: {
      type: "object",
      required: ["residentId", "amountInr", "reason"],
      properties: {
        residentId: { type: "string", format: "uuid" },
        amountInr: { type: "number" },
        reason: { type: "string" },
        orderId: { type: "string", format: "uuid" },
        approve: { type: "boolean" },
      },
    },
  },
  responses: {
    BadRequest: {
      description: "Validation error",
      content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
    },
    Unauthorized: {
      description: "Unauthorized",
      content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
    },
    NotFound: {
      description: "Not found",
      content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
    },
  },
};

function op(method, summary, opts = {}) {
  const operation = {
    summary,
    tags: opts.tags ?? ["System"],
    responses: {
      "200": { description: "Success" },
      "400": { $ref: "#/components/responses/BadRequest" },
      ...(opts.responses ?? {}),
    },
  };
  if (opts.security !== false) {
    operation.security = opts.security ?? [{ sessionCookie: [] }];
  }
  if (opts.requestBody) operation.requestBody = opts.requestBody;
  if (opts.parameters) operation.parameters = opts.parameters;
  return { [method]: operation };
}

function pathItem(...ops) {
  return Object.assign({}, ...ops);
}

function jsonBody(schemaRef) {
  return {
    required: true,
    content: {
      "application/json": { schema: { $ref: `#/components/schemas/${schemaRef}` } },
    },
  };
}

function idParam(name = "id", desc = "Resource ID") {
  return { name, in: "path", required: true, schema: { type: "string" }, description: desc };
}

const paths = {
  "/api/health": pathItem(
    op("get", "Health check", {
      tags: ["System"],
      security: false,
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/HealthResponse" } },
          },
        },
      },
    }),
  ),
  "/api/auth/otp/send": pathItem(
    op("post", "Send OTP", { tags: ["Auth"], security: false, requestBody: jsonBody("PhoneBody") }),
  ),
  "/api/auth/otp/verify": pathItem(
    op("post", "Verify OTP", {
      tags: ["Auth"],
      security: false,
      requestBody: jsonBody("OtpVerifyBody"),
    }),
  ),
  "/api/auth/logout": pathItem(op("post", "Logout", { tags: ["Auth"] })),
  "/api/auth/me": pathItem(op("get", "Current user", { tags: ["Auth"] })),
  "/api/auth/check-phone": pathItem(
    op("get", "Check if phone is new or returning", {
      tags: ["Auth"],
      security: false,
      parameters: [{ name: "phone", in: "query", required: true, schema: { type: "string" } }],
    }),
  ),
  "/api/auth/onboarding": pathItem(
    op("post", "Complete resident onboarding", {
      tags: ["Auth"],
      requestBody: jsonBody("OnboardingBody"),
    }),
  ),
  "/api/societies": pathItem(
    op("get", "List societies", {
      tags: ["Societies"],
      security: false,
      parameters: [{ name: "city", in: "query", schema: { type: "string" } }],
    }),
  ),
  "/api/societies/nearby": pathItem(
    op("get", "Nearby societies (geofenced)", {
      tags: ["Societies"],
      security: false,
      parameters: [
        { name: "lat", in: "query", required: true, schema: { type: "number" } },
        { name: "lng", in: "query", required: true, schema: { type: "number" } },
        { name: "radiusKm", in: "query", schema: { type: "number", default: 5 } },
      ],
    }),
  ),
  "/api/societies/notify-me": pathItem(
    op("post", "Notify me when society is available", {
      tags: ["Societies"],
      security: false,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["societyName", "phone"],
              properties: {
                societyName: { type: "string" },
                phone: { type: "string" },
                city: { type: "string" },
                pincode: { type: "string" },
              },
            },
          },
        },
      },
    }),
  ),
  "/api/subscription": pathItem(
    op("get", "Active subscription with usage and billing", { tags: ["Subscription"] }),
  ),
  "/api/subscription/plans": pathItem(op("get", "List all plans", { tags: ["Subscription"] })),
  "/api/subscription/plans/{id}": pathItem(
    op("get", "Get plan by ID", {
      tags: ["Subscription"],
      parameters: [idParam("id", "Plan UUID")],
    }),
  ),
  "/api/subscription/subscribe": pathItem(
    op("post", "Subscribe to a plan", { tags: ["Subscription"], requestBody: jsonBody("PlanIdBody") }),
  ),
  "/api/subscription/upgrade": pathItem(
    op("post", "Upgrade plan", { tags: ["Subscription"], requestBody: jsonBody("PlanIdBody") }),
  ),
  "/api/subscription/downgrade": pathItem(
    op("post", "Downgrade plan", { tags: ["Subscription"], requestBody: jsonBody("PlanIdBody") }),
  ),
  "/api/subscription/pause": pathItem(
    op("post", "Pause or resume subscription", {
      tags: ["Subscription"],
      parameters: [
        { name: "action", in: "query", schema: { type: "string", enum: ["pause", "resume"] } },
      ],
    }),
  ),
  "/api/subscription/cancel": pathItem(op("post", "Cancel subscription", { tags: ["Subscription"] })),
  "/api/subscription/auto-renew": pathItem(
    op("patch", "Toggle auto-renew", {
      tags: ["Subscription"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { type: "object", properties: { autoRenew: { type: "boolean" } } },
          },
        },
      },
    }),
  ),
  "/api/billing/invoices": pathItem(
    op("get", "List billing invoices", {
      tags: ["Billing"],
      parameters: [
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
      ],
    }),
  ),
  "/api/billing/invoices/{id}": pathItem(
    op("get", "Get invoice detail", { tags: ["Billing"], parameters: [idParam()] }),
  ),
  "/api/billing/invoices/{id}/pdf": pathItem(
    op("get", "Download invoice as HTML", {
      tags: ["Billing"],
      parameters: [idParam()],
      responses: {
        "200": {
          description: "HTML invoice",
          content: { "text/html": { schema: { type: "string" } } },
        },
      },
    }),
  ),
  "/api/payments/methods": pathItem(
    op("get", "List payment methods", { tags: ["Payments"] }),
    op("post", "Add payment method", { tags: ["Payments"], requestBody: jsonBody("PaymentMethodBody") }),
  ),
  "/api/payments/methods/{id}": pathItem(
    op("patch", "Set default payment method", { tags: ["Payments"], parameters: [idParam()] }),
    op("delete", "Remove payment method", { tags: ["Payments"], parameters: [idParam()] }),
  ),
  "/api/payments/charge": pathItem(
    op("post", "Charge payment", { tags: ["Payments"], requestBody: jsonBody("ChargeBody") }),
  ),
  "/api/payments/webhook": pathItem(
    op("post", "Payment gateway webhook", { tags: ["Payments"], security: false }),
  ),
  "/api/orders": pathItem(op("get", "List resident orders", { tags: ["Orders"] })),
  "/api/orders/{id}": pathItem(
    op("get", "Get order by code", {
      tags: ["Orders"],
      parameters: [idParam("id", "Order code e.g. WNP-10021")],
    }),
  ),
  "/api/orders/{id}/tracking": pathItem(
    op("get", "Order tracking timeline", {
      tags: ["Orders"],
      parameters: [idParam("id", "Order code")],
    }),
  ),
  "/api/orders/{id}/receipt": pathItem(
    op("get", "Itemized receipt", { tags: ["Orders"], parameters: [idParam("id", "Order code")] }),
  ),
  "/api/orders/{id}/operator": pathItem(
    op("get", "Masked operator contact", {
      tags: ["Orders"],
      parameters: [idParam("id", "Order code")],
    }),
  ),
  "/api/orders/{id}/addons": pathItem(
    op("post", "Attach add-ons to order", {
      tags: ["Orders"],
      parameters: [idParam("id", "Order code")],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: { addonIds: { type: "array", items: { type: "string", format: "uuid" } } },
            },
          },
        },
      },
    }),
  ),
  "/api/orders/{id}/instructions": pathItem(
    op("post", "Set special instructions", {
      tags: ["Orders"],
      parameters: [idParam("id", "Order code")],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { type: "object", properties: { instructions: { type: "string" } } },
          },
        },
      },
    }),
  ),
  "/api/orders/{id}/rate": pathItem(
    op("post", "Rate order", {
      tags: ["Orders"],
      parameters: [idParam("id", "Order code")],
      requestBody: jsonBody("RateOrderBody"),
    }),
  ),
  "/api/orders/{id}/dispute": pathItem(
    op("post", "Open dispute", {
      tags: ["Orders"],
      parameters: [idParam("id", "Order code")],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["reason"],
              properties: {
                reason: { type: "string" },
                photoUrl: { type: "string", format: "uri" },
              },
            },
          },
        },
      },
    }),
  ),
  "/api/pickups": pathItem(
    op("get", "Get next scheduled pickup", { tags: ["Pickups"] }),
    op("post", "Book a pickup", { tags: ["Pickups"], requestBody: jsonBody("BookPickupBody") }),
  ),
  "/api/pickups/{id}": pathItem(
    op("patch", "Reschedule pickup", {
      tags: ["Pickups"],
      parameters: [idParam()],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { type: "object", properties: { slotId: { type: "string", format: "uuid" } } },
          },
        },
      },
    }),
    op("delete", "Cancel pickup", { tags: ["Pickups"], parameters: [idParam()] }),
  ),
  "/api/pickups/{id}/recurring": pathItem(
    op("patch", "Set recurring pickup", {
      tags: ["Pickups"],
      parameters: [idParam()],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                recurring: { type: "boolean" },
                recurringDay: { type: "string" },
              },
            },
          },
        },
      },
    }),
  ),
  "/api/schedule": pathItem(
    op("post", "Find or book pickup slot", {
      tags: ["Pickups"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                preferredWindows: { type: "array", items: { type: "string" } },
                slotId: { type: "string" },
                book: { type: "boolean" },
              },
            },
          },
        },
      },
    }),
  ),
  "/api/wallet": pathItem(
    op("get", "Wallet balance and transactions", { tags: ["Wallet"] }),
    op("post", "Top up wallet", { tags: ["Wallet"], requestBody: jsonBody("TopupBody") }),
  ),
  "/api/wallet/transactions": pathItem(
    op("get", "Paginated transaction history", {
      tags: ["Wallet"],
      parameters: [{ name: "page", in: "query", schema: { type: "integer", default: 1 } }],
    }),
  ),
  "/api/wallet/withdraw": pathItem(
    op("post", "Withdraw from wallet", { tags: ["Wallet"], requestBody: jsonBody("TopupBody") }),
  ),
  "/api/referrals/code": pathItem(op("get", "Get referral code", { tags: ["Referrals"] })),
  "/api/referrals/apply": pathItem(
    op("post", "Apply referral code", {
      tags: ["Referrals"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { type: "object", properties: { code: { type: "string" } } },
          },
        },
      },
    }),
  ),
  "/api/referrals/history": pathItem(op("get", "Referral earnings history", { tags: ["Referrals"] })),
  "/api/support/tickets": pathItem(
    op("get", "List support tickets", { tags: ["Support"] }),
    op("post", "Create support ticket", {
      tags: ["Support"],
      requestBody: jsonBody("TicketCreateBody"),
    }),
  ),
  "/api/support/tickets/{id}": pathItem(
    op("get", "Ticket detail with messages", { tags: ["Support"], parameters: [idParam()] }),
  ),
  "/api/support/tickets/{id}/reply": pathItem(
    op("post", "Reply to ticket", {
      tags: ["Support"],
      parameters: [idParam()],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { type: "object", properties: { body: { type: "string" } } },
          },
        },
      },
    }),
  ),
  "/api/support/tickets/{id}/upload": pathItem(
    op("post", "Upload attachment", {
      tags: ["Support"],
      parameters: [idParam()],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                fileName: { type: "string" },
                fileUrl: { type: "string", format: "uri" },
              },
            },
          },
        },
      },
    }),
  ),
  "/api/resident/profile": pathItem(
    op("get", "Get resident profile", { tags: ["Profile"] }),
    op("put", "Update resident profile", { tags: ["Profile"] }),
  ),
  "/api/profile/settings": pathItem(
    op("get", "Get profile settings", { tags: ["Profile"] }),
    op("patch", "Update profile settings", { tags: ["Profile"] }),
  ),
  "/api/profile/account": pathItem(op("delete", "Request account deletion", { tags: ["Profile"] })),
  "/api/impact": pathItem(op("get", "Resident sustainability impact", { tags: ["Impact"] })),
  "/api/notifications": pathItem(
    op("get", "List notifications", { tags: ["Notifications"] }),
    op("patch", "Mark notification read", { tags: ["Notifications"] }),
  ),
  "/api/notifications/register": pathItem(
    op("post", "Register push token", {
      tags: ["Notifications"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                token: { type: "string" },
                platform: { type: "string", enum: ["web", "ios", "android"] },
              },
            },
          },
        },
      },
    }),
  ),
  "/api/sustainability": pathItem(
    op("get", "Sustainability summary", { tags: ["Impact"], security: false }),
  ),
  "/api/addons": pathItem(op("get", "List add-on services", { tags: ["Addons"], security: false })),
  "/api/webhooks/sms": pathItem(
    op("post", "SMS delivery webhook", { tags: ["Webhooks"], security: false }),
  ),
  "/api/webhooks/whatsapp": pathItem(
    op("post", "WhatsApp webhook", { tags: ["Webhooks"], security: false }),
  ),
  "/api/maps/route": pathItem(
    op("get", "Delivery route stops", {
      tags: ["Maps"],
      parameters: [
        { name: "routeId", in: "query", required: true, schema: { type: "string", format: "uuid" } },
      ],
    }),
  ),
  "/api/operations/auth/login": pathItem(
    op("post", "Operator/admin login", {
      tags: ["Operations"],
      security: false,
      requestBody: jsonBody("PhoneBody"),
    }),
  ),
  "/api/operations/queue": pathItem(
    op("get", "Today's operations queue", {
      tags: ["Operations"],
      parameters: [{ name: "societyId", in: "query", schema: { type: "string", format: "uuid" } }],
    }),
  ),
  "/api/operations/orders/{id}": pathItem(
    op("get", "Operator order view", {
      tags: ["Operations"],
      parameters: [idParam("id", "Order code")],
    }),
  ),
  "/api/operations/orders/{id}/status": pathItem(
    op("patch", "Update order status", {
      tags: ["Operations"],
      parameters: [idParam("id", "Order code")],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { type: "object", properties: { status: { type: "string" } } },
          },
        },
      },
    }),
  ),
  "/api/operations/orders/{id}/garments": pathItem(
    op("post", "Record garment counts", {
      tags: ["Operations"],
      parameters: [idParam("id", "Order code")],
    }),
  ),
  "/api/operations/orders/{id}/scan-qr": pathItem(
    op("post", "Scan QR batch", {
      tags: ["Operations"],
      parameters: [idParam("id", "Order code")],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { type: "object", properties: { qrCode: { type: "string" } } },
          },
        },
      },
    }),
  ),
  "/api/operations/orders/{id}/water": pathItem(
    op("post", "Log water usage", {
      tags: ["Operations"],
      parameters: [idParam("id", "Order code")],
    }),
  ),
  "/api/operations/orders/{id}/deliver": pathItem(
    op("post", "Confirm delivery", {
      tags: ["Operations"],
      parameters: [idParam("id", "Order code")],
    }),
  ),
  "/api/operations/orders/{id}/otp-verify": pathItem(
    op("post", "Verify resident OTP at delivery", {
      tags: ["Operations"],
      parameters: [idParam("id", "Order code")],
    }),
  ),
  "/api/operations/qc": pathItem(
    op("post", "QC pass/fail decision", { tags: ["Operations"], requestBody: jsonBody("QcBody") }),
  ),
  "/api/operations/routes": pathItem(op("get", "Active delivery routes", { tags: ["Operations"] })),
  "/api/operations/routes/{id}/stop-order": pathItem(
    op("patch", "Reorder route stops", {
      tags: ["Operations"],
      parameters: [idParam()],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: { stopIds: { type: "array", items: { type: "string", format: "uuid" } } },
            },
          },
        },
      },
    }),
  ),
  "/api/operations/hub/queue": pathItem(op("get", "Hub processing queue", { tags: ["Operations"] })),
  "/api/operations/earnings": pathItem(op("get", "Operator earnings", { tags: ["Operations"] })),
  "/api/operations/issues": pathItem(op("post", "Report operator issue", { tags: ["Operations"] })),
  "/api/operations/sync": pathItem(op("post", "Offline sync batch", { tags: ["Operations"] })),
  "/api/admin/societies": pathItem(
    op("post", "Onboard society", { tags: ["Admin"], requestBody: jsonBody("SocietyCreateBody") }),
  ),
  "/api/admin/societies/{id}": pathItem(
    op("patch", "Update society", { tags: ["Admin"], parameters: [idParam()] }),
  ),
  "/api/admin/units": pathItem(
    op("get", "List units", {
      tags: ["Admin"],
      parameters: [{ name: "societyId", in: "query", schema: { type: "string", format: "uuid" } }],
    }),
    op("post", "Create unit", { tags: ["Admin"] }),
  ),
  "/api/admin/units/{id}": pathItem(
    op("patch", "Update unit", { tags: ["Admin"], parameters: [idParam()] }),
  ),
  "/api/admin/slots": pathItem(
    op("get", "List pickup slots", { tags: ["Admin"] }),
    op("post", "Create pickup slot", { tags: ["Admin"] }),
  ),
  "/api/admin/pricing": pathItem(op("patch", "Update plan pricing", { tags: ["Admin"] })),
  "/api/admin/addons": pathItem(op("patch", "Update add-on pricing", { tags: ["Admin"] })),
  "/api/admin/analytics/revenue": pathItem(
    op("get", "Revenue analytics", { tags: ["Admin"] }),
  ),
  "/api/admin/analytics/operations": pathItem(
    op("get", "Operations analytics", { tags: ["Admin"] }),
  ),
  "/api/admin/analytics/sustainability": pathItem(
    op("get", "Sustainability analytics", { tags: ["Admin"] }),
  ),
  "/api/admin/complaints": pathItem(op("get", "All complaints/tickets", { tags: ["Admin"] })),
  "/api/admin/refunds": pathItem(
    op("post", "Create refund", { tags: ["Admin"], requestBody: jsonBody("RefundBody") }),
  ),
  "/api/admin/audit-logs": pathItem(
    op("get", "Audit log trail", {
      tags: ["Admin"],
      parameters: [{ name: "limit", in: "query", schema: { type: "integer", default: 50 } }],
    }),
  ),
  "/api/admin/users": pathItem(op("get", "List users", { tags: ["Admin"] })),
  "/api/admin/users/{id}/roles": pathItem(
    op("patch", "Update user roles", {
      tags: ["Admin"],
      parameters: [idParam("id", "User UUID")],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                roles: {
                  type: "array",
                  items: { type: "string", enum: ["resident", "operator", "admin"] },
                },
              },
            },
          },
        },
      },
    }),
  ),
};

const spec = {
  openapi: "3.1.0",
  info: {
    title: "Wash N Press API",
    version: "1.0.0",
    description:
      "Wash N Press laundry platform REST API.\n\n" +
      "**Authentication:** Session cookie `wnp_session` set after `POST /api/auth/otp/verify` or `POST /api/operations/auth/login`.\n\n" +
      "**Dev demo phones:** Resident `9876543210`, Operator `9876500002`, Admin `9876500001`",
    contact: { name: "Wash N Press Engineering" },
  },
  servers: [
    { url: "http://localhost:3000", description: "Local development" },
    { url: "http://localhost:3001", description: "Local development (alt port)" },
  ],
  tags,
  paths,
  components,
};

const jsonContent = JSON.stringify(spec, null, 2);

writeFileSync(join(root, "backend/api-spec/openapi.json"), jsonContent);
writeFileSync(join(root, "public/openapi.json"), jsonContent);

console.log(`Generated OpenAPI spec with ${Object.keys(paths).length} paths`);
console.log("  backend/api-spec/openapi.json");
console.log("  public/openapi.json");
