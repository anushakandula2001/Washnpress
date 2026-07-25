import { requireRole } from "@/backend/api/guards";
import { getOperationsAnalytics } from "@/backend/repositories/admin";
import { ok } from "@/backend/api/response";

export async function GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  return ok(await getOperationsAnalytics());
}