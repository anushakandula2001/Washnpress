import { withErrorHandling } from "@/backend/api/response";
import { requireResident } from "@/backend/api/guards";
import { getOrderTracking } from "@/backend/repositories/orders-ext";
import { toResidentOrder } from "@/backend/api/transformers";
import { ok, notFound } from "@/backend/api/response";
async function _GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const data = await getOrderTracking(id, auth.session.residentId!);
  if (!data) return notFound("Order not found");
  return ok({ order: toResidentOrder(data.order), events: data.events });
}

export const GET = withErrorHandling(_GET);
