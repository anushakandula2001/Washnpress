import { requireRole } from "@/backend/api/guards";
import { z } from "zod";
import { updateUserRoles } from "@/backend/repositories/admin";
import { ok, badRequest } from "@/backend/api/response";

const schema = z.object({ roles: z.array(z.enum(["resident", "operator", "admin"])) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("roles array required");
  const user = await updateUserRoles(id, parsed.data.roles);
  return ok({ user });
}