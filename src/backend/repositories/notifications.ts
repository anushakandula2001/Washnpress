import { query, queryOne } from "@/backend/db/pool";

export async function createResidentNotification(
  residentId: string,
  title: string,
  body: string,
) {
  return queryOne(
    `INSERT INTO notifications (resident_id, title, body) VALUES ($1, $2, $3) RETURNING *`,
    [residentId, title, body],
  );
}

export async function createUserNotification(
  userId: string,
  title: string,
  body: string,
  relatedOrderCode?: string,
) {
  return queryOne(
    `INSERT INTO user_notifications (user_id, title, body, related_order_code)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, title, body, relatedOrderCode ?? null],
  );
}

/** Notify all operators assigned to a society (via operator_societies). */
export async function notifySocietyOperators(
  societyId: string,
  title: string,
  body: string,
  relatedOrderCode?: string,
) {
  const ops = await query<{ user_id: string }>(
    `SELECT DISTINCT o.user_id
     FROM operators o
     JOIN operator_societies os ON os.operator_id = o.id
     WHERE os.society_id = $1 AND o.user_id IS NOT NULL
       AND COALESCE(o.status, 'active') = 'active'`,
    [societyId],
  );

  for (const op of ops.rows) {
    await createUserNotification(op.user_id, title, body, relatedOrderCode);
  }

  // Fallback: any operator linked to a unit in this society
  if (ops.rows.length === 0) {
    const fallback = await query<{ user_id: string }>(
      `SELECT DISTINCT o.user_id
       FROM operators o
       JOIN units u ON u.id = o.unit_id
       WHERE u.society_id = $1 AND o.user_id IS NOT NULL`,
      [societyId],
    );
    for (const op of fallback.rows) {
      await createUserNotification(op.user_id, title, body, relatedOrderCode);
    }
  }
}

export async function listUserNotifications(userId: string, limit = 30) {
  const result = await query(
    `SELECT id, title, body, is_read, related_order_code, created_at
     FROM user_notifications WHERE user_id = $1
     ORDER BY created_at DESC LIMIT $2`,
    [userId, limit],
  );
  return result.rows;
}

export async function markUserNotificationRead(notificationId: string, userId: string) {
  await query(
    `UPDATE user_notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
    [notificationId, userId],
  );
}

export async function countUnreadUserNotifications(userId: string) {
  const row = await queryOne<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM user_notifications WHERE user_id = $1 AND is_read = FALSE`,
    [userId],
  );
  return parseInt(row?.c ?? "0", 10);
}

export async function countUnreadResidentNotifications(residentId: string) {
  const row = await queryOne<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM notifications WHERE resident_id = $1 AND is_read = FALSE`,
    [residentId],
  );
  return parseInt(row?.c ?? "0", 10);
}
