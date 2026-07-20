import { requireRole } from "@/backend/api/guards";
import { ok } from "@/backend/api/response";
import { listAdminPickups } from "@/backend/repositories/admin-commerce";

export async function GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const filter = new URL(request.url).searchParams.get("filter") ?? undefined;
  return ok({ pickups: await listAdminPickups(filter ?? undefined) });
}
