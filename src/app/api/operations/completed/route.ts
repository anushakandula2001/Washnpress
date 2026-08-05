import { withErrorHandling } from "@/backend/api/response";
import { requireRole } from "@/backend/api/guards";
import { query } from "@/backend/db/pool";
import { ok } from "@/backend/api/response";
import { listOperatorSocietyIds } from "@/backend/repositories/operations";

async function _GET(request: Request) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;

  const isAdmin = (auth.session.roles ?? []).includes("admin");
  const assigned = isAdmin ? [] : await listOperatorSocietyIds(auth.session.userId);

  if (!isAdmin && assigned.length === 0) {
    return ok({ completed: [] });
  }

  let sql = `
    SELECT o.order_code, o.status, o.pickup_garment_count, o.updated_at as completed_at,
           r.unit_number, r.tower_block, s.name AS society_name,
           COALESCE(u.full_name, 'Resident') AS resident_name
    FROM orders o
    JOIN pickups p ON p.id = o.pickup_id
    JOIN residents r ON r.id = p.resident_id
    JOIN societies s ON s.id = p.society_id
    JOIN users u ON u.id = r.user_id
    WHERE o.status = 'Delivered'
  `;
  const params: unknown[] = [];
  if (!isAdmin && assigned.length > 0) {
    sql += ` AND p.society_id = ANY($1::uuid[])`;
    params.push(assigned);
  }
  sql += ` ORDER BY o.updated_at DESC LIMIT 50`;

  const result = await query(sql, params);
  return ok({ completed: result.rows });
}


export const GET = withErrorHandling(_GET);
