import { requireResident } from "@/backend/api/guards";
import { getOrderReceipt } from "@/backend/repositories/orders-ext";
import { ok, notFound } from "@/backend/api/response";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const receipt = await getOrderReceipt(id, auth.session.residentId!);
  if (!receipt) return notFound("Order not found");
  return ok(receipt);
}