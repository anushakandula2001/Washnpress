import { requireRole } from "@/backend/api/guards";
import { getActiveRoutes } from "@/backend/repositories/operations";
import { ok } from "@/backend/api/response";

export async function GET(request: Request) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;
  return ok({ routes: await getActiveRoutes(auth.session.userId) });
}