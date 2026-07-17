import { requireResident } from "@/backend/api/guards";
import { listOrdersByResident } from "@/backend/repositories/orders";
import { toResidentOrder } from "@/backend/api/transformers";
import { ok, unauthorized } from "@/backend/api/response";

export async function GET(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const session = auth.session;

  const orders = await listOrdersByResident(session.residentId!);
  return ok({ orders: orders.map(toResidentOrder) });
}
