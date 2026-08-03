import { withErrorHandling } from "@/backend/api/response";
import { requireRole } from "@/backend/api/guards";
import { getOperationsAnalytics } from "@/backend/repositories/admin";
import { ok } from "@/backend/api/response";

async function _GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  return ok(await getOperationsAnalytics());
}

export const GET = withErrorHandling(_GET);
