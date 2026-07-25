import { requireRole } from "@/backend/api/guards";
import { ok } from "@/backend/api/response";
import { query } from "@/backend/db/pool";

export async function GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;

  try {
    const res = await query(
      `SELECT id, tier, garment_cap, turnaround_hours, monthly_inr FROM plans WHERE is_active = true ORDER BY monthly_inr ASC`
    );
    return ok({ plans: res.rows });
  } catch (err) {
    console.error("Failed to load plans:", err);
    return ok({ plans: [] });
  }
}
