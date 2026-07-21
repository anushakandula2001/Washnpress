import { requireRole } from "@/backend/api/guards";
import { ok, notFound } from "@/backend/api/response";
import { listOrdersAdmin, getOrderDetailAdmin } from "@/backend/repositories/admin";

export async function GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? url.searchParams.get("orderCode");
  if (id) {
    const detail = await getOrderDetailAdmin(id);
    if (!detail) return notFound("Order not found");
    return ok(detail);
  }
  return ok({
    orders: await listOrdersAdmin({
      status: url.searchParams.get("status") ?? undefined,
      societyId: url.searchParams.get("societyId") ?? undefined,
      residentId: url.searchParams.get("residentId") ?? undefined,
      operatorId: url.searchParams.get("operatorId") ?? undefined,
      q: url.searchParams.get("q") ?? undefined,
      filter: url.searchParams.get("filter") ?? undefined,
    }),
  });
}
