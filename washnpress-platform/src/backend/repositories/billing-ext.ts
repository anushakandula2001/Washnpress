import { query, queryOne } from "@/backend/db/pool";

export async function listInvoices(residentId: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const result = await query(
    `SELECT id, invoice_code, billing_month, billed_on::text, amount_inr::float, status
     FROM billing_invoices WHERE resident_id = $1
     ORDER BY billed_on DESC LIMIT $2 OFFSET $3`,
    [residentId, limit, offset],
  );
  const count = await queryOne<{ total: string }>(
    `SELECT COUNT(*)::text AS total FROM billing_invoices WHERE resident_id = $1`,
    [residentId],
  );
  return { invoices: result.rows, total: parseInt(count?.total ?? "0", 10), page, limit };
}

export async function findInvoiceById(invoiceId: string, residentId?: string) {
  const params: unknown[] = [invoiceId];
  let sql = `SELECT * FROM billing_invoices WHERE id = $1`;
  if (residentId) {
    sql += ` AND resident_id = $2`;
    params.push(residentId);
  }
  return queryOne(sql, params);
}

export async function addPaymentMethod(data: {
  residentId: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault?: boolean;
}) {
  if (data.isDefault) {
    await query(`UPDATE payment_methods SET is_default = FALSE WHERE resident_id = $1`, [
      data.residentId,
    ]);
  }
  return queryOne(
    `INSERT INTO payment_methods (resident_id, brand, last4, expiry_month, expiry_year, is_default)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.residentId, data.brand, data.last4, data.expiryMonth, data.expiryYear, data.isDefault ?? false],
  );
}

export async function deletePaymentMethod(id: string, residentId: string) {
  await query(`DELETE FROM payment_methods WHERE id = $1 AND resident_id = $2`, [id, residentId]);
}

export async function setDefaultPaymentMethod(id: string, residentId: string) {
  await query(`UPDATE payment_methods SET is_default = FALSE WHERE resident_id = $1`, [residentId]);
  await query(`UPDATE payment_methods SET is_default = TRUE WHERE id = $1 AND resident_id = $2`, [
    id,
    residentId,
  ]);
}

export async function createPaymentCharge(data: {
  residentId: string;
  amountInr: number;
  type: string;
  gatewayRef?: string;
  metadata?: Record<string, unknown>;
}) {
  return queryOne(
    `INSERT INTO payment_transactions (resident_id, amount_inr, type, status, gateway_ref, metadata)
     VALUES ($1, $2, $3, 'success', $4, $5::jsonb) RETURNING *`,
    [data.residentId, data.amountInr, data.type, data.gatewayRef ?? null, JSON.stringify(data.metadata ?? {})],
  );
}

export async function processPaymentWebhook(payload: Record<string, unknown>) {
  const ref = payload.reference as string | undefined;
  if (!ref) return null;
  await query(
    `UPDATE payment_transactions SET status = 'success', metadata = metadata || $2::jsonb
     WHERE gateway_ref = $1`,
    [ref, JSON.stringify(payload)],
  );
  return { processed: true, reference: ref };
}
