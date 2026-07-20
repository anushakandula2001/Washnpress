import { query, queryOne } from "@/backend/db/pool";

export async function getOperatorByUserId(userId: string) {
  return queryOne(`SELECT * FROM operators WHERE user_id = $1`, [userId]);
}

export async function getOperationsQueue(societyIds?: string[]) {
  let sql = `
    SELECT o.order_code, o.status, o.pickup_garment_count, p.scheduled_for,
           r.unit_number, r.tower_block, s.name AS society_name,
           COALESCE(u.full_name, 'Resident') AS resident_name
    FROM orders o
    JOIN pickups p ON p.id = o.pickup_id
    JOIN residents r ON r.id = p.resident_id
    JOIN societies s ON s.id = p.society_id
    JOIN users u ON u.id = r.user_id
    WHERE o.status NOT IN ('Delivered', 'Cancelled')
      AND p.scheduled_for::date <= CURRENT_DATE + INTERVAL '1 day'`;
  const params: unknown[] = [];
  if (societyIds && societyIds.length > 0) {
    sql += ` AND p.society_id = ANY($1::uuid[])`;
    params.push(societyIds);
  }
  sql += ` ORDER BY p.scheduled_for ASC`;
  const result = await query(sql, params);
  return result.rows;
}

export async function listOperatorSocietyIds(userId: string) {
  const op = await getOperatorByUserId(userId);
  if (!op) return [] as string[];

  const assigned = await query<{ society_id: string }>(
    `SELECT society_id FROM operator_societies WHERE operator_id = $1`,
    [op.id],
  );
  if (assigned.rows.length > 0) return assigned.rows.map((r) => r.society_id);

  if (op.unit_id) {
    const unit = await queryOne<{ society_id: string }>(
      `SELECT society_id FROM units WHERE id = $1`,
      [op.unit_id],
    );
    return unit ? [unit.society_id] : [];
  }
  return [];
}

export async function listResidentsForSocieties(societyIds: string[]) {
  if (societyIds.length === 0) return [];
  const result = await query(
    `SELECT r.id, r.resident_code, r.unit_number, r.tower_block, r.email,
            s.name AS society_name, u.full_name, u.phone, r.created_at
     FROM residents r
     JOIN users u ON u.id = r.user_id
     JOIN societies s ON s.id = r.society_id
     WHERE r.society_id = ANY($1::uuid[])
     ORDER BY u.full_name NULLS LAST, r.created_at DESC`,
    [societyIds],
  );
  return result.rows;
}

export async function getOperatorEarnings(userId: string) {
  const result = await query(
    `SELECT * FROM operator_earnings WHERE operator_user_id = $1 ORDER BY period_start DESC LIMIT 6`,
    [userId],
  );
  return result.rows;
}

export async function getActiveRoutes(userId: string) {
  const routes = await query(
    `SELECT * FROM delivery_routes WHERE operator_user_id = $1 AND status = 'active' ORDER BY route_date DESC`,
    [userId],
  );
  return routes.rows;
}

export async function getRouteStops(routeId: string) {
  const result = await query(
    `SELECT rs.*, o.order_code, o.status
     FROM route_stops rs
     JOIN orders o ON o.id = rs.order_id
     WHERE rs.route_id = $1 ORDER BY rs.stop_sequence ASC`,
    [routeId],
  );
  return result.rows;
}

export async function updateRouteStopOrder(routeId: string, stopIds: string[]) {
  for (let i = 0; i < stopIds.length; i++) {
    await query(`UPDATE route_stops SET stop_sequence = $2 WHERE id = $1 AND route_id = $3`, [
      stopIds[i],
      i + 1,
      routeId,
    ]);
  }
  return getRouteStops(routeId);
}

export async function getHubQueue() {
  const result = await query(
    `SELECT o.order_code, o.status, o.pickup_garment_count, p.scheduled_for
     FROM orders o
     JOIN pickups p ON p.id = o.pickup_id
     WHERE o.status IN ('Picked Up', 'In Wash', 'Dry', 'Iron', 'QC Hold')
     ORDER BY o.updated_at ASC`,
  );
  return result.rows;
}

export async function createOperatorIssue(userId: string, description: string, orderId?: string) {
  return queryOne(
    `INSERT INTO operator_issues (operator_user_id, order_id, description) VALUES ($1, $2, $3) RETURNING *`,
    [userId, orderId ?? null, description],
  );
}

export async function processOfflineSync(userId: string, payload: Record<string, unknown>) {
  const batch = await queryOne(
    `INSERT INTO offline_sync_batches (operator_user_id, payload, status)
     VALUES ($1, $2::jsonb, 'processed') RETURNING *`,
    [userId, JSON.stringify(payload)],
  );
  return batch;
}

export async function operatorLogin(phone: string) {
  return queryOne<{ id: string; phone: string; full_name: string | null; roles: string[] }>(
    `SELECT u.id, u.phone, u.full_name,
            COALESCE(array_agg(DISTINCT ro.name) FILTER (WHERE ro.name IS NOT NULL), '{}') AS roles
     FROM users u
     JOIN user_roles ur ON ur.user_id = u.id
     JOIN roles ro ON ro.id = ur.role_id
     WHERE u.phone = $1 AND ro.name IN ('operator', 'admin')
     GROUP BY u.id`,
    [phone],
  );
}
