import { withErrorHandling } from "@/backend/api/response";
import { requireRole } from "@/backend/api/guards";
import { ok, forbidden, notFound } from "@/backend/api/response";
import { listOrdersAdmin } from "@/backend/repositories/admin";
import { listOperatorSocietyIds } from "@/backend/repositories/operations";

async function _GET(request: Request) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;

  const isAdmin = (auth.session.roles ?? []).includes("admin");
  const assignedSocieties = isAdmin ? [] : await listOperatorSocietyIds(auth.session.userId);

  if (!isAdmin && assignedSocieties.length === 0) {
    return ok({ orders: [] });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? url.searchParams.get("orderCode");

  if (id) {
    const { getOrderDetailAdmin } = await import("@/backend/repositories/admin");
    const detail = await getOrderDetailAdmin(id);
    if (!detail) return notFound("Order not found");
    // Secure it by checking society
    const order = detail.order as Record<string, unknown>;
    const orderSocietyId = String(order.society_id);
    if (!isAdmin && !assignedSocieties.includes(orderSocietyId)) {
      return forbidden("Forbidden");
    }
    return ok(detail);
  }

  const requestedSocietyId = url.searchParams.get("societyId");
  let finalSocietyId: string | string[] | undefined;
  if (isAdmin) {
    finalSocietyId = requestedSocietyId ?? undefined;
  } else {
    if (requestedSocietyId) {
      if (!assignedSocieties.includes(requestedSocietyId)) {
        return ok({ orders: [] });
      }
      finalSocietyId = requestedSocietyId;
    } else {
      finalSocietyId = assignedSocieties;
    }
  }
  
  return ok({
    orders: await listOrdersAdmin({
      status: url.searchParams.get("status") ?? undefined,
      societyId: finalSocietyId,
      residentId: url.searchParams.get("residentId") ?? undefined,
      operatorId: url.searchParams.get("operatorId") ?? undefined,
      q: url.searchParams.get("q") ?? undefined,
      filter: url.searchParams.get("filter") ?? undefined,
    }),
  });
}


export const GET = withErrorHandling(_GET);
