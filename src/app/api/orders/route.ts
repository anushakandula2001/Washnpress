import { requireResident } from "@/backend/api/guards";
import { listOrdersByResident } from "@/backend/repositories/orders";
import { toResidentOrder } from "@/backend/api/transformers";
import { ok, serverError } from "@/backend/api/response";

export async function GET(request: Request) {
  try {
    const auth = await requireResident(request);
    if ("error" in auth) return auth.error;

    const orders = await listOrdersByResident(auth.session.residentId!);
    return ok({ orders: orders.map(toResidentOrder) });
  } catch (error) {
    return serverError(error instanceof Error ? error.message : "Failed to load orders");
  }
}
