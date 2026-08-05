import { withErrorHandling } from "@/backend/api/response";
import { requireRole } from "@/backend/api/guards";
import { ok } from "@/backend/api/response";
import { query } from "@/backend/db/pool";

async function _GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;

  const { id } = await context.params;

  try {
    const res = await query(
      `SELECT s.id as subscription_id, 
              s.started_at, 
              s.expires_at, 
              s.is_active as subscription_status,
              u.full_name as resident_name, 
              u.phone, 
              u.email,
              r.unit_number,
              soc.name as society_name
       FROM subscriptions s
       JOIN residents r ON s.resident_id = r.id
       JOIN users u ON r.user_id = u.id
       JOIN societies soc ON r.society_id = soc.id
       WHERE s.plan_id = $1
       ORDER BY s.started_at DESC`,
      [id]
    );

    return ok({ subscribers: res.rows });
  } catch (err) {
    console.error("Failed to load subscribers:", err);
    return ok({ subscribers: [] });
  }
}

export const GET = withErrorHandling(_GET);
