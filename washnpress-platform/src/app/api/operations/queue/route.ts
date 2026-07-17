import { requireRole } from "@/backend/api/guards";
import { getOperationsQueue } from "@/backend/repositories/operations";
import { ok } from "@/backend/api/response";

export async function GET(request: Request) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;
  const societyId = new URL(request.url).searchParams.get("societyId") ?? undefined;
  return ok({ queue: await getOperationsQueue(societyId ?? undefined) });
}