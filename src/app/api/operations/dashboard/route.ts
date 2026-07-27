import { requireRole } from "@/backend/api/guards";
import { ok } from "@/backend/api/response";
import { query, queryOne } from "@/backend/db/pool";
import { getOperatorByUserId } from "@/backend/repositories/operations";
import { countUnreadUserNotifications } from "@/backend/repositories/notifications";

async function societyFilter(userId: string, isAdmin: boolean) {
  if (isAdmin) return { clause: "", params: [] as unknown[] };

  const op = await getOperatorByUserId(userId);
  if (!op) return { clause: " AND FALSE", params: [] as unknown[] };

  const assigned = await query<{ society_id: string }>(
    `SELECT society_id FROM operator_societies WHERE operator_id = $1`,
    [op.id],
  );
  const ids = assigned.rows.map((r) => r.society_id);
  if (ids.length === 0 && op.unit_id) {
    const unit = await queryOne<{ society_id: string }>(
      `SELECT society_id FROM units WHERE id = $1`,
      [op.unit_id],
    );
    if (unit) ids.push(unit.society_id);
  }
  if (ids.length === 0) return { clause: " AND FALSE", params: [] as unknown[] };

  return {
    clause: ` AND p.society_id = ANY($1::uuid[])`,
    params: [ids] as unknown[],
  };
}

export async function GET(request: Request) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;

  const isAdmin = auth.session.roles.includes("admin");
  const filter = await societyFilter(auth.session.userId, isAdmin);

  const counts = await queryOne<Record<string, string>>(
    `SELECT
       COUNT(*) FILTER (WHERE p.scheduled_for::date = CURRENT_DATE AND o.status IN ('Scheduled', 'Pickup Scheduled'))::text AS today_pickups,
       COUNT(*) FILTER (WHERE o.status IN ('Scheduled', 'Pickup Scheduled', 'Accepted'))::text AS pending_pickups,
       COUNT(*) FILTER (WHERE o.status ILIKE '%wash%')::text AS washing,
       COUNT(*) FILTER (WHERE o.status ILIKE '%dry%')::text AS drying,
       COUNT(*) FILTER (WHERE o.status ILIKE '%iron%')::text AS ironing,
       COUNT(*) FILTER (WHERE o.status ILIKE '%quality%' OR o.status ILIKE '%qc%')::text AS qc,
       COUNT(*) FILTER (WHERE o.status ILIKE '%ready%')::text AS ready_delivery,
       COUNT(*) FILTER (WHERE o.status = 'Delivered' AND o.updated_at::date = CURRENT_DATE)::text AS completed_today,
       COUNT(*) FILTER (
         WHERE o.status NOT IN ('Delivered', 'Cancelled')
           AND p.scheduled_for < now() - INTERVAL '4 hours'
       )::text AS delayed
     FROM orders o
     JOIN pickups p ON p.id = o.pickup_id
     WHERE 1=1 ${filter.clause}`,
    filter.params,
  );

  const recent = await query(
    `SELECT o.order_code, o.status, o.updated_at, s.name AS society_name,
            COALESCE(u.full_name, 'Resident') AS resident_name
     FROM orders o
     JOIN pickups p ON p.id = o.pickup_id
     JOIN residents r ON r.id = p.resident_id
     JOIN users u ON u.id = r.user_id
     JOIN societies s ON s.id = p.society_id
     WHERE 1=1 ${filter.clause}
     ORDER BY o.updated_at DESC
     LIMIT 8`,
    filter.params,
  );

  const unread = await countUnreadUserNotifications(auth.session.userId);

  return ok({
    kpis: {
      todayPickups: parseInt(counts?.today_pickups ?? "0", 10),
      pendingPickups: parseInt(counts?.pending_pickups ?? "0", 10),
      washing: parseInt(counts?.washing ?? "0", 10),
      drying: parseInt(counts?.drying ?? "0", 10),
      ironing: parseInt(counts?.ironing ?? "0", 10),
      qc: parseInt(counts?.qc ?? "0", 10),
      readyDelivery: parseInt(counts?.ready_delivery ?? "0", 10),
      completedToday: parseInt(counts?.completed_today ?? "0", 10),
      delayed: parseInt(counts?.delayed ?? "0", 10),
      unreadNotifications: unread,
    },
    recentActivity: recent.rows,
  });
}
