import { requireRole } from "@/backend/api/guards";
import { updateUnit } from "@/backend/repositories/admin";
import { ok } from "@/backend/api/response";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const unit = await updateUnit(id, await request.json());
  return ok({ unit });
}