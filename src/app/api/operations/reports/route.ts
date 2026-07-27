import { requireRole } from "@/backend/api/guards";
import { ok } from "@/backend/api/response";
import { getOperationsReports } from "@/backend/repositories/operations";

export async function GET(request: Request) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;
  
  const isAdmin = auth.session.roles.includes("admin");
  const reports = await getOperationsReports(auth.session.userId, isAdmin);
  
  return ok(reports);
}
