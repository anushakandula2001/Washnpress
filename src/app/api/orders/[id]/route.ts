import { withErrorHandling } from "@/backend/api/response";
import { requireResident } from "@/backend/api/guards";
import { cancelResidentOrder, findOrderByCode, listOrderEvents, listOrderItems } from "@/backend/repositories/orders";
import { toResidentOrder } from "@/backend/api/transformers";
import { ok, badRequest, notFound } from "@/backend/api/response";

async function _GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const session = auth.session;

  const { id } = await params;
  const order = await findOrderByCode(id, session.residentId!);
  if (!order) return notFound("Order not found");

  const [events, items] = await Promise.all([
    listOrderEvents(order.id),
    listOrderItems(order.id),
  ]);

  return ok({
    order: toResidentOrder(order),
    events,
    items,
  });
}

async function _DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  try {
    const order = await cancelResidentOrder(id, auth.session.residentId!);
    if (!order) return notFound("Order not found or cannot be cancelled");
    return ok({ cancelled: true, order: toResidentOrder(order) });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unable to cancel order");
  }
}


export const GET = withErrorHandling(_GET);
export const DELETE = withErrorHandling(_DELETE);
