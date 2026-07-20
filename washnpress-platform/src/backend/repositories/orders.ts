import { query, queryOne } from "@/backend/db/pool";
import type { DbOrder } from "@/backend/types";

export async function listOrdersByResident(residentId: string) {
  const result = await query<DbOrder>(
    `SELECT o.id, o.order_code, o.status, o.pickup_garment_count, o.delivered_garment_count,
            o.qc_status, o.qc_reason, o.created_at, o.updated_at,
            p.scheduled_for, p.special_instructions
     FROM orders o
     JOIN pickups p ON p.id = o.pickup_id
     WHERE p.resident_id = $1
     ORDER BY o.created_at DESC`,
    [residentId],
  );
  return result.rows;
}

export async function findOrderByCode(orderCode: string, residentId?: string) {
  const params: unknown[] = [orderCode];
  let sql = `
    SELECT o.id, o.order_code, o.status, o.pickup_garment_count, o.delivered_garment_count,
           o.qc_status, o.qc_reason, o.created_at, o.updated_at,
           p.scheduled_for, p.special_instructions
    FROM orders o
    JOIN pickups p ON p.id = o.pickup_id
    WHERE o.order_code = $1`;

  if (residentId) {
    sql += ` AND p.resident_id = $2`;
    params.push(residentId);
  }

  return queryOne<DbOrder>(sql, params);
}

export async function findOrderById(orderId: string) {
  return queryOne<DbOrder>(
    `SELECT o.id, o.order_code, o.status, o.pickup_garment_count, o.delivered_garment_count,
            o.qc_status, o.qc_reason, o.created_at, o.updated_at,
            p.scheduled_for, p.special_instructions
     FROM orders o
     JOIN pickups p ON p.id = o.pickup_id
     WHERE o.id = $1`,
    [orderId],
  );
}

export async function listOrderEvents(orderId: string) {
  const result = await query<{
    id: string;
    event_type: string;
    event_payload: Record<string, unknown>;
    created_at: string;
  }>(
    `SELECT id, event_type, event_payload, created_at
     FROM order_events WHERE order_id = $1 ORDER BY created_at ASC`,
    [orderId],
  );
  return result.rows;
}

export async function updateOrderQc(
  orderCode: string,
  pass: boolean,
  reason?: string,
  actorUserId?: string,
) {
  const status = pass ? "Out for Delivery" : "QC Hold";
  const qcStatus = pass ? "passed" : "failed";

  const order = await queryOne<{ id: string }>(
    `UPDATE orders SET status = $2, qc_status = $3, qc_reason = $4, updated_at = now()
     WHERE order_code = $1 RETURNING id`,
    [orderCode, status, qcStatus, reason ?? null],
  );

  if (!order) return null;

  await query(
    `INSERT INTO order_events (order_id, event_type, event_payload, actor_user_id)
     VALUES ($1, 'qc_decision', $2::jsonb, $3)`,
    [order.id, JSON.stringify({ pass, reason }), actorUserId ?? null],
  );

  return findOrderById(order.id);
}

export async function listOrderItems(orderId: string) {
  const result = await query<{ id: string; category: string; quantity: number }>(
    `SELECT id, category, quantity FROM order_items WHERE order_id = $1`,
    [orderId],
  );
  return result.rows;
}

export async function createOrderForPickup(data: {
  pickupId: string;
  garmentCount?: number;
  items?: { category: string; quantity: number }[];
}) {
  const total =
    data.garmentCount ??
    data.items?.reduce((sum, i) => sum + i.quantity, 0) ??
    0;

  const orderCode = `WNP-${Date.now().toString().slice(-8)}`;

  const order = await queryOne<{ id: string; order_code: string }>(
    `INSERT INTO orders (pickup_id, order_code, status, qr_batch_code, pickup_garment_count)
     VALUES ($1, $2, 'Scheduled', $3, $4)
     RETURNING id, order_code`,
    [data.pickupId, orderCode, `QR-${orderCode}`, total],
  );

  if (!order) throw new Error("Failed to create order");

  if (data.items) {
    for (const item of data.items) {
      if (item.quantity <= 0) continue;
      await query(
        `INSERT INTO order_items (order_id, category, quantity) VALUES ($1, $2, $3)`,
        [order.id, item.category, item.quantity],
      );
    }
  }

  await query(
    `INSERT INTO order_events (order_id, event_type, event_payload)
     VALUES ($1, 'order_placed', $2::jsonb)`,
    [order.id, JSON.stringify({ status: "Order Placed", orderCode })],
  );

  await query(
    `INSERT INTO order_events (order_id, event_type, event_payload)
     VALUES ($1, 'pickup_scheduled', $2::jsonb)`,
    [order.id, JSON.stringify({ status: "Pickup Scheduled", orderCode })],
  );

  return order;
}
