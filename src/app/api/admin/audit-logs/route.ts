import { withErrorHandling } from "@/backend/api/response";
import { requireRole } from "@/backend/api/guards";
import { listAuditLogs } from "@/backend/repositories/admin";
import { ok } from "@/backend/api/response";

async function _GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const limit = parseInt(new URL(request.url).searchParams.get("limit") ?? "50", 10);
  return ok({ logs: await listAuditLogs(limit) });
}

export const GET = withErrorHandling(_GET);
