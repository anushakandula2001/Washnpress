import { requireRole } from "@/backend/api/guards";
import { z } from "zod";
import { updatePlanPricing } from "@/backend/repositories/admin";
import { ok, badRequest } from "@/backend/api/response";

const schema = z.object({ planId: z.string().uuid(), monthlyInr: z.number().positive() });

export async function PATCH(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("planId and monthlyInr required");
  const plan = await updatePlanPricing(parsed.data.planId, parsed.data.monthlyInr);
  return ok({ plan });
}