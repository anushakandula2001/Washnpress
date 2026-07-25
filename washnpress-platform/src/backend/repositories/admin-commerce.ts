import { query, queryOne, withTransaction } from "@/backend/db/pool";

/* ── Garments ─────────────────────────────────────────── */

export async function listGarments(includeInactive = true) {
  const sql = includeInactive
    ? `SELECT * FROM garment_catalog ORDER BY sort_order, name`
    : `SELECT * FROM garment_catalog WHERE is_active = TRUE ORDER BY sort_order, name`;
  return (await query(sql)).rows;
}

export async function upsertGarment(data: {
  id?: string;
  name: string;
  washPriceInr: number;
  washIronPriceInr: number;
  ironPriceInr: number;
  dryCleanPriceInr: number;
  isActive?: boolean;
  sortOrder?: number;
}) {
  if (data.id) {
    return queryOne(
      `UPDATE garment_catalog SET
         name = $2, wash_price_inr = $3, wash_iron_price_inr = $4,
         iron_price_inr = $5, dry_clean_price_inr = $6,
         is_active = COALESCE($7, is_active),
         sort_order = COALESCE($8, sort_order),
         updated_at = now()
       WHERE id = $1 RETURNING *`,
      [
        data.id,
        data.name.trim(),
        data.washPriceInr,
        data.washIronPriceInr,
        data.ironPriceInr,
        data.dryCleanPriceInr,
        data.isActive ?? null,
        data.sortOrder ?? null,
      ],
    );
  }
  return queryOne(
    `INSERT INTO garment_catalog
       (name, wash_price_inr, wash_iron_price_inr, iron_price_inr, dry_clean_price_inr, is_active, sort_order)
     VALUES ($1,$2,$3,$4,$5,COALESCE($6,TRUE),COALESCE($7,0))
     RETURNING *`,
    [
      data.name.trim(),
      data.washPriceInr,
      data.washIronPriceInr,
      data.ironPriceInr,
      data.dryCleanPriceInr,
      data.isActive ?? true,
      data.sortOrder ?? 0,
    ],
  );
}

export async function deleteGarment(id: string) {
  await query(`DELETE FROM garment_catalog WHERE id = $1`, [id]);
}

export async function setGarmentActive(id: string, isActive: boolean) {
  return queryOne(
    `UPDATE garment_catalog SET is_active = $2, updated_at = now() WHERE id = $1 RETURNING *`,
    [id, isActive],
  );
}

/* ── Addons ───────────────────────────────────────────── */

export async function listAddonsAdmin(includeInactive = true) {
  const sql = includeInactive
    ? `SELECT * FROM addon_services ORDER BY name`
    : `SELECT * FROM addon_services WHERE is_active = TRUE ORDER BY name`;
  return (await query(sql)).rows;
}

export async function upsertAddon(data: {
  id?: string;
  code: string;
  name: string;
  description: string;
  priceInr: number;
  icon?: string;
  isActive?: boolean;
}) {
  if (data.id) {
    return queryOne(
      `UPDATE addon_services SET
         code = $2, name = $3, description = $4, price_inr = $5,
         icon = COALESCE($6, icon), is_active = COALESCE($7, is_active)
       WHERE id = $1 RETURNING *`,
      [
        data.id,
        data.code.trim().toLowerCase().replace(/\s+/g, "_"),
        data.name.trim(),
        data.description,
        data.priceInr,
        data.icon ?? null,
        data.isActive ?? null,
      ],
    );
  }
  return queryOne(
    `INSERT INTO addon_services (code, name, description, price_inr, icon, is_active)
     VALUES ($1,$2,$3,$4,COALESCE($5,'sparkles'),COALESCE($6,TRUE))
     RETURNING *`,
    [
      data.code.trim().toLowerCase().replace(/\s+/g, "_"),
      data.name.trim(),
      data.description,
      data.priceInr,
      data.icon ?? "sparkles",
      data.isActive ?? true,
    ],
  );
}

export async function deleteAddon(id: string) {
  await query(`DELETE FROM addon_services WHERE id = $1`, [id]);
}

export async function setAddonActive(id: string, isActive: boolean) {
  return queryOne(
    `UPDATE addon_services SET is_active = $2 WHERE id = $1 RETURNING *`,
    [id, isActive],
  );
}

/* ── Commerce settings ────────────────────────────────── */

export async function getCommerceSettings() {
  let row = await queryOne(`SELECT * FROM platform_commerce_settings WHERE id = 1`);
  if (!row) {
    await query(`INSERT INTO platform_commerce_settings (id) VALUES (1) ON CONFLICT DO NOTHING`);
    row = await queryOne(`SELECT * FROM platform_commerce_settings WHERE id = 1`);
  }
  return row;
}

export async function updateCommerceSettings(data: {
  minOrderAmountInr?: number;
  deliveryFeeInr?: number;
  freeDeliveryThresholdInr?: number;
  gstPercent?: number;
  serviceTaxPercent?: number;
  otherChargesLabel?: string;
  otherChargesInr?: number;
}) {
  return queryOne(
    `UPDATE platform_commerce_settings SET
       min_order_amount_inr = COALESCE($1, min_order_amount_inr),
       delivery_fee_inr = COALESCE($2, delivery_fee_inr),
       free_delivery_threshold_inr = COALESCE($3, free_delivery_threshold_inr),
       gst_percent = COALESCE($4, gst_percent),
       service_tax_percent = COALESCE($5, service_tax_percent),
       other_charges_label = COALESCE($6, other_charges_label),
       other_charges_inr = COALESCE($7, other_charges_inr),
       updated_at = now()
     WHERE id = 1 RETURNING *`,
    [
      data.minOrderAmountInr ?? null,
      data.deliveryFeeInr ?? null,
      data.freeDeliveryThresholdInr ?? null,
      data.gstPercent ?? null,
      data.serviceTaxPercent ?? null,
      data.otherChargesLabel ?? null,
      data.otherChargesInr ?? null,
    ],
  );
}

/* ── Plans ────────────────────────────────────────────── */

export async function listPlansAdmin(includeInactive = true) {
  const sql = includeInactive
    ? `SELECT * FROM plans ORDER BY monthly_inr`
    : `SELECT * FROM plans WHERE is_active = TRUE ORDER BY monthly_inr`;
  return (await query(sql)).rows;
}

export async function upsertPlan(data: {
  id?: string;
  tier: string;
  name?: string;
  description?: string;
  monthlyInr: number;
  quarterlyInr?: number;
  yearlyInr?: number;
  garmentCap: number;
  maxPickups?: number;
  turnaroundHours?: number;
  priorityPickup?: boolean;
  freeDelivery?: boolean;
  expressDiscountPercent?: number;
  validityDays?: number;
  isActive?: boolean;
}) {
  const name = data.name?.trim() || data.tier;
  if (data.id) {
    return queryOne(
      `UPDATE plans SET
         tier = $2, name = $3, description = $4,
         monthly_inr = $5, quarterly_inr = $6, yearly_inr = $7,
         garment_cap = $8, max_pickups = $9,
         turnaround_hours = COALESCE($10, turnaround_hours),
         priority_pickup = COALESCE($11, priority_pickup),
         free_delivery = COALESCE($12, free_delivery),
         express_discount_percent = COALESCE($13, express_discount_percent),
         validity_days = COALESCE($14, validity_days),
         is_active = COALESCE($15, is_active)
       WHERE id = $1 RETURNING *`,
      [
        data.id,
        data.tier,
        name,
        data.description ?? null,
        data.monthlyInr,
        data.quarterlyInr ?? data.monthlyInr * 3,
        data.yearlyInr ?? data.monthlyInr * 12,
        data.garmentCap,
        data.maxPickups ?? Math.max(4, Math.floor(data.garmentCap / 5)),
        data.turnaroundHours ?? null,
        data.priorityPickup ?? null,
        data.freeDelivery ?? null,
        data.expressDiscountPercent ?? null,
        data.validityDays ?? null,
        data.isActive ?? null,
      ],
    );
  }
  return queryOne(
    `INSERT INTO plans (
       tier, name, description, monthly_inr, quarterly_inr, yearly_inr,
       garment_cap, max_pickups, turnaround_hours, priority_pickup,
       free_delivery, express_discount_percent, validity_days, is_active
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,COALESCE($14,TRUE))
     RETURNING *`,
    [
      data.tier,
      name,
      data.description ?? null,
      data.monthlyInr,
      data.quarterlyInr ?? data.monthlyInr * 3,
      data.yearlyInr ?? data.monthlyInr * 12,
      data.garmentCap,
      data.maxPickups ?? Math.max(4, Math.floor(data.garmentCap / 5)),
      data.turnaroundHours ?? 48,
      data.priorityPickup ?? false,
      data.freeDelivery ?? false,
      data.expressDiscountPercent ?? 0,
      data.validityDays ?? 30,
      data.isActive ?? true,
    ],
  );
}

export async function setPlanActive(id: string, isActive: boolean) {
  return queryOne(`UPDATE plans SET is_active = $2 WHERE id = $1 RETURNING *`, [id, isActive]);
}

export async function deletePlan(id: string) {
  const used = await queryOne<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM subscriptions WHERE plan_id = $1`,
    [id],
  );
  if (parseInt(used?.c ?? "0", 10) > 0) {
    return setPlanActive(id, false);
  }
  await query(`DELETE FROM plans WHERE id = $1`, [id]);
  return { id, deleted: true };
}

/* ── Catalog for residents/ops ────────────────────────── */

export async function getPublicPricingCatalog() {
  const [garments, addons, settings, plans] = await Promise.all([
    listGarments(false),
    listAddonsAdmin(false),
    getCommerceSettings(),
    listPlansAdmin(false),
  ]);
  return { garments, addons, settings, plans };
}

/* ── Payments bundle ──────────────────────────────────── */

export async function listPaymentsBundle() {
  const [transactions, walletTx, refunds, invoices] = await Promise.all([
    query(
      `SELECT pt.*, u.full_name AS resident_name, u.phone
       FROM payment_transactions pt
       JOIN residents r ON r.id = pt.resident_id
       JOIN users u ON u.id = r.user_id
       ORDER BY pt.created_at DESC LIMIT 100`,
    ),
    query(
      `SELECT wt.*, u.full_name AS resident_name, u.phone, r.id AS resident_id
       FROM wallet_transactions wt
       JOIN wallets w ON w.id = wt.wallet_id
       JOIN residents r ON r.id = w.resident_id
       JOIN users u ON u.id = r.user_id
       ORDER BY wt.created_at DESC LIMIT 100`,
    ),
    query(
      `SELECT rf.*, u.full_name AS resident_name, u.phone, o.order_code
       FROM refunds rf
       JOIN residents r ON r.id = rf.resident_id
       JOIN users u ON u.id = r.user_id
       LEFT JOIN orders o ON o.id = rf.order_id
       ORDER BY rf.created_at DESC LIMIT 100`,
    ),
    query(
      `SELECT bi.*, u.full_name AS resident_name, u.phone
       FROM billing_invoices bi
       JOIN residents r ON r.id = bi.resident_id
       JOIN users u ON u.id = r.user_id
       ORDER BY bi.billed_on DESC LIMIT 100`,
    ),
  ]);
  return {
    onlinePayments: transactions.rows,
    walletTransactions: walletTx.rows,
    refunds: refunds.rows,
    invoices: invoices.rows,
  };
}

export async function setRefundStatus(refundId: string, status: "approved" | "rejected", approvedBy?: string) {
  return queryOne(
    `UPDATE refunds SET status = $2, approved_by = $3 WHERE id = $1 RETURNING *`,
    [refundId, status, approvedBy ?? null],
  );
}

/* ── Pickups / deliveries admin lists ───────────────────── */

export type AdminPickupListFilters = {
  filter?: string;
  societyId?: string;
  operatorId?: string;
  q?: string;
};

const PICKUP_LIST_FROM = `
  FROM pickups p
  JOIN residents r ON r.id = p.resident_id
  JOIN users u ON u.id = r.user_id
  JOIN societies s ON s.id = p.society_id
  LEFT JOIN pickup_slots ps ON ps.id = p.pickup_slot_id
  LEFT JOIN orders o ON o.pickup_id = p.id
  LEFT JOIN LATERAL (
    SELECT op.id, op.operator_code, ou.full_name, ou.phone
    FROM operator_societies os
    JOIN operators op ON op.id = os.operator_id
    JOIN users ou ON ou.id = op.user_id
    WHERE os.society_id = p.society_id
    ORDER BY os.created_at ASC
    LIMIT 1
  ) op ON true`;

function buildAdminPickupWhere(filters: AdminPickupListFilters) {
  const params: unknown[] = [];
  let where = "1=1";
  const { filter, societyId, operatorId, q } = filters;

  if (filter === "today") {
    where += ` AND p.scheduled_for::date = CURRENT_DATE`;
  } else if (filter === "upcoming") {
    where += ` AND p.scheduled_for::date > CURRENT_DATE AND p.status IN ('scheduled','rescheduled')`;
  } else if (filter === "completed") {
    where += ` AND p.status = 'completed'`;
  } else if (filter === "cancelled") {
    where += ` AND p.status = 'cancelled'`;
  } else if (filter === "assigned") {
    where += ` AND op.id IS NOT NULL AND p.status IN ('scheduled','rescheduled')`;
  } else if (filter === "missed") {
    where += ` AND p.scheduled_for < now() AND p.status IN ('scheduled','rescheduled')`;
  }

  if (societyId) {
    params.push(societyId);
    where += ` AND p.society_id = $${params.length}`;
  }
  if (operatorId) {
    params.push(operatorId);
    where += ` AND op.id = $${params.length}`;
  }
  if (q?.trim()) {
    params.push(`%${q.trim()}%`);
    const i = params.length;
    where += ` AND (
      u.full_name ILIKE $${i} OR u.phone ILIKE $${i} OR s.name ILIKE $${i}
      OR r.tower_block ILIKE $${i} OR r.unit_number ILIKE $${i}
      OR o.order_code ILIKE $${i} OR op.operator_code ILIKE $${i}
      OR op.full_name ILIKE $${i}
    )`;
  }

  return { where, params };
}

const PICKUP_LIST_SELECT = `
  SELECT p.*,
         u.full_name AS resident_name, u.phone, u.email AS resident_email,
         r.id AS resident_id, r.resident_code, r.tower_block, r.unit_number,
         s.id AS society_id, s.name AS society_name, s.city AS society_city,
         ps.slot_window, ps.start_time::text, ps.end_time::text,
         o.id AS order_id, o.order_code, o.status AS order_status, o.pickup_garment_count,
         op.id AS operator_id, op.operator_code, op.full_name AS operator_name, op.phone AS operator_phone`;

export async function listAdminPickups(filterOrFilters?: string | AdminPickupListFilters) {
  const filters: AdminPickupListFilters =
    typeof filterOrFilters === "string" ? { filter: filterOrFilters } : (filterOrFilters ?? {});
  const { where, params } = buildAdminPickupWhere(filters);
  return (
    await query(
      `${PICKUP_LIST_SELECT}
       ${PICKUP_LIST_FROM}
       WHERE ${where}
       ORDER BY p.scheduled_for DESC
       LIMIT 500`,
      params,
    )
  ).rows;
}

export async function getAdminPickupStats() {
  const row = (
    await queryOne<{
      today: string;
      scheduled: string;
      assigned: string;
      completed: string;
      missed: string;
      cancelled: string;
    }>(
      `SELECT
         COUNT(*) FILTER (WHERE p.scheduled_for::date = CURRENT_DATE)::text AS today,
         COUNT(*) FILTER (WHERE p.scheduled_for::date > CURRENT_DATE AND p.status IN ('scheduled','rescheduled'))::text AS scheduled,
         COUNT(*) FILTER (WHERE op.id IS NOT NULL AND p.status IN ('scheduled','rescheduled'))::text AS assigned,
         COUNT(*) FILTER (WHERE p.status = 'completed')::text AS completed,
         COUNT(*) FILTER (WHERE p.scheduled_for < now() AND p.status IN ('scheduled','rescheduled'))::text AS missed,
         COUNT(*) FILTER (WHERE p.status = 'cancelled')::text AS cancelled
       ${PICKUP_LIST_FROM}`,
    )
  ) ?? {
    today: "0",
    scheduled: "0",
    assigned: "0",
    completed: "0",
    missed: "0",
    cancelled: "0",
  };
  return {
    today: parseInt(row.today, 10),
    scheduled: parseInt(row.scheduled, 10),
    assigned: parseInt(row.assigned, 10),
    completed: parseInt(row.completed, 10),
    missed: parseInt(row.missed, 10),
    cancelled: parseInt(row.cancelled, 10),
  };
}

export async function getAdminPickupDetail(pickupId: string) {
  const pickup = await queryOne(
    `${PICKUP_LIST_SELECT}
     ${PICKUP_LIST_FROM}
     WHERE p.id = $1`,
    [pickupId],
  );
  if (!pickup) return null;

  const operators = (
    await query(
      `SELECT op.id, op.operator_code, u.full_name, u.phone, u.email, op.status
       FROM operator_societies os
       JOIN operators op ON op.id = os.operator_id
       JOIN users u ON u.id = op.user_id
       WHERE os.society_id = $1
       ORDER BY os.created_at ASC`,
      [pickup.society_id],
    )
  ).rows;

  const resident = await queryOne(
    `SELECT r.*, u.full_name, u.phone, u.email, u.status AS user_status, u.last_login_at
     FROM residents r JOIN users u ON u.id = r.user_id WHERE r.id = $1`,
    [pickup.resident_id],
  );

  const order = pickup.order_id
    ? await queryOne(`SELECT * FROM orders WHERE id = $1`, [pickup.order_id])
    : await queryOne(`SELECT * FROM orders WHERE pickup_id = $1`, [pickupId]);

  const activity = (
    await query(
      `SELECT * FROM audit_logs
       WHERE entity_id IN ($1, $2, $3)
       ORDER BY created_at DESC LIMIT 30`,
      [pickupId, pickup.resident_id, order?.id ?? pickupId],
    )
  ).rows;

  return { pickup, resident, operators, order, activity };
}

export async function updateAdminPickup(
  pickupId: string,
  data: { status?: string; specialInstructions?: string },
) {
  if (data.status) {
    return queryOne(
      `UPDATE pickups SET status = $2, updated_at = now() WHERE id = $1 RETURNING *`,
      [pickupId, data.status],
    );
  }
  if (data.specialInstructions !== undefined) {
    return queryOne(
      `UPDATE pickups SET special_instructions = $2, updated_at = now() WHERE id = $1 RETURNING *`,
      [pickupId, data.specialInstructions],
    );
  }
  return null;
}

export type AdminDeliveryFilters = {
  filter?: string;
  q?: string;
  societyId?: string;
  operatorId?: string;
};

const DELIVERY_STATUS_MAP: Record<string, string[]> = {
  ready: ["Ready for Delivery", "Packing", "Packed"],
  out: ["Out for Delivery"],
  delivered: ["Delivered"],
  failed: ["Failed Delivery", "Delivery Failed"],
};

function deliveryStatusWhere(filter?: string, params: unknown[] = []) {
  const statuses = filter ? DELIVERY_STATUS_MAP[filter] : null;
  if (statuses) {
    params.push(statuses);
    return `o.status = ANY($${params.length}::text[])`;
  }
  return `o.status ILIKE ANY(ARRAY['%ready%','%delivery%','%delivered%','%packed%','%packing%','%failed%'])`;
}

export async function listAdminDeliveries(filters?: AdminDeliveryFilters | string) {
  const opts: AdminDeliveryFilters =
    typeof filters === "string" ? { filter: filters } : (filters ?? {});
  const params: unknown[] = [];
  const conditions = [deliveryStatusWhere(opts.filter, params)];

  if (opts.societyId) {
    params.push(opts.societyId);
    conditions.push(`s.id = $${params.length}`);
  }
  if (opts.operatorId) {
    params.push(opts.operatorId);
    conditions.push(`op.id = $${params.length}`);
  }
  if (opts.q?.trim()) {
    params.push(`%${opts.q.trim()}%`);
    conditions.push(
      `(o.order_code ILIKE $${params.length} OR u.full_name ILIKE $${params.length} OR u.phone ILIKE $${params.length} OR op.operator_code ILIKE $${params.length} OR ou.full_name ILIKE $${params.length} OR s.name ILIKE $${params.length})`,
    );
  }

  return (
    await query(
      `SELECT o.id, o.order_code, o.status, o.updated_at, o.created_at, o.pickup_garment_count,
              o.delivered_garment_count,
              u.full_name AS resident_name, u.phone, u.email,
              s.name AS society_name, s.city AS society_city,
              r.id AS resident_id, s.id AS society_id,
              r.tower_block, r.unit_number,
              p.scheduled_for, p.special_instructions,
              op.id AS operator_id, op.operator_code,
              ou.full_name AS operator_name, ou.phone AS operator_phone,
              route_info.route_date, route_info.route_id, route_info.stop_status
       FROM orders o
       JOIN pickups p ON p.id = o.pickup_id
       JOIN residents r ON r.id = p.resident_id
       JOIN users u ON u.id = r.user_id
       JOIN societies s ON s.id = p.society_id
       LEFT JOIN LATERAL (
         SELECT os.operator_id
         FROM operator_societies os
         WHERE os.society_id = p.society_id
         ORDER BY os.created_at ASC
         LIMIT 1
       ) soc_op ON TRUE
       LEFT JOIN operators op ON op.id = soc_op.operator_id
       LEFT JOIN users ou ON ou.id = op.user_id
       LEFT JOIN LATERAL (
         SELECT dr.id AS route_id, dr.route_date, rs.status AS stop_status
         FROM route_stops rs
         JOIN delivery_routes dr ON dr.id = rs.route_id
         WHERE rs.order_id = o.id
         ORDER BY dr.created_at DESC
         LIMIT 1
       ) route_info ON TRUE
       WHERE ${conditions.join(" AND ")}
       ORDER BY o.updated_at DESC
       LIMIT 200`,
      params,
    )
  ).rows;
}

export async function assignAdminDeliveryOperator(
  orderId: string,
  operatorId: string,
  actorUserId?: string,
) {
  return withTransaction(async (client) => {
    const orderRes = await client.query<{ id: string; status: string; society_id: string }>(
      `SELECT o.id, o.status, p.society_id
       FROM orders o
       JOIN pickups p ON p.id = o.pickup_id
       WHERE o.id = $1`,
      [orderId],
    );
    const order = orderRes.rows[0];
    if (!order) throw new Error("Order not found");

    const opRes = await client.query<{ id: string; user_id: string; operator_code: string | null }>(
      `SELECT o.id, o.user_id, o.operator_code FROM operators o WHERE o.id = $1`,
      [operatorId],
    );
    const op = opRes.rows[0];
    if (!op) throw new Error("Operator not found");

    await client.query(
      `INSERT INTO operator_societies (operator_id, society_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [operatorId, order.society_id],
    );

    let routeRes = await client.query<{ id: string }>(
      `SELECT id FROM delivery_routes
       WHERE operator_user_id = $1 AND route_date = CURRENT_DATE AND status = 'active'
       LIMIT 1`,
      [op.user_id],
    );
    let routeId = routeRes.rows[0]?.id;
    if (!routeId) {
      const created = await client.query<{ id: string }>(
        `INSERT INTO delivery_routes (operator_user_id, route_date)
         VALUES ($1, CURRENT_DATE) RETURNING id`,
        [op.user_id],
      );
      routeId = created.rows[0]?.id;
    }
    if (!routeId) throw new Error("Failed to create delivery route");

    const seqRes = await client.query<{ next_seq: number }>(
      `SELECT COALESCE(MAX(stop_sequence), 0) + 1 AS next_seq FROM route_stops WHERE route_id = $1`,
      [routeId],
    );
    const stopSeq = seqRes.rows[0]?.next_seq ?? 1;

    const existingStop = await client.query(
      `SELECT id FROM route_stops WHERE route_id = $1 AND order_id = $2`,
      [routeId, orderId],
    );
    if (!existingStop.rows.length) {
      await client.query(
        `INSERT INTO route_stops (route_id, order_id, stop_sequence) VALUES ($1, $2, $3)`,
        [routeId, orderId, stopSeq],
      );
    }

    if (["Ready for Delivery", "Packing", "Packed"].includes(order.status)) {
      await client.query(
        `UPDATE orders SET status = 'Out for Delivery', updated_at = now() WHERE id = $1`,
        [orderId],
      );
    }

    await client.query(
      `INSERT INTO order_events (order_id, event_type, event_payload, actor_user_id)
       VALUES ($1, 'operator_assigned', $2::jsonb, $3)`,
      [
        orderId,
        JSON.stringify({ operatorId, operatorCode: op.operator_code }),
        actorUserId ?? null,
      ],
    );

    return { routeId, operatorId };
  });
}

export async function rescheduleAdminDelivery(
  orderId: string,
  scheduledFor: string,
  actorUserId?: string,
) {
  const order = await queryOne<{ pickup_id: string }>(
    `SELECT pickup_id FROM orders WHERE id = $1`,
    [orderId],
  );
  if (!order) return null;

  await query(
    `UPDATE pickups SET scheduled_for = $2, status = 'rescheduled', updated_at = now() WHERE id = $1`,
    [order.pickup_id, scheduledFor],
  );
  await query(
    `INSERT INTO order_events (order_id, event_type, event_payload, actor_user_id)
     VALUES ($1, 'delivery_rescheduled', $2::jsonb, $3)`,
    [orderId, JSON.stringify({ scheduledFor }), actorUserId ?? null],
  );
  return { ok: true };
}

export async function addAdminDeliveryNote(
  orderId: string,
  note: string,
  actorUserId?: string,
) {
  await query(
    `INSERT INTO order_events (order_id, event_type, event_payload, actor_user_id)
     VALUES ($1, 'admin_note', $2::jsonb, $3)`,
    [orderId, JSON.stringify({ note }), actorUserId ?? null],
  );
  return { ok: true };
}

/* ── Broadcasts ───────────────────────────────────────── */

export async function createBroadcast(data: {
  title: string;
  body: string;
  type: string;
  audience: "all_residents" | "society" | "operator" | "resident";
  societyId?: string;
  residentId?: string;
  operatorUserId?: string;
  createdBy?: string;
}) {
  return withTransaction(async (client) => {
    const broadcast = await client.query<{ id: string }>(
      `INSERT INTO admin_broadcasts
         (title, body, type, audience, society_id, resident_id, operator_user_id, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'sent',$8)
       RETURNING id`,
      [
        data.title,
        data.body,
        data.type,
        data.audience,
        data.societyId ?? null,
        data.residentId ?? null,
        data.operatorUserId ?? null,
        data.createdBy ?? null,
      ],
    );
    const broadcastId = broadcast.rows[0]?.id;
    if (!broadcastId) throw new Error("Failed to create broadcast");

    if (data.audience === "all_residents") {
      await client.query(
        `INSERT INTO notifications (resident_id, title, body, type, broadcast_id)
         SELECT id, $1, $2, $3, $4 FROM residents`,
        [data.title, data.body, data.type, broadcastId],
      );
    } else if (data.audience === "society" && data.societyId) {
      await client.query(
        `INSERT INTO notifications (resident_id, title, body, type, broadcast_id)
         SELECT id, $1, $2, $3, $4 FROM residents WHERE society_id = $5`,
        [data.title, data.body, data.type, broadcastId, data.societyId],
      );
    } else if (data.audience === "resident" && data.residentId) {
      await client.query(
        `INSERT INTO notifications (resident_id, title, body, type, broadcast_id)
         VALUES ($1,$2,$3,$4,$5)`,
        [data.residentId, data.title, data.body, data.type, broadcastId],
      );
    } else if (data.audience === "operator" && data.operatorUserId) {
      await client.query(
        `INSERT INTO user_notifications (user_id, title, body, type, broadcast_id)
         VALUES ($1,$2,$3,$4,$5)`,
        [data.operatorUserId, data.title, data.body, data.type, broadcastId],
      );
    }

    return { id: broadcastId };
  });
}

export async function listBroadcasts() {
  return (
    await query(
      `SELECT b.*, s.name AS society_name, u.full_name AS creator_name
       FROM admin_broadcasts b
       LEFT JOIN societies s ON s.id = b.society_id
       LEFT JOIN users u ON u.id = b.created_by
       ORDER BY b.created_at DESC LIMIT 100`,
    )
  ).rows;
}

/* ── Reports / performance ────────────────────────────── */

export async function getOperatorPerformance() {
  return (
    await query(
      `SELECT o.id, o.operator_code, u.full_name, u.phone, o.status,
              COALESCE(array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL), '{}') AS societies,
              (
                SELECT COUNT(*)::int FROM residents r
                JOIN operator_societies os2 ON os2.society_id = r.society_id
                WHERE os2.operator_id = o.id
              ) AS residents_count,
              (
                SELECT COUNT(*)::int FROM orders ord
                JOIN pickups p ON p.id = ord.pickup_id
                JOIN operator_societies os3 ON os3.society_id = p.society_id
                WHERE os3.operator_id = o.id AND ord.status = 'Delivered'
              ) AS completed_orders,
              (
                SELECT COUNT(*)::int FROM orders ord
                JOIN pickups p ON p.id = ord.pickup_id
                JOIN operator_societies os3 ON os3.society_id = p.society_id
                WHERE os3.operator_id = o.id AND ord.status NOT IN ('Delivered','Cancelled')
              ) AS pending_orders,
              (
                SELECT COALESCE(AVG(orat.rating), 0)::float FROM order_ratings orat
                JOIN orders ord ON ord.id = orat.order_id
                JOIN pickups p ON p.id = ord.pickup_id
                JOIN operator_societies os3 ON os3.society_id = p.society_id
                WHERE os3.operator_id = o.id
              ) AS avg_rating,
              (
                SELECT COUNT(*)::int FROM pickups p
                JOIN operator_societies os3 ON os3.society_id = p.society_id
                WHERE os3.operator_id = o.id AND p.scheduled_for::date = CURRENT_DATE
              ) AS todays_pickups
       FROM operators o
       JOIN users u ON u.id = o.user_id
       LEFT JOIN operator_societies os ON os.operator_id = o.id
       LEFT JOIN societies s ON s.id = os.society_id
       GROUP BY o.id, u.id
       ORDER BY completed_orders DESC`,
    )
  ).rows;
}

export async function getReportsBundle() {
  const [daily, weekly, monthly, bySociety, byOperator] = await Promise.all([
    query(
      `SELECT CURRENT_DATE::text AS day,
              COUNT(*)::int AS orders,
              COUNT(*) FILTER (WHERE status = 'Delivered')::int AS delivered,
              COALESCE(SUM(pickup_garment_count),0)::int AS garments
       FROM orders WHERE created_at::date = CURRENT_DATE`,
    ),
    query(
      `SELECT date_trunc('week', created_at)::date::text AS week,
              COUNT(*)::int AS orders
       FROM orders WHERE created_at >= CURRENT_DATE - INTERVAL '8 weeks'
       GROUP BY 1 ORDER BY 1 DESC`,
    ),
    query(
      `SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
              COUNT(*)::int AS orders,
              COUNT(*) FILTER (WHERE status = 'Delivered')::int AS delivered
       FROM orders GROUP BY 1 ORDER BY 1 DESC LIMIT 12`,
    ),
    query(
      `SELECT s.name, COUNT(o.id)::int AS orders,
              COUNT(*) FILTER (WHERE o.status = 'Delivered')::int AS delivered
       FROM societies s
       LEFT JOIN pickups p ON p.society_id = s.id
       LEFT JOIN orders o ON o.pickup_id = p.id
       GROUP BY s.id ORDER BY orders DESC`,
    ),
    query(
      `SELECT COALESCE(op.operator_code, 'Unassigned') AS operator,
              COUNT(o.id)::int AS orders
       FROM orders o
       JOIN pickups p ON p.id = o.pickup_id
       LEFT JOIN LATERAL (
         SELECT operators.operator_code FROM operator_societies
         JOIN operators ON operators.id = operator_societies.operator_id
         WHERE operator_societies.society_id = p.society_id LIMIT 1
       ) op ON TRUE
       GROUP BY 1 ORDER BY orders DESC`,
    ),
  ]);

  const revenue = await queryOne<{ total: string }>(
    `SELECT COALESCE(SUM(amount_inr),0)::text AS total FROM billing_invoices WHERE status = 'paid'`,
  );

  return {
    daily: daily.rows[0] ?? null,
    weekly: weekly.rows,
    monthly: monthly.rows,
    bySociety: bySociety.rows,
    byOperator: byOperator.rows,
    revenueTotal: parseFloat(revenue?.total ?? "0"),
  };
}

/* ── Settings ─────────────────────────────────────────── */

export async function getPlatformSettings() {
  const rows = (await query(`SELECT key, value_json FROM platform_settings`)).rows;
  const map: Record<string, unknown> = {};
  for (const r of rows) map[r.key] = r.value_json;
  return map;
}

export async function setPlatformSetting(key: string, value: unknown) {
  return queryOne(
    `INSERT INTO platform_settings (key, value_json, updated_at)
     VALUES ($1, $2::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json, updated_at = now()
     RETURNING *`,
    [key, JSON.stringify(value)],
  );
}

/* ── Support replies ──────────────────────────────────── */

export async function listSupportTicketsFull() {
  return (
    await query(
      `SELECT t.*, u.full_name AS resident_name, u.phone AS resident_phone,
              r.id AS resident_uuid,
              ou.full_name AS assignee_name, ou.id AS assignee_user_id
       FROM support_tickets t
       LEFT JOIN residents r ON r.id = t.resident_id
       LEFT JOIN users u ON u.id = r.user_id
       LEFT JOIN users ou ON ou.id = t.assigned_to_user_id
       ORDER BY t.created_at DESC LIMIT 200`,
    )
  ).rows;
}

export async function updateSupportTicket(data: {
  ticketId: string;
  status?: string;
  assignedToUserId?: string | null;
  priority?: string;
}) {
  return queryOne(
    `UPDATE support_tickets SET
       status = COALESCE($2, status),
       assigned_to_user_id = COALESCE($3, assigned_to_user_id),
       priority = COALESCE($4, priority),
       updated_at = now()
     WHERE id = $1 RETURNING *`,
    [data.ticketId, data.status ?? null, data.assignedToUserId ?? null, data.priority ?? null],
  );
}

export async function addTicketReply(ticketId: string, senderUserId: string, body: string) {
  return queryOne(
    `INSERT INTO ticket_messages (ticket_id, sender_user_id, body)
     VALUES ($1, $2, $3) RETURNING *`,
    [ticketId, senderUserId, body],
  );
}

export async function listTicketMessages(ticketId: string) {
  return (
    await query(
      `SELECT m.*, u.full_name AS sender_name
       FROM ticket_messages m
       LEFT JOIN users u ON u.id = m.sender_user_id
       WHERE m.ticket_id = $1
       ORDER BY m.created_at ASC`,
      [ticketId],
    )
  ).rows;
}

/* ── Roles ────────────────────────────────────────────── */

export async function listRolesWithUsers() {
  const roles = (await query(`SELECT id, name FROM roles ORDER BY name`)).rows;
  const users = (
    await query(
      `SELECT u.id, u.phone, u.full_name, u.email, u.status, u.last_login_at, u.created_at,
              COALESCE(array_agg(DISTINCT ro.name) FILTER (WHERE ro.name IS NOT NULL), '{}') AS roles,
              r.id AS resident_id,
              o.id AS operator_id,
              COALESCE(
                (
                  SELECT array_agg(DISTINCT s.name ORDER BY s.name)
                  FROM (
                    SELECT soc.name
                    FROM residents res
                    JOIN societies soc ON soc.id = res.society_id
                    WHERE res.user_id = u.id
                    UNION
                    SELECT soc.name
                    FROM operators op
                    JOIN operator_societies os ON os.operator_id = op.id
                    JOIN societies soc ON soc.id = os.society_id
                    WHERE op.user_id = u.id
                  ) s
                ),
                '{}'
              ) AS societies
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles ro ON ro.id = ur.role_id
       LEFT JOIN residents r ON r.user_id = u.id
       LEFT JOIN operators o ON o.user_id = u.id
       GROUP BY u.id, r.id, o.id
       ORDER BY u.created_at DESC
       LIMIT 500`,
    )
  ).rows;
  return { roles, users };
}
