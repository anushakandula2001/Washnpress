import { withErrorHandling } from "@/backend/api/response";
import { requireRole } from "@/backend/api/guards";
import { ok } from "@/backend/api/response";
import { getReportsBundle } from "@/backend/repositories/admin-commerce";

async function _GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  return ok(await getReportsBundle());
}


export const GET = withErrorHandling(_GET);
