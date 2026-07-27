import { query, queryOne } from "@/backend/db/pool";

export async function getProfileSettings(residentId: string) {
  return queryOne(
    `SELECT * FROM profile_settings WHERE resident_id = $1`,
    [residentId],
  );
}

export async function updateProfileSettings(
  residentId: string,
  data: { notificationsEnabled?: boolean; language?: string; marketingOptIn?: boolean },
) {
  return queryOne(
    `INSERT INTO profile_settings (resident_id, notifications_enabled, language, marketing_opt_in)
     VALUES ($1, COALESCE($2, TRUE), COALESCE($3, 'en'), COALESCE($4, FALSE))
     ON CONFLICT (resident_id) DO UPDATE SET
       notifications_enabled = COALESCE($2, profile_settings.notifications_enabled),
       language = COALESCE($3, profile_settings.language),
       marketing_opt_in = COALESCE($4, profile_settings.marketing_opt_in),
       updated_at = now()
     RETURNING *`,
    [residentId, data.notificationsEnabled ?? null, data.language ?? null, data.marketingOptIn ?? null],
  );
}

export async function requestAccountDeletion(userId: string, reason?: string) {
  return queryOne(
    `INSERT INTO account_deletion_requests (user_id, reason) VALUES ($1, $2) RETURNING *`,
    [userId, reason ?? null],
  );
}

export async function getResidentImpact(residentId: string) {
  const water = await queryOne<{ total_saved: string; total_garments: string }>(
    `SELECT COALESCE(SUM(wl.garment_count * wl.baseline_liters_per_garment - wl.actual_liters_used), 0)::text AS total_saved,
            COALESCE(SUM(wl.garment_count), 0)::text AS total_garments
     FROM water_logs wl
     JOIN orders o ON o.id = wl.order_id
     JOIN pickups p ON p.id = o.pickup_id
     WHERE p.resident_id = $1`,
    [residentId],
  );
  const saved = parseFloat(water?.total_saved ?? "0");
  return {
    waterSavedLiters: Math.round(Math.max(0, saved)),
    co2ReducedKg: Number((Math.max(0, saved) * 0.029).toFixed(1)),
    garmentsProcessed: parseInt(water?.total_garments ?? "0", 10),
    treesEquivalent: Number((Math.max(0, saved) / 800).toFixed(1)),
  };
}

export async function getTicketDetail(ticketId: string, residentId?: string) {
  const params: unknown[] = [ticketId];
  let sql = `SELECT * FROM support_tickets WHERE id = $1`;
  if (residentId) {
    sql += ` AND resident_id = $2`;
    params.push(residentId);
  }
  const ticket = await queryOne(sql, params);
  if (!ticket) return null;
  const messages = await query(
    `SELECT * FROM ticket_messages WHERE ticket_id = $1 ORDER BY created_at ASC`,
    [ticketId],
  );
  const attachments = await query(
    `SELECT * FROM ticket_attachments WHERE ticket_id = $1`,
    [ticketId],
  );
  return { ticket, messages: messages.rows, attachments: attachments.rows };
}

export async function replyToTicket(ticketId: string, userId: string, body: string) {
  await query(
    `INSERT INTO ticket_messages (ticket_id, sender_user_id, body) VALUES ($1, $2, $3)`,
    [ticketId, userId, body],
  );
  await query(`UPDATE support_tickets SET updated_at = now() WHERE id = $1`, [ticketId]);
}

export async function uploadTicketAttachment(ticketId: string, fileName: string, fileUrl: string) {
  return queryOne(
    `INSERT INTO ticket_attachments (ticket_id, file_name, file_url) VALUES ($1, $2, $3) RETURNING *`,
    [ticketId, fileName, fileUrl],
  );
}

export async function registerPushToken(userId: string, token: string, platform = "web") {
  return queryOne(
    `INSERT INTO push_notification_tokens (user_id, token, platform)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, token) DO UPDATE SET platform = $3
     RETURNING *`,
    [userId, token, platform],
  );
}
