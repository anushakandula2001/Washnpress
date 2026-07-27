import { z } from "zod";
import { requireResident } from "@/backend/api/guards";
import { setPickupRecurring } from "@/backend/repositories/pickups-ext";
import { ok, badRequest } from "@/backend/api/response";

const schema = z.object({ recurring: z.boolean(), recurringDay: z.string().optional() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());
  const pickup = await setPickupRecurring(id, auth.session.residentId!, parsed.data.recurring, parsed.data.recurringDay);
  return ok({ pickup });
}