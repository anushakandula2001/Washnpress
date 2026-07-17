import { requireRole } from "@/backend/api/guards";
import { z } from "zod";
import { createSociety } from "@/backend/repositories/admin";
import { logAudit } from "@/backend/repositories/admin";
import { ok, badRequest, created } from "@/backend/api/response";

const schema = z.object({
  name: z.string(), city: z.string(), state: z.string(),
  addressLine1: z.string().optional(), pincode: z.string().optional(), status: z.string().optional(),
});

export async function POST(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());
  const society = await createSociety(parsed.data);
  await logAudit({ actorUserId: auth.session.userId, actorRole: "admin", action: "create_society", entityName: "societies", entityId: (society as {id:string}).id, afterState: society });
  return created({ society });
}