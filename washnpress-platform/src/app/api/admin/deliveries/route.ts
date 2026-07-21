import { requireRole } from "@/backend/api/guards";
import { ok, badRequest, notFound } from "@/backend/api/response";
import {
  listAdminDeliveries,
  assignAdminDeliveryOperator,
  rescheduleAdminDelivery,
  addAdminDeliveryNote,
} from "@/backend/repositories/admin-commerce";

export async function GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const url = new URL(request.url);
  return ok({
    deliveries: await listAdminDeliveries({
      filter: url.searchParams.get("filter") ?? undefined,
      q: url.searchParams.get("q") ?? undefined,
      societyId: url.searchParams.get("societyId") ?? undefined,
      operatorId: url.searchParams.get("operatorId") ?? undefined,
    }),
  });
}

export async function PATCH(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const body = await request.json();
  const orderId = body.orderId as string | undefined;
  if (!orderId) return badRequest("orderId required");

  if (body.operatorId) {
    try {
      const result = await assignAdminDeliveryOperator(
        orderId,
        body.operatorId,
        auth.session.userId,
      );
      return ok(result);
    } catch (err) {
      return badRequest(err instanceof Error ? err.message : "Assign failed");
    }
  }

  if (body.scheduledFor) {
    const result = await rescheduleAdminDelivery(orderId, body.scheduledFor, auth.session.userId);
    if (!result) return notFound("Order not found");
    return ok(result);
  }

  if (body.note) {
    await addAdminDeliveryNote(orderId, body.note, auth.session.userId);
    return ok({ saved: true });
  }

  return badRequest("Nothing to update");
}
