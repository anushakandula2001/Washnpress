import { requireRole } from "@/backend/api/guards";
import { processOfflineSync } from "@/backend/repositories/operations";
import { ok, created } from "@/backend/api/response";

export async function POST(request: Request) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;
  const payload = await request.json();
  const batch = await processOfflineSync(auth.session.userId, payload);
  return created({ batch });
}