import { requireRole } from "@/backend/api/guards";
import { getOperatorEarnings } from "@/backend/repositories/operations";
import { ok } from "@/backend/api/response";

export async function GET(request: Request) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;
  return ok({ earnings: await getOperatorEarnings(auth.session.userId) });
}