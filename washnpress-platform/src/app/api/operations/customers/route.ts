import { requireRole } from "@/backend/api/guards";
import {
  listOperatorSocietyIds,
  listResidentsForSocieties,
} from "@/backend/repositories/operations";
import { ok } from "@/backend/api/response";
import { query } from "@/backend/db/pool";

export async function GET(request: Request) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;

  const isAdmin = auth.session.roles.includes("admin");
  let societyIds = await listOperatorSocietyIds(auth.session.userId);

  if (isAdmin) {
    const all = await query<{ id: string }>(`SELECT id FROM societies`);
    societyIds = all.rows.map((r) => r.id);
  }

  const residents = await listResidentsForSocieties(societyIds);
  return ok({ residents, societyIds });
}
