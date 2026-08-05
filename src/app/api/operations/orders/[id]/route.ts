import { withErrorHandling } from "@/backend/api/response";
import { requireRole } from "@/backend/api/guards";
import { findOrderByCode, listOrderEvents, listOrderItems } from "@/backend/repositories/orders";
import { toResidentOrder } from "@/backend/api/transformers";
import { ok, notFound } from "@/backend/api/response";

async function _GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const order = await findOrderByCode(id);
  if (!order) return notFound("Order not found");
  const [events, items] = await Promise.all([listOrderEvents(order.id), listOrderItems(order.id)]);
  return ok({ order: toResidentOrder(order), events, items });
}

export const GET = withErrorHandling(_GET);
