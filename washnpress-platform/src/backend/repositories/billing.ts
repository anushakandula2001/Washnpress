import { query } from "@/backend/db/pool";
import type { DbPaymentMethod, DbBillingInvoice, DbAddon, DbNotification } from "@/backend/types";

export async function listPaymentMethods(residentId: string) {
  const result = await query<DbPaymentMethod>(
    `SELECT id, brand, last4, expiry_month, expiry_year, is_default
     FROM payment_methods WHERE resident_id = $1 ORDER BY is_default DESC`,
    [residentId],
  );
  return result.rows;
}

export async function listBillingInvoices(residentId: string) {
  const result = await query<DbBillingInvoice>(
    `SELECT id, invoice_code, billing_month, billed_on::text, amount_inr, status
     FROM billing_invoices WHERE resident_id = $1 ORDER BY billed_on DESC`,
    [residentId],
  );
  return result.rows;
}

export async function listAddons() {
  const result = await query<DbAddon>(
    `SELECT id, code, name, description, price_inr, icon
     FROM addon_services WHERE is_active = TRUE ORDER BY price_inr ASC`,
  );
  return result.rows;
}

export async function listNotifications(residentId: string) {
  const result = await query<DbNotification>(
    `SELECT id, title, body, is_read, created_at
     FROM notifications WHERE resident_id = $1 ORDER BY created_at DESC LIMIT 20`,
    [residentId],
  );
  return result.rows;
}

export async function markNotificationRead(notificationId: string, residentId: string) {
  await query(
    `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND resident_id = $2`,
    [notificationId, residentId],
  );
}

export async function getSustainabilitySummary(residentId: string) {
  const result = await query<{
    garment_count: number;
    actual_liters_used: string;
    baseline_liters_per_garment: string;
  }>(
    `SELECT wl.garment_count, wl.actual_liters_used, wl.baseline_liters_per_garment
     FROM water_logs wl
     JOIN orders o ON o.id = wl.order_id
     JOIN pickups p ON p.id = o.pickup_id
     WHERE p.resident_id = $1`,
    [residentId],
  );

  return result.rows;
}
