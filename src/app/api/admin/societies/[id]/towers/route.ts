import { requireRole } from "@/backend/api/guards";
import { ok } from "@/backend/api/response";
import { query } from "@/backend/db/pool";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;

  const { id } = await params;

  try {
    const res = await query(
      `SELECT id, name FROM society_towers WHERE society_id = $1 AND status = 'active' ORDER BY name ASC`,
      [id]
    );
    return ok({ towers: res.rows });
  } catch (err) {
    console.error("Failed to load towers:", err);
    return ok({ towers: [] });
  }
}
