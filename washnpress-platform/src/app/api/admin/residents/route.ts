import { requireRole } from "@/backend/api/guards";
import { ok, badRequest, notFound } from "@/backend/api/response";
import {
  listResidentsAdmin,
  getResidentDetail,
  setResidentUserStatus,
} from "@/backend/repositories/admin";

export async function GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    const detail = await getResidentDetail(id);
    if (!detail) return notFound("Resident not found");
    return ok(detail);
  }

  const residents = await listResidentsAdmin({
    q: url.searchParams.get("q") ?? undefined,
    societyId: url.searchParams.get("societyId") ?? undefined,
    tower: url.searchParams.get("tower") ?? undefined,
    subscription: url.searchParams.get("subscription") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
  });
  return ok({ residents, total: residents.length });
}

export async function PATCH(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const body = await request.json();
  if (!body.residentId || !body.status) return badRequest("residentId and status required");
  const row = await setResidentUserStatus(body.residentId, body.status);
  if (!row) return notFound("Resident not found");
  return ok({ user: row });
}
