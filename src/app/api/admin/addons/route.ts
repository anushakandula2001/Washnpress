import { z } from "zod";
import { requireRole } from "@/backend/api/guards";
import { ok, badRequest, created } from "@/backend/api/response";
import {
  listAddonsAdmin,
  upsertAddon,
  deleteAddon,
  setAddonActive,
} from "@/backend/repositories/admin-commerce";

export async function GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  return ok({ addons: await listAddonsAdmin(true) });
}

const schema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(2),
  name: z.string().min(1),
  description: z.string().min(1),
  priceInr: z.number().min(0),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
  action: z.enum(["upsert", "delete", "toggle"]).default("upsert"),
});

export async function POST(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());
  const a = parsed.data;
  try {
    if (a.action === "delete" && a.id) {
      await deleteAddon(a.id);
      return ok({ deleted: true });
    }
    if (a.action === "toggle" && a.id) {
      return ok({ addon: await setAddonActive(a.id, Boolean(a.isActive)) });
    }
    return created({ addon: await upsertAddon(a) });
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Failed");
  }
}
