import { requireRole } from "@/backend/api/guards";
import { z } from "zod";
import { listAdminSlots, createSlot } from "@/backend/repositories/admin";
import { ok, badRequest, created } from "@/backend/api/response";

const schema = z.object({
  societyId: z.string().uuid(), slotDate: z.string(), slotWindow: z.string(),
  startTime: z.string(), endTime: z.string(), capacityTotal: z.number().int().positive(),
});

export async function GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const societyId = new URL(request.url).searchParams.get("societyId") ?? undefined;
  return ok({ slots: await listAdminSlots(societyId) });
}

export async function POST(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());
  const slot = await createSlot(parsed.data);
  return created({ slot });
}