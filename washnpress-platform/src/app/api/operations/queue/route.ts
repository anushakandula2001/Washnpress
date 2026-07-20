import { requireRole } from "@/backend/api/guards";
import {
  getOperationsQueue,
  listOperatorSocietyIds,
} from "@/backend/repositories/operations";
import { ok, forbidden } from "@/backend/api/response";

export async function GET(request: Request) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;

  const isAdmin = auth.session.roles.includes("admin");
  const societyId = new URL(request.url).searchParams.get("societyId");
  const assigned = isAdmin ? [] : await listOperatorSocietyIds(auth.session.userId);

  if (!isAdmin && assigned.length === 0) {
    return ok({ queue: [] });
  }

  if (societyId) {
    if (!isAdmin && !assigned.includes(societyId)) {
      return forbidden("Society not assigned to this operator");
    }
    return ok({ queue: await getOperationsQueue([societyId]) });
  }

  return ok({
    queue: await getOperationsQueue(isAdmin ? undefined : assigned),
  });
}
