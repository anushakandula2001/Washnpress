import { requireRole } from "@/backend/api/guards";
import { ok, notFound, badRequest } from "@/backend/api/response";
import {
  getOperatorDetail,
  setOperatorStatus,
  listOperatorsDetailed,
} from "@/backend/repositories/admin";
import { query } from "@/backend/db/pool";

export async function GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const id = new URL(request.url).searchParams.get("id");
  if (id) {
    const detail = await getOperatorDetail(id);
    if (!detail) return notFound("Operator not found");
    return ok(detail);
  }
  return ok({ operators: await listOperatorsDetailed() });
}

export async function PATCH(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const body = await request.json();
  if (!body.operatorId) return badRequest("operatorId required");

  if (body.status) {
    const row = await setOperatorStatus(body.operatorId, body.status);
    if (!row) return notFound("Operator not found");
    return ok({ operator: row });
  }

  if (body.transferSocietyId) {
    await query(
      `INSERT INTO operator_societies (operator_id, society_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [body.operatorId, body.transferSocietyId],
    );
    if (body.replaceSocietyId) {
      await query(
        `DELETE FROM operator_societies WHERE operator_id = $1 AND society_id = $2`,
        [body.operatorId, body.replaceSocietyId],
      );
    }
    return ok({ transferred: true });
  }

  return badRequest("Nothing to update");
}
