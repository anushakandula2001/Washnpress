import { query, queryOne, withTransaction } from "@/backend/db/pool";
import type { PoolClient } from "pg";

/** Next OPR-###### from max existing code (never from a stale sequence alone). */
async function allocateNextOperatorCode(client: PoolClient): Promise<string> {
  await client.query("SELECT pg_advisory_xact_lock(87234001)");
  const result = await client.query<{ next: string }>(
    `SELECT 'OPR-' || LPAD(
       (COALESCE(
         MAX(
           CASE
             WHEN operator_code ~ '^OPR-[0-9]+$'
             THEN CAST(SUBSTRING(operator_code FROM 5) AS INTEGER)
             ELSE NULL
           END
         ),
         0
       ) + 1)::text,
       6,
       '0'
     ) AS next
     FROM operators`,
  );
  const code = result.rows[0]?.next ?? "OPR-000001";
  const n = Number.parseInt(code.slice(4), 10);
  if (Number.isFinite(n)) {
    await client.query(`SELECT setval('operator_code_seq', GREATEST($1, 1), true)`, [n]);
  }
  return code;
}

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
    `INSERT INTO pickup_slots (society_id, slot_date, slot_window, start_time, end_time, capacity_total, capacity_remaining, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $6, TRUE) RETURNING *`,
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

export async function createStaffUser(data: {
  phone: string;
  fullName: string;
  email?: string;
  roles: string[];
  status?: string;
  gender?: string;
  dateOfBirth?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  societyIds?: string[];
  community?: {
    societyName: string;
    towerName: string;
    block?: string;
    floor?: string;
    flatRange?: string;
    flatUnit?: string;
    city: string;
    state: string;
    pincode?: string;
    address?: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
  };
}) {
  return withTransaction(async (client) => {
    const existing = await client.query<{ id: string }>(
      `SELECT id FROM users WHERE phone = $1`,
      [data.phone],
    );
    if (existing.rows[0]) {
      throw new Error("User with this mobile number already exists");
    }

    let societyId: string | undefined = data.societyIds?.[0];
    let towerId: string | undefined;
    let societyName: string | undefined;

    if (data.community) {
      const addressText =
        data.community.address?.trim() ||
        data.addressLine1?.trim() ||
        data.community.landmark?.trim() ||
        null;

      const found = await client.query<{ id: string; name: string }>(
        `SELECT id, name FROM societies
         WHERE lower(trim(name)) = lower(trim($1))
           AND lower(trim(city)) = lower(trim($2))
         LIMIT 1`,
        [data.community.societyName, data.community.city],
      );

      if (found.rows[0]) {
        societyId = found.rows[0].id;
        societyName = found.rows[0].name;
        await client.query(
          `UPDATE societies SET
             state = COALESCE(NULLIF($2, ''), state),
             pincode = COALESCE(NULLIF($3, ''), pincode),
             address_line_1 = COALESCE(NULLIF($4, ''), address_line_1),
             updated_at = now()
           WHERE id = $1`,
          [
            societyId,
            data.community.state,
            data.community.pincode ?? null,
            addressText,
          ],
        );
      } else {
        const created = await client.query<{ id: string; name: string }>(
          `INSERT INTO societies (name, address_line_1, city, state, pincode, status)
           VALUES ($1, $2, $3, $4, $5, 'active')
           RETURNING id, name`,
          [
            data.community.societyName.trim(),
            addressText,
            data.community.city.trim(),
            data.community.state.trim(),
            data.community.pincode ?? null,
          ],
        );
        societyId = created.rows[0]?.id;
        societyName = created.rows[0]?.name;
      }

      if (!societyId) throw new Error("Failed to resolve society");

      const towerLabel = data.community.towerName.trim();
      const towerExisting = await client.query<{ id: string }>(
        `SELECT id FROM society_towers
         WHERE society_id = $1 AND lower(name) = lower($2) LIMIT 1`,
        [societyId, towerLabel],
      );
      if (towerExisting.rows[0]) {
        towerId = towerExisting.rows[0].id;
      } else {
        const tower = await client.query<{ id: string }>(
          `INSERT INTO society_towers (society_id, name) VALUES ($1, $2)
           RETURNING id`,
          [societyId, towerLabel],
        );
        towerId = tower.rows[0]?.id;
      }
    }

    const userRes = await client.query<{
      id: string;
      phone: string;
      full_name: string;
      status: string;
    }>(
      `INSERT INTO users (phone, full_name, email, gender, date_of_birth, status)
       VALUES ($1, $2, $3, $4, $5::date, $6)
       RETURNING id, phone, full_name, status`,
      [
        data.phone,
        data.fullName,
        data.email ?? null,
        data.gender ?? null,
        data.dateOfBirth ?? null,
        data.status ?? "active",
      ],
    );
    const user = userRes.rows[0];
    if (!user) throw new Error("Failed to create user");

    await client.query(`DELETE FROM user_roles WHERE user_id = $1`, [user.id]);
    for (const name of data.roles) {
      await client.query(
        `INSERT INTO user_roles (user_id, role_id)
         SELECT $1, id FROM roles WHERE name = $2 ON CONFLICT DO NOTHING`,
        [user.id, name],
      );
    }

    let operatorCode: string | null = null;
    if (data.roles.includes("operator")) {
      operatorCode = await allocateNextOperatorCode(client);

      const flatUnit = data.community?.flatUnit ?? data.community?.flatRange ?? null;
      const operatorAddress1 =
        data.community?.address?.trim() ||
        data.addressLine1?.trim() ||
        [data.community?.societyName, data.community?.towerName].filter(Boolean).join(", ") ||
        null;

      const operatorRes = await client.query<{ id: string; operator_code: string }>(
        `INSERT INTO operators (
           user_id, mode, masked_phone, operator_code, email, gender, date_of_birth,
           address_line_1, address_line_2, city, state, pincode, status
         ) VALUES ($1, 'unit', $2, $3, $4, $5, $6::date, $7, $8, $9, $10, $11, $12)
         RETURNING id, operator_code`,
        [
          user.id,
          `******${data.phone.slice(-4)}`,
          operatorCode,
          data.email ?? null,
          data.gender ?? null,
          data.dateOfBirth ?? null,
          operatorAddress1,
          flatUnit,
          data.city ?? data.community?.city ?? null,
          data.state ?? data.community?.state ?? null,
          data.pincode ?? data.community?.pincode ?? null,
          data.status ?? "active",
        ],
      );
      const operator = operatorRes.rows[0];
      if (!operator) throw new Error("Failed to create operator profile");
      operatorCode = operator.operator_code;

      const societyIds = [
        ...new Set([...(data.societyIds ?? []), ...(societyId ? [societyId] : [])]),
      ];
      if (!societyIds.length) {
        throw new Error("Operator must be linked to a society / community");
      }
      for (const sid of societyIds) {
        await client.query(
          `INSERT INTO operator_societies (operator_id, society_id)
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [operator.id, sid],
        );
      }
    }

    await client.query(
      `INSERT INTO audit_logs (actor_user_id, actor_role, action, entity_name, entity_id, after_state)
       VALUES (NULL, 'admin', 'create_staff_user', 'users', $1, $2::jsonb)`,
      [
        user.id,
        JSON.stringify({
          phone: data.phone,
          roles: data.roles,
          email: data.email ?? null,
          operatorCode,
          societyId: societyId ?? null,
          societyName: societyName ?? null,
          towerId: towerId ?? null,
          community: data.community ?? null,
        }),
      ],
    );

    return {
      id: user.id,
      phone: user.phone,
      full_name: user.full_name,
      status: user.status,
      roles: data.roles,
      operatorCode,
      societyId: societyId ?? null,
      societyName: societyName ?? null,
    };
  });
}

export async function listOperatorsDetailed() {
  return (
    await query(
      `SELECT o.id, o.operator_code, o.email, o.status, o.joined_at, o.created_at,
              o.address_line_1, o.city, o.state, o.pincode,
              u.id AS user_id, u.phone, u.full_name, u.last_login_at, u.status AS user_status,
              COALESCE(
                array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL),
                '{}'
              ) AS societies,
              COALESCE(
                array_agg(DISTINCT s.id::text) FILTER (WHERE s.id IS NOT NULL),
                '{}'
              ) AS society_ids,
              (
                SELECT COUNT(*)::int FROM residents r
                JOIN operator_societies os2 ON os2.society_id = r.society_id
                WHERE os2.operator_id = o.id
              ) AS residents_count,
              (
                SELECT COUNT(*)::int FROM orders ord
                JOIN pickups p ON p.id = ord.pickup_id
                JOIN operator_societies os3 ON os3.society_id = p.society_id
                WHERE os3.operator_id = o.id
              ) AS orders_managed
       FROM operators o
       JOIN users u ON u.id = o.user_id
       LEFT JOIN operator_societies os ON os.operator_id = o.id
       LEFT JOIN societies s ON s.id = os.society_id
       GROUP BY o.id, u.id
       ORDER BY o.created_at DESC`,
    )
  ).rows;
}

export async function getOperatorDetail(operatorId: string) {
  const op = await queryOne(
  `SELECT o.*, u.phone, u.full_name, u.last_login_at, u.status AS user_status, u.email AS user_email
   FROM operators o
   JOIN users u ON u.id = o.user_id
   WHERE o.id::text = $1
      OR o.operator_code = $1
      OR u.id::text = $1`,
  [operatorId],
);
  if (!op) return null;

  const societies = (
    await query(
      `SELECT s.id, s.name, s.city, s.state, s.address_line_1, s.pincode
       FROM operator_societies os
       JOIN societies s ON s.id = os.society_id
       WHERE os.operator_id = $1`,
      [op.id],
    )
  ).rows;

  const towers = (
    await query(
      `SELECT t.id, t.name, t.society_id, s.name AS society_name
       FROM society_towers t
       JOIN societies s ON s.id = t.society_id
       JOIN operator_societies os ON os.society_id = s.id
       WHERE os.operator_id = $1
       ORDER BY s.name, t.name`,
      [op.id],
    )
  ).rows;

  const stats = await queryOne<{
    residents: string;
    orders: string;
    completed: string;
    pending: string;
  }>(
    `SELECT
       (SELECT COUNT(*)::text FROM residents r
        JOIN operator_societies os ON os.society_id = r.society_id
        WHERE os.operator_id = $1) AS residents,
       (SELECT COUNT(*)::text FROM orders o
        JOIN pickups p ON p.id = o.pickup_id
        JOIN operator_societies os ON os.society_id = p.society_id
        WHERE os.operator_id = $1) AS orders,
       (SELECT COUNT(*)::text FROM orders o
        JOIN pickups p ON p.id = o.pickup_id
        JOIN operator_societies os ON os.society_id = p.society_id
        WHERE os.operator_id = $1 AND o.status = 'Delivered') AS completed,
       (SELECT COUNT(*)::text FROM orders o
        JOIN pickups p ON p.id = o.pickup_id
        JOIN operator_societies os ON os.society_id = p.society_id
        WHERE os.operator_id = $1 AND o.status <> 'Delivered') AS pending`,
    [op.id],
  );

  return {
    operator: op,
    societies,
    towers,
    stats: {
      residents: parseInt(stats?.residents ?? "0", 10),
      orders: parseInt(stats?.orders ?? "0", 10),
      completed: parseInt(stats?.completed ?? "0", 10),
      pending: parseInt(stats?.pending ?? "0", 10),
    },
  };
}

export async function listResidentsAdmin(filters?: {
  q?: string;
  societyId?: string;
  tower?: string;
  floor?: string;
  subscription?: string;
  status?: string;
}) {
  const params: unknown[] = [];
  const where: string[] = ["1=1"];

  if (filters?.q) {
    params.push(`%${filters.q}%`);
    where.push(
      `(u.full_name ILIKE $${params.length} OR u.phone ILIKE $${params.length} OR r.email ILIKE $${params.length} OR r.resident_code ILIKE $${params.length})`,
    );
  }
  if (filters?.societyId) {
    params.push(filters.societyId);
    where.push(`r.society_id = $${params.length}`);
  }
  if (filters?.tower) {
    params.push(`%${filters.tower}%`);
    where.push(`(r.tower_block ILIKE $${params.length} OR t.name ILIKE $${params.length})`);
  }
  if (filters?.floor) {
    params.push(filters.floor);
    where.push(`fl.label = $${params.length}`);
  }
  if (filters?.status) {
    params.push(filters.status);
    where.push(`u.status = $${params.length}`);
  }
  if (filters?.subscription) {
    params.push(filters.subscription);
    where.push(`EXISTS (
      SELECT 1 FROM subscriptions sub
      JOIN plans pl ON pl.id = sub.plan_id
      WHERE sub.resident_id = r.id AND sub.status = 'active' AND pl.tier ILIKE $${params.length}
    )`);
  }

  return (
    await query(
      `SELECT r.id, r.resident_code, r.unit_number, r.tower_block, r.email, r.created_at,
              u.id AS user_id, u.full_name, u.phone, u.status,
              s.id AS society_id, s.name AS society_name,
              t.name AS tower_name, f.flat_number,
              COALESCE(w.balance_inr, 0)::float AS wallet_balance,
              (
                SELECT pl.tier FROM subscriptions sub
                JOIN plans pl ON pl.id = sub.plan_id
                WHERE sub.resident_id = r.id
                ORDER BY CASE WHEN sub.status = 'active' THEN 0 ELSE 1 END, sub.cycle_start DESC
                LIMIT 1
              ) AS subscription_tier,
              (
                SELECT sub.status FROM subscriptions sub
                WHERE sub.resident_id = r.id
                ORDER BY CASE WHEN sub.status = 'active' THEN 0 ELSE 1 END, sub.cycle_start DESC
                LIMIT 1
              ) AS subscription_status,
              (SELECT COUNT(*)::int FROM pickups p JOIN orders o ON o.pickup_id = p.id WHERE p.resident_id = r.id) AS orders_count
       FROM residents r
       JOIN users u ON u.id = r.user_id
       JOIN societies s ON s.id = r.society_id
       LEFT JOIN society_flats f ON f.id = r.flat_id
       LEFT JOIN society_floors fl ON fl.id = f.floor_id
       LEFT JOIN society_towers t ON t.id = fl.tower_id
       LEFT JOIN wallets w ON w.resident_id = r.id
       WHERE ${where.join(" AND ")}
       ORDER BY r.created_at DESC`,
      params,
    )
  ).rows;
}

export async function getResidentDetail(residentId: string) {
  const resident = await queryOne(
    `SELECT r.*, u.full_name, u.phone, u.status AS user_status, u.last_login_at,
            s.id AS society_id, s.name AS society_name, s.address_line_1 AS society_address,
            s.city AS society_city, s.state AS society_state, s.pincode AS society_pincode,
            t.name AS tower_name, f.flat_number,
            COALESCE(w.balance_inr, 0)::float AS wallet_balance
     FROM residents r
     JOIN users u ON u.id = r.user_id
     JOIN societies s ON s.id = r.society_id
     LEFT JOIN society_flats f ON f.id = r.flat_id
     LEFT JOIN society_floors fl ON fl.id = f.floor_id
     LEFT JOIN society_towers t ON t.id = fl.tower_id
     LEFT JOIN wallets w ON w.resident_id = r.id
     WHERE r.id::text = $1
   OR r.resident_code = $1`,
    [residentId],
  );
  if (!resident) return null;

  const operators = (
    await query(
      `SELECT o.id, o.operator_code, u.full_name, u.phone
       FROM operator_societies os
       JOIN operators o ON o.id = os.operator_id
       JOIN users u ON u.id = o.user_id
       WHERE os.society_id = $1`,
      [resident.society_id],
    )
  ).rows;

  const subscription = await queryOne(
    `SELECT sub.*, pl.tier, pl.monthly_inr, pl.garment_cap
     FROM subscriptions sub
     JOIN plans pl ON pl.id = sub.plan_id
     WHERE sub.resident_id = $1
     ORDER BY CASE WHEN sub.status = 'active' THEN 0 ELSE 1 END, sub.cycle_start DESC
     LIMIT 1`,
    [resident.id],
  );

  const orders = (
    await query(
      `SELECT o.order_code, o.status, o.pickup_garment_count, o.created_at, p.scheduled_for
       FROM orders o
       JOIN pickups p ON p.id = o.pickup_id
       WHERE p.resident_id = $1
       ORDER BY o.created_at DESC LIMIT 20`,
      [resident.id],
    )
  ).rows;

  const tickets = (
    await query(
      `SELECT id, ticket_code, category, status, priority, created_at
       FROM support_tickets WHERE resident_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [resident.id],
    )
  ).rows;

  const notifications = (
    await query(
      `SELECT id, title, body, is_read, created_at
       FROM notifications WHERE resident_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [resident.id],
    )
  ).rows;

  const walletTx = (
    await query(
      `SELECT wt.type, wt.description, wt.amount_inr::float, wt.created_at
       FROM wallet_transactions wt
       JOIN wallets w ON w.id = wt.wallet_id
       WHERE w.resident_id = $1
       ORDER BY wt.created_at DESC LIMIT 20`,
      [resident.id],
    )
  ).rows;

  return { resident, operators, subscription, orders, tickets, notifications, walletTx };
}

export async function listSocietiesAdmin() {
  return (
    await query(
      `SELECT s.*,
              (SELECT COUNT(*)::int FROM society_towers t WHERE t.society_id = s.id) AS towers_count,
              (SELECT COUNT(*)::int FROM society_flats f
                 JOIN society_floors fl ON fl.id = f.floor_id
                 JOIN society_towers t ON t.id = fl.tower_id
               WHERE t.society_id = s.id) AS flats_count,
              (SELECT COUNT(*)::int FROM residents r WHERE r.society_id = s.id) AS residents_count,
              (SELECT COUNT(*)::int FROM orders o
                 JOIN pickups p ON p.id = o.pickup_id WHERE p.society_id = s.id) AS orders_count,
              (SELECT COUNT(*)::int FROM subscriptions sub
                 JOIN residents r ON r.id = sub.resident_id
               WHERE r.society_id = s.id AND sub.status = 'active') AS subscriptions_count,
              (SELECT COALESCE(SUM(w.balance_inr), 0)::float FROM wallets w
                 JOIN residents r ON r.id = w.resident_id WHERE r.society_id = s.id) AS wallet_revenue,
              (
                SELECT string_agg(DISTINCT COALESCE(op.operator_code, uu.full_name), ', ')
                FROM operator_societies os
                JOIN operators op ON op.id = os.operator_id
                JOIN users uu ON uu.id = op.user_id
                WHERE os.society_id = s.id
              ) AS assigned_operators
       FROM societies s
       ORDER BY s.name`,
    )
  ).rows;
}

export async function getSocietyDetail(societyId: string) {
  const society = await queryOne(`SELECT * FROM societies WHERE id = $1`, [societyId]);
  if (!society) return null;

  const towers = (
    await query(
      `SELECT t.*,
              (SELECT COUNT(*)::int FROM society_floors fl WHERE fl.tower_id = t.id) AS floors_count,
              (SELECT COUNT(*)::int FROM society_flats f
                 JOIN society_floors fl ON fl.id = f.floor_id WHERE fl.tower_id = t.id) AS flats_count,
              (SELECT COUNT(*)::int FROM residents r
                 LEFT JOIN society_flats f ON f.id = r.flat_id
                 LEFT JOIN society_floors fl ON fl.id = f.floor_id
               WHERE r.society_id = $1 AND (fl.tower_id = t.id OR r.tower_block ILIKE t.name)) AS residents_count
       FROM society_towers t WHERE t.society_id = $1 ORDER BY t.name`,
      [societyId],
    )
  ).rows;

  const operators = (
    await query(
      `SELECT o.id, o.operator_code, u.full_name, u.phone, o.status
       FROM operator_societies os
       JOIN operators o ON o.id = os.operator_id
       JOIN users u ON u.id = o.user_id
       WHERE os.society_id = $1`,
      [societyId],
    )
  ).rows;

  const residents = (
    await query(
      `SELECT r.id, r.resident_code, u.full_name, u.phone, r.unit_number, r.tower_block
       FROM residents r JOIN users u ON u.id = r.user_id
       WHERE r.society_id = $1 ORDER BY u.full_name NULLS LAST LIMIT 100`,
      [societyId],
    )
  ).rows;

  const orders = (
    await query(
      `SELECT o.order_code, o.status, o.created_at, u.full_name AS resident_name
       FROM orders o
       JOIN pickups p ON p.id = o.pickup_id
       JOIN residents r ON r.id = p.resident_id
       JOIN users u ON u.id = r.user_id
       WHERE p.society_id = $1
       ORDER BY o.created_at DESC LIMIT 50`,
      [societyId],
    )
  ).rows;

  return { society, towers, operators, residents, orders };
}

const ORDER_TAB_STATUS_MAP: Record<string, string[]> = {
  pending_pickup: ["Scheduled"],
  processing: ["Picked Up", "In Wash", "Dry", "QC Hold"],
  ready: ["Iron"],
  out: ["Out for Delivery"],
  completed: ["Delivered"],
  cancelled: ["Cancelled"],
};

export async function listOrdersAdmin(filters?: {
  status?: string;
  societyId?: string;
  residentId?: string;
  operatorId?: string;
  q?: string;
  filter?: string;
}) {
  const params: unknown[] = [];
  const where: string[] = ["1=1"];

  if (filters?.filter && filters.filter !== "all") {
    const statuses = ORDER_TAB_STATUS_MAP[filters.filter];
    if (statuses) {
      params.push(statuses);
      where.push(`o.status = ANY($${params.length}::text[])`);
    }
  } else if (filters?.status) {
    params.push(filters.status);
    where.push(`o.status ILIKE $${params.length}`);
  }

  if (filters?.societyId) {
    params.push(filters.societyId);
    where.push(`p.society_id = $${params.length}`);
  }
  if (filters?.residentId) {
    params.push(filters.residentId);
    where.push(`p.resident_id = $${params.length}`);
  }
  if (filters?.operatorId) {
    params.push(filters.operatorId);
    where.push(`op.id = $${params.length}`);
  }
  if (filters?.q?.trim()) {
    params.push(`%${filters.q.trim()}%`);
    where.push(
      `(o.order_code ILIKE $${params.length} OR u.full_name ILIKE $${params.length} OR u.phone ILIKE $${params.length} OR op.operator_code ILIKE $${params.length} OR ou.full_name ILIKE $${params.length} OR s.name ILIKE $${params.length})`,
    );
  }

  return (
    await query(
      `SELECT o.id, o.order_code, o.status, o.pickup_garment_count, o.delivered_garment_count,
              o.qc_status, o.created_at, o.updated_at,
              p.scheduled_for, p.resident_id, p.society_id,
              u.full_name AS resident_name, u.phone AS resident_phone,
              s.name AS society_name,
              r.tower_block, r.unit_number,
              op.id AS operator_id, op.operator_code,
              ou.full_name AS operator_name, ou.phone AS operator_phone
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
       WHERE ${where.join(" AND ")}
       ORDER BY o.created_at DESC
       LIMIT 200`,
      params,
    )
  ).rows;
}

export async function getOrderDetailAdmin(orderCode: string) {
  try {
    const order = await queryOne(
      `SELECT o.*, p.scheduled_for, p.special_instructions, p.resident_id, p.society_id,
              u.full_name AS resident_name, u.phone AS resident_phone, r.id AS resident_uuid,
              r.tower_block, r.unit_number, r.resident_code,
              s.name AS society_name, s.id AS society_uuid,
              op.id AS operator_id, op.operator_code,
              ou.full_name AS operator_name, ou.phone AS operator_phone
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
       WHERE o.order_code = $1 OR o.id::text = $1`,
      [orderCode],
    );

    if (!order) return null;

    const events = await query(
      `SELECT id, event_type, event_payload, actor_user_id, created_at
       FROM order_events
       WHERE order_id = $1
       ORDER BY created_at ASC`,
      [order.id],
    ).then((r) => r.rows);
    console.log("✓ events");

    const items = await query(
      `SELECT id, category, quantity, created_at
       FROM order_items
       WHERE order_id = $1
       ORDER BY category`,
      [order.id],
    ).then((r) => r.rows);
    console.log("✓ items");

    const operators = await query(
      `SELECT o.id, o.operator_code, u.full_name, u.phone
       FROM operator_societies os
       JOIN operators o ON o.id = os.operator_id
       JOIN users u ON u.id = o.user_id
       WHERE os.society_id = $1`,
      [order.society_id],
    ).then((r) => r.rows);
    console.log("✓ operators");

    const addons = await query(
      `SELECT a.name, oas.quantity, a.price_inr::float AS price_inr
       FROM order_addon_selections oas
       JOIN addon_services a ON a.id = oas.addon_id
       WHERE oas.order_id = $1`,
      [order.id],
    ).then((r) => r.rows);
    console.log("✓ addons");

    const refunds = await query(
      `SELECT id, amount_inr, reason, status, created_at
       FROM refunds
       WHERE order_id = $1
       ORDER BY created_at DESC`,
      [order.id],
    ).then((r) => r.rows);
    console.log("✓ refunds");

    const payments = await query(
      `SELECT id, amount_inr, type, status, gateway_ref, metadata, created_at
       FROM payment_transactions
       WHERE resident_id = $1
         AND (
           metadata->>'orderId' = $2
           OR metadata->>'order_id' = $2
           OR metadata->>'orderCode' = $3
         )
       ORDER BY created_at DESC`,
      [order.resident_id, order.id, order.order_code],
    ).then((r) => r.rows);
    console.log("✓ payments");

    const tickets = await query(
      `SELECT id, ticket_code, category, description, status, priority, created_at
       FROM support_tickets
       WHERE order_id = $1
       ORDER BY created_at DESC`,
      [order.id],
    ).then((r) => r.rows);
    console.log("✓ tickets");

const auditLogs = await query(
  `SELECT id, action, entity_name, entity_id, created_at
   FROM audit_logs
  WHERE entity_name = 'orders'
  AND entity_id::text = $1
   ORDER BY created_at DESC
   LIMIT 50`,
  [order.id],
).then((r) => r.rows);

console.log("✓ auditLogs");

    return {
      order,
      events,
      items,
      operators,
      addons,
      refunds,
      payments,
      tickets,
      auditLogs,
    };
  } catch (err) {
    console.error("===== ORDER DETAIL ERROR =====");
    console.error(err);
    throw err;
  }
}

export async function listPricingCatalog() {
  const plans = (await query(`SELECT * FROM plans ORDER BY monthly_inr`)).rows;
  const addons = (await query(`SELECT * FROM addon_services ORDER BY price_inr`)).rows;
  return { plans, addons };
}

export async function listSupportTicketsAdmin() {
  return (
    await query(
      `SELECT t.*, u.full_name AS resident_name, u.phone AS resident_phone,
              ou.full_name AS assignee_name
       FROM support_tickets t
       LEFT JOIN residents r ON r.id = t.resident_id
       LEFT JOIN users u ON u.id = r.user_id
       LEFT JOIN users ou ON ou.id = t.assigned_to_user_id
       ORDER BY t.created_at DESC
       LIMIT 100`,
    )
  ).rows;
}

export async function getAdminAnalyticsBundle() {
  const revenue = await getRevenueAnalytics();
  const operations = await getOperationsAnalytics();
  const sustainability = await getSustainabilityAnalytics();

  const byMonth = (
    await query(
      `SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
              COUNT(*)::int AS orders
       FROM orders
       GROUP BY 1 ORDER BY 1 DESC LIMIT 12`,
    )
  ).rows;

  const topSocieties = (
    await query(
      `SELECT s.name, COUNT(o.id)::int AS orders
       FROM societies s
       LEFT JOIN pickups p ON p.society_id = s.id
       LEFT JOIN orders o ON o.pickup_id = p.id
       GROUP BY s.id
       ORDER BY orders DESC
       LIMIT 8`,
    )
  ).rows;

  const residentsGrowth = (
    await query(
      `SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
              COUNT(*)::int AS residents
       FROM residents
       GROUP BY 1 ORDER BY 1 DESC LIMIT 12`,
    )
  ).rows;

  return { revenue, operations, sustainability, byMonth, topSocieties, residentsGrowth };
}

export async function setOperatorStatus(operatorId: string, status: string) {
  return queryOne(
    `UPDATE operators SET status = $2 WHERE id = $1 RETURNING *`,
    [operatorId, status],
  );
}

export async function setResidentUserStatus(residentId: string, status: string) {
  return queryOne(
    `UPDATE users u SET status = $2, updated_at = now()
     FROM residents r WHERE r.user_id = u.id AND r.id = $1
     RETURNING u.*`,
    [residentId, status],
  );
}

export async function setUserStatus(userId: string, status: string) {
  return queryOne(
    `UPDATE users SET status = $2, updated_at = now() WHERE id = $1 RETURNING *`,
    [userId, status],
  );
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