import { withErrorHandling } from "@/backend/api/response";
import { requireRole } from "@/backend/api/guards";
import { ok } from "@/backend/api/response";
import { query } from "@/backend/db/pool";

async function _GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;

  try {
    const res = await query(
      `SELECT DISTINCT city FROM operators WHERE city IS NOT NULL AND status = 'active' ORDER BY city ASC`
    );
    const cities = res.rows.map((row: any) => row.city);
    return ok({ cities });
  } catch (err) {
    console.error("Failed to load operator cities:", err);
    return ok({ cities: [] });
  }
}


export const GET = withErrorHandling(_GET);
