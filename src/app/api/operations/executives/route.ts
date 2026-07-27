import { requireRole } from "@/backend/api/guards";
import { ok } from "@/backend/api/response";
import { listExecutiveAssignments } from "@/backend/repositories/master-data";
import { listOperatorSocietyIds } from "@/backend/repositories/operations";

export async function GET(request: Request) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;

  const isAdmin = auth.session.roles.includes("admin");
  const societyId = new URL(request.url).searchParams.get("societyId");

  let ids: string[] = [];
  if (!isAdmin) {
    ids = await listOperatorSocietyIds(auth.session.userId);
    if (ids.length === 0) return ok({ assignments: [] });
  }

  // Find assignments for all assigned societies, or specifically requested one
  const assignments = await listExecutiveAssignments(societyId || undefined);

  if (!isAdmin) {
    const filtered = assignments.filter((a: any) => ids.includes(a.society_id));
    return ok({ assignments: filtered });
  }

  return ok({ assignments });
}
