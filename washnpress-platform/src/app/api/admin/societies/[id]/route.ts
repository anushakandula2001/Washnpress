import { requireRole } from "@/backend/api/guards";
import { updateSociety } from "@/backend/repositories/admin";
import { logAudit } from "@/backend/repositories/admin";
import { ok } from "@/backend/api/response";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const body = await request.json();
  const society = await updateSociety(id, body);
  await logAudit({ actorUserId: auth.session.userId, actorRole: "admin", action: "update_society", entityName: "societies", entityId: id, afterState: society });
  return ok({ society });
}