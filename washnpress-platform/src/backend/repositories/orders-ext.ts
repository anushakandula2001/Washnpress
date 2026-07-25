import { query, queryOne } from "@/backend/db/pool";
import { findOrderByCode, listOrderEvents, listOrderItems } from "@/backend/repositories/orders";

export async function getOrderTracking(orderCode: string, residentId?: string) {
  const order = await findOrderByCode(orderCode, residentId);
  if (!order) return null;
  const events = await listOrderEvents(order.id);
  return { order, events };
}

export async function getOrderReceipt(orderCode: string, residentId?: string) {
  const order = await findOrderByCode(orderCode, residentId);
  if (!order) return null;
  const items = await listOrderItems(order.id);
  const addons = await query(
    `SELECT a.name, oas.quantity, a.price_inr::float
     FROM order_addon_selections oas
     JOIN addon_services a ON a.id = oas.addon_id
     WHERE oas.order_id = $1`,
    [order.id],
  );
  return { order, items, addons: addons.rows };
}

export async function rateOrder(orderCode: string, residentId: string, rating: number, comment?: string) {
  const order = await findOrderByCode(orderCode, residentId);
  if (!order) return null;
  return queryOne(
    `INSERT INTO order_ratings (order_id, resident_id, rating, comment)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (order_id) DO UPDATE SET rating = $3, comment = $4
     RETURNING *`,
    [order.id, residentId, rating, comment ?? null],
  );
}

export async function disputeOrder(
  orderCode: string,
  residentId: string,
  reason: string,
  photoUrl?: string,
) {
  const order = await findOrderByCode(orderCode, residentId);
  if (!order) return null;
  return queryOne(
    `INSERT INTO order_disputes (order_id, resident_id, reason, photo_url)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [order.id, residentId, reason, photoUrl ?? null],
  );
}

export async function addOrderAddons(orderCode: string, residentId: string, addonIds: string[]) {
  const order = await findOrderByCode(orderCode, residentId);
  if (!order) return null;
  for (const addonId of addonIds) {
    await query(
      `INSERT INTO order_addon_selections (order_id, addon_id) VALUES ($1, $2)
       ON CONFLICT (order_id, addon_id) DO NOTHING`,
      [order.id, addonId],
    );
  }
  return getOrderReceipt(orderCode, residentId);
}

export async function setOrderInstructions(orderCode: string, residentId: string, instructions: string) {
  const order = await findOrderByCode(orderCode, residentId);
  if (!order) return null;
  await query(
    `UPDATE pickups SET special_instructions = $2, updated_at = now()
     FROM orders o WHERE o.pickup_id = pickups.id AND o.order_code = $1`,
    [orderCode, instructions],
  );
  return findOrderByCode(orderCode, residentId);
}

export async function getMaskedOperator(orderCode: string) {
  return queryOne<{ masked_phone: string; mode: string }>(
    `SELECT op.masked_phone, op.mode
     FROM orders o
     JOIN pickups p ON p.id = o.pickup_id
     JOIN units u ON u.society_id = p.society_id
     JOIN operators op ON op.unit_id = u.id
     WHERE o.order_code = $1 LIMIT 1`,
    [orderCode],
  );
}

export async function updateOrderStatus(orderCode: string, status: string, actorUserId?: string) {
  const order = await queryOne<{ id: string; resident_id: string }>(
    `UPDATE orders o SET status = $2, updated_at = now()
     FROM pickups p
     WHERE o.order_code = $1 AND o.pickup_id = p.id
     RETURNING o.id, p.resident_id`,
    [orderCode, status],
  );
  if (!order) {
    const fallback = await queryOne<{ id: string }>(
      `UPDATE orders SET status = $2, updated_at = now() WHERE order_code = $1 RETURNING id`,
      [orderCode, status],
    );
    if (!fallback) return null;
    await query(
      `INSERT INTO order_events (order_id, event_type, event_payload, actor_user_id)
       VALUES ($1, 'status_change', $2::jsonb, $3)`,
      [fallback.id, JSON.stringify({ status }), actorUserId ?? null],
    );
    return findOrderByCode(orderCode);
  }

  await query(
    `INSERT INTO order_events (order_id, event_type, event_payload, actor_user_id)
     VALUES ($1, 'status_change', $2::jsonb, $3)`,
    [order.id, JSON.stringify({ status }), actorUserId ?? null],
  );

  const { createResidentNotification } = await import("@/backend/repositories/notifications");
  const title =
    status === "Delivered" ? "Order delivered" : `Order update: ${status}`;
  const body =
    status === "Delivered"
      ? `Your order ${orderCode} has been delivered.`
      : `Your order ${orderCode} is now "${status}".`;
  await createResidentNotification(order.resident_id, title, body);

  return findOrderByCode(orderCode);
}

export async function setOrderGarments(
  orderCode: string,
  items: { category: string; quantity: number }[],
  actorUserId?: string,
) {
  const order = await findOrderByCode(orderCode);
  if (!order) return null;
  const total = items.reduce((s, i) => s + i.quantity, 0);
  await query(`DELETE FROM order_items WHERE order_id = $1`, [order.id]);
  for (const item of items) {
    await query(
      `INSERT INTO order_items (order_id, category, quantity) VALUES ($1, $2, $3)`,
      [order.id, item.category, item.quantity],
    );
  }
  await query(`UPDATE orders SET pickup_garment_count = $2, updated_at = now() WHERE id = $1`, [
    order.id,
    total,
  ]);
  await query(
    `INSERT INTO order_events (order_id, event_type, event_payload, actor_user_id)
     VALUES ($1, 'garment_count', $2::jsonb, $3)`,
    [order.id, JSON.stringify({ items, total }), actorUserId ?? null],
  );
  return findOrderByCode(orderCode);
}

export async function scanOrderQr(orderCode: string, qrCode: string, actorUserId?: string) {
  await query(`UPDATE orders SET qr_batch_code = $2, updated_at = now() WHERE order_code = $1`, [
    orderCode,
    qrCode,
  ]);
  return updateOrderStatus(orderCode, "Picked Up", actorUserId);
}

export async function logOrderWater(
  orderCode: string,
  garmentCount: number,
  actualLiters: number,
) {
  const order = await findOrderByCode(orderCode);
  if (!order) return null;
  return queryOne(
    `INSERT INTO water_logs (order_id, garment_count, actual_liters_used)
     VALUES ($1, $2, $3)
     ON CONFLICT (order_id) DO UPDATE SET garment_count = $2, actual_liters_used = $3
     RETURNING *`,
    [order.id, garmentCount, actualLiters],
  );
}

export async function confirmDelivery(
  orderCode: string,
  deliveryCount: number,
  actorUserId?: string,
) {
  const order = await findOrderByCode(orderCode);
  if (!order) return null;
  if (order.pickup_garment_count !== deliveryCount) {
    throw new Error("Garment count mismatch. Delivery blocked.");
  }
  await query(
    `UPDATE orders SET delivered_garment_count = $2, status = 'Delivered', updated_at = now() WHERE order_code = $1`,
    [orderCode, deliveryCount],
  );
  return updateOrderStatus(orderCode, "Delivered", actorUserId);
}
