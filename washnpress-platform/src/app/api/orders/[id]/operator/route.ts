import { requireResident } from "@/backend/api/guards";
import { getMaskedOperator } from "@/backend/repositories/orders-ext";
import { ok, notFound } from "@/backend/api/response";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const operator = await getMaskedOperator(id);
  if (!operator) return notFound("Operator not assigned");
  return ok({ operator });
}