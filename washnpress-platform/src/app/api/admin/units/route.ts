import { requireRole } from "@/backend/api/guards";
import { z } from "zod";
import { listUnits, createUnit } from "@/backend/repositories/admin";
import { ok, badRequest, created } from "@/backend/api/response";

const schema = z.object({
  societyId: z.string().uuid(), unitCode: z.string(),
  equipmentModel: z.string().optional(), waterRecyclingEnabled: z.boolean().optional(),
  baseDrawInr: z.number().optional(), revenueSharePercent: z.number().optional(),
});

export async function GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const societyId = new URL(request.url).searchParams.get("societyId") ?? undefined;
  return ok({ units: await listUnits(societyId) });
}

export async function POST(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());
  const unit = await createUnit(parsed.data);
  return created({ unit });
}