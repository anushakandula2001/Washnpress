import { requireRole } from "@/backend/api/guards";
import { ok, badRequest, notFound } from "@/backend/api/response";
import {
  listAdminPickups,
  getAdminPickupStats,
  getAdminPickupDetail,
  updateAdminPickup,
} from "@/backend/repositories/admin-commerce";

export async function GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    const detail = await getAdminPickupDetail(id);
    if (!detail) return notFound("Pickup not found");
    return ok(detail);
  }

  const filter = url.searchParams.get("filter") ?? undefined;
  const societyId = url.searchParams.get("societyId") ?? undefined;
  const operatorId = url.searchParams.get("operatorId") ?? undefined;
  const q = url.searchParams.get("q") ?? undefined;
  const includeStats = url.searchParams.get("stats") === "1";

  const pickups = await listAdminPickups({ filter, societyId, operatorId, q });
  const payload: Record<string, unknown> = { pickups, total: pickups.length };
  if (includeStats) {
    payload.stats = await getAdminPickupStats();
  }
  return ok(payload);
}

export async function PATCH(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const body = await request.json();
  if (!body.pickupId) return badRequest("pickupId required");
  const row = await updateAdminPickup(body.pickupId, {
    status: body.status,
    specialInstructions: body.specialInstructions,
  });
  if (!row) return badRequest("No valid fields to update");
  return ok({ pickup: row });
}
