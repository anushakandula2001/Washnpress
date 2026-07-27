import { requireResident } from "@/backend/api/guards";
import { findActiveSubscription } from "@/backend/repositories/subscriptions";
import { listPaymentMethods, listBillingInvoices, getSustainabilitySummary } from "@/backend/repositories/billing";
import { toSubscriptionResponse, formatPaymentExpiry } from "@/backend/api/transformers";
import { ok, unauthorized, notFound } from "@/backend/api/response";

export async function GET(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const session = auth.session;

  const subscription = await findActiveSubscription(session.residentId!);
  if (!subscription) return notFound("No active subscription");

  const [payments, invoices, waterLogs] = await Promise.all([
    listPaymentMethods(session.residentId!),
    listBillingInvoices(session.residentId!),
    getSustainabilitySummary(session.residentId!),
  ]);

  const sub = toSubscriptionResponse(subscription);
  const garmentsLeft = Math.max(0, sub.garmentCap - sub.garmentsUsed);

  let totalSavedLiters = 0;
  for (const log of waterLogs) {
    const baseline = log.garment_count * parseFloat(log.baseline_liters_per_garment);
  const saved = baseline - parseFloat(log.actual_liters_used);
    totalSavedLiters += Math.max(0, saved);
  }

  const amountSaved = Math.round(sub.garmentsUsed * 13.5);
  const carbonReduced = Number((totalSavedLiters * 0.029).toFixed(1));

  return ok({
    subscription: sub,
    usageStats: {
      garmentsUsed: sub.garmentsUsed,
      garmentCap: sub.garmentCap,
      garmentsLeft,
      amountSaved,
      waterSavedLiters: Math.round(totalSavedLiters),
      carbonReducedKg: carbonReduced,
    },
    paymentMethods: payments.map((p) => ({
      id: p.id,
      brand: p.brand,
      last4: p.last4,
      expiry: formatPaymentExpiry(p.expiry_month, p.expiry_year),
      isDefault: p.is_default,
    })),
    billingHistory: invoices.map((inv) => ({
      id: inv.id,
      month: inv.billing_month,
      date: new Date(inv.billed_on).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      amount: parseFloat(inv.amount_inr),
      status: inv.status.charAt(0).toUpperCase() + inv.status.slice(1),
    })),
  });
}
