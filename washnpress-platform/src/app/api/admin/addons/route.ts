import { requireRole } from "@/backend/api/guards";
import { z } from "zod";
import { updateAddonPricing } from "@/backend/repositories/admin";
import { ok, badRequest } from "@/backend/api/response";

const schema = z.object({ addonId: z.string().uuid(), priceInr: z.number().min(0) });

export async function PATCH(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("addonId and priceInr required");
  const addon = await updateAddonPricing(parsed.data.addonId, parsed.data.priceInr);
  return ok({ addon });
}