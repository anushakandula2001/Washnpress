import { requireRole } from "@/backend/api/guards";
import { z } from "zod";
import { listUsers, logAudit, updateUserRoles } from "@/backend/repositories/admin";
import { ok, badRequest } from "@/backend/api/response";

const schema = z.object({ roles: z.array(z.enum(["resident", "operator", "admin"])) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("roles array required");

  const beforeUsers = await listUsers();
  const beforeUser = beforeUsers.find((u) => (u as { id: string }).id === id) as
    | { id: string; roles: string[]; full_name?: string; phone?: string }
    | undefined;

  const user = await updateUserRoles(id, parsed.data.roles);

  await logAudit({
    actorUserId: auth.session.userId,
    actorRole: "admin",
    action: "update_user_roles",
    entityName: "users",
    entityId: id,
    beforeState: beforeUser
      ? { roles: beforeUser.roles, full_name: beforeUser.full_name, phone: beforeUser.phone }
      : undefined,
    afterState: { roles: parsed.data.roles },
  });

  return ok({ user });
}