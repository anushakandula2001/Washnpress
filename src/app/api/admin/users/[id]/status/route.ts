import { requireRole } from "@/backend/api/guards";
import { z } from "zod";
import { logAudit, setUserStatus } from "@/backend/repositories/admin";
import { queryOne } from "@/backend/db/pool";
import { ok, badRequest, notFound } from "@/backend/api/response";

const schema = z.object({ status: z.enum(["active", "blocked", "deleted"]) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("status required");

  const existing = await queryOne<{ status: string }>(`SELECT status FROM users WHERE id = $1`, [id]);
  if (!existing) return notFound("User not found");

  const user = await setUserStatus(id, parsed.data.status);

  await logAudit({
    actorUserId: auth.session.userId,
    actorRole: "admin",
    action: "update_user_status",
    entityName: "users",
    entityId: id,
    beforeState: { status: existing.status },
    afterState: { status: parsed.data.status },
  });

  return ok({ user });
}
