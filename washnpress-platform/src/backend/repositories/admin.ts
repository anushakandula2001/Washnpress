import { query, queryOne } from "@/backend/db/pool";

export async function createSociety(data: {
  name: string;
  addressLine1?: string;
  city: string;
  state: string;
  pincode?: string;
  status?: string;
}) {
  return queryOne(
    `INSERT INTO societies (name, address_line_1, city, state, pincode, status)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.name, data.addressLine1 ?? null, data.city, data.state, data.pincode ?? null, data.status ?? "active"],
  );
}

export async function updateSociety(id: string, data: Record<string, unknown>) {
  return queryOne(
    `UPDATE societies SET
       name = COALESCE($2, name),
       address_line_1 = COALESCE($3, address_line_1),
       city = COALESCE($4, city),
       state = COALESCE($5, state),
       pincode = COALESCE($6, pincode),
       status = COALESCE($7, status),
       updated_at = now()
     WHERE id = $1 RETURNING *`,
    [id, data.name, data.addressLine1, data.city, data.state, data.pincode, data.status],
  );
}

export async function listUnits(societyId?: string) {
  const params: unknown[] = [];
  let sql = `SELECT u.*, s.name AS society_name FROM units u JOIN societies s ON s.id = u.society_id`;
  if (societyId) {
    sql += ` WHERE u.society_id = $1`;
    params.push(societyId);
  }
  sql += ` ORDER BY s.name, u.unit_code`;
  return (await query(sql, params)).rows;
}

export async function createUnit(data: {
  societyId: string;
  unitCode: string;
  equipmentModel?: string;
  waterRecyclingEnabled?: boolean;
  baseDrawInr?: number;
  revenueSharePercent?: number;
}) {
  return queryOne(
    `INSERT INTO units (society_id, unit_code, equipment_model, water_recycling_enabled, base_draw_inr, revenue_share_percent)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      data.societyId,
      data.unitCode,
      data.equipmentModel ?? null,
      data.waterRecyclingEnabled ?? false,
      data.baseDrawInr ?? 0,
      data.revenueSharePercent ?? 0,
    ],
  );
}

export async function updateUnit(id: string, data: Record<string, unknown>) {
  return queryOne(
    `UPDATE units SET
       unit_code = COALESCE($2, unit_code),
       equipment_model = COALESCE($3, equipment_model),
       water_recycling_enabled = COALESCE($4, water_recycling_enabled),
       base_draw_inr = COALESCE($5, base_draw_inr),
       revenue_share_percent = COALESCE($6, revenue_share_percent),
       status = COALESCE($7, status),
       updated_at = now()
     WHERE id = $1 RETURNING *`,
    [id, data.unitCode, data.equipmentModel, data.waterRecyclingEnabled, data.baseDrawInr, data.revenueSharePercent, data.status],
  );
}

export async function listAdminSlots(societyId?: string) {
  const params: unknown[] = [];
  let sql = `SELECT ps.*, s.name AS society_name FROM pickup_slots ps JOIN societies s ON s.id = ps.society_id`;
  if (societyId) {
    sql += ` WHERE ps.society_id = $1`;
    params.push(societyId);
  }
  sql += ` ORDER BY ps.slot_date DESC, ps.start_time`;
  return (await query(sql, params)).rows;
}

export async function createSlot(data: {
  societyId: string;
  slotDate: string;
  slotWindow: string;
  startTime: string;
  endTime: string;
  capacityTotal: number;
}) {
  return queryOne(
    `INSERT INTO pickup_slots (society_id, slot_date, slot_window, start_time, end_time, capacity_total, capacity_remaining)
     VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING *`,
    [data.societyId, data.slotDate, data.slotWindow, data.startTime, data.endTime, data.capacityTotal],
  );
}

export async function updatePlanPricing(planId: string, monthlyInr: number) {
  return queryOne(
    `UPDATE plans SET monthly_inr = $2 WHERE id = $1 RETURNING *`,
    [planId, monthlyInr],
  );
}

export async function updateAddonPricing(addonId: string, priceInr: number) {
  return queryOne(
    `UPDATE addon_services SET price_inr = $2 WHERE id = $1 RETURNING *`,
    [addonId, priceInr],
  );
}

export async function getRevenueAnalytics() {
  const subs = await queryOne<{ mrr: string }>(
    `SELECT COALESCE(SUM(p.monthly_inr), 0)::text AS mrr
     FROM subscriptions s JOIN plans p ON p.id = s.plan_id WHERE s.status = 'active'`,
  );
  const invoices = await queryOne<{ total: string }>(
    `SELECT COALESCE(SUM(amount_inr), 0)::text AS total FROM billing_invoices WHERE status = 'paid'`,
  );
  return { mrr: parseFloat(subs?.mrr ?? "0"), totalBilled: parseFloat(invoices?.total ?? "0") };
}

export async function getOperationsAnalytics() {
  const result = await queryOne<{ total: string; delivered: string; in_progress: string }>(
    `SELECT COUNT(*)::text AS total,
            COUNT(*) FILTER (WHERE status = 'Delivered')::text AS delivered,
            COUNT(*) FILTER (WHERE status NOT IN ('Delivered', 'Scheduled'))::text AS in_progress
     FROM orders`,
  );
  return {
    totalOrders: parseInt(result?.total ?? "0", 10),
    delivered: parseInt(result?.delivered ?? "0", 10),
    inProgress: parseInt(result?.in_progress ?? "0", 10),
  };
}

export async function getSustainabilityAnalytics() {
  const result = await queryOne<{ saved: string; garments: string }>(
    `SELECT COALESCE(SUM(garment_count * baseline_liters_per_garment - actual_liters_used), 0)::text AS saved,
            COALESCE(SUM(garment_count), 0)::text AS garments
     FROM water_logs`,
  );
  return {
    waterSavedLiters: Math.round(parseFloat(result?.saved ?? "0")),
    garmentsProcessed: parseInt(result?.garments ?? "0", 10),
  };
}

export async function listComplaints() {
  return (await query(`SELECT * FROM support_tickets ORDER BY created_at DESC LIMIT 50`)).rows;
}

export async function createRefund(data: {
  residentId: string;
  orderId?: string;
  amountInr: number;
  reason: string;
  approvedBy?: string;
}) {
  return queryOne(
    `INSERT INTO refunds (resident_id, order_id, amount_inr, reason, status, approved_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.residentId, data.orderId ?? null, data.amountInr, data.reason, data.approvedBy ? "approved" : "pending", data.approvedBy ?? null],
  );
}

export async function listAuditLogs(limit = 50) {
  return (await query(`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1`, [limit])).rows;
}

export async function listUsers() {
  return (
    await query(
      `SELECT u.id, u.phone, u.full_name, u.status,
              COALESCE(array_agg(DISTINCT ro.name) FILTER (WHERE ro.name IS NOT NULL), '{}') AS roles
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles ro ON ro.id = ur.role_id
       GROUP BY u.id ORDER BY u.created_at DESC`,
    )
  ).rows;
}

export async function updateUserRoles(userId: string, roleNames: string[]) {
  await query(`DELETE FROM user_roles WHERE user_id = $1`, [userId]);
  for (const name of roleNames) {
    await query(
      `INSERT INTO user_roles (user_id, role_id)
       SELECT $1, id FROM roles WHERE name = $2 ON CONFLICT DO NOTHING`,
      [userId, name],
    );
  }
  const users = await listUsers();
  return users.find((u) => (u as { id: string }).id === userId);
}

export async function logAudit(data: {
  actorUserId?: string;
  actorRole?: string;
  action: string;
  entityName: string;
  entityId?: string;
  beforeState?: unknown;
  afterState?: unknown;
}) {
  return queryOne(
    `INSERT INTO audit_logs (actor_user_id, actor_role, action, entity_name, entity_id, before_state, after_state)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb) RETURNING id`,
    [
      data.actorUserId ?? null,
      data.actorRole ?? null,
      data.action,
      data.entityName,
      data.entityId ?? null,
      data.beforeState ? JSON.stringify(data.beforeState) : null,
      data.afterState ? JSON.stringify(data.afterState) : null,
    ],
  );
}
