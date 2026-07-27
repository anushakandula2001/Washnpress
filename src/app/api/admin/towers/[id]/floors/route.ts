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
      `SELECT id, floor_number, label FROM society_floors WHERE tower_id = $1 AND status = 'active' ORDER BY floor_number ASC`,
      [id]
    );
    return ok({ floors: res.rows });
  } catch (err) {
    console.error("Failed to load floors:", err);
    return ok({ floors: [] });
  }
}
