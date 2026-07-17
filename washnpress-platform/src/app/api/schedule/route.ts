import { z } from "zod";
import { requireResident } from "@/backend/api/guards";
import { selectPickupSlot, bookPickup } from "@/backend/services/pickup-service";
import { toPickupSlot } from "@/backend/api/transformers";
import { ok, unauthorized, badRequest, notFound } from "@/backend/api/response";
import type { TimeWindow } from "@/lib/types";

const scheduleSchema = z.object({
  preferredWindows: z.array(z.enum(["Morning", "Afternoon", "Evening"])).default([]),
  nowIso: z.string().datetime().optional(),
  slotId: z.string().uuid().optional(),
  specialInstructions: z.string().optional(),
  book: z.boolean().default(false),
});

export async function POST(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const session = auth.session;

  const body = await request.json();
  const parsed = scheduleSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Invalid request", parsed.error.flatten());
  }

  const now = parsed.data.nowIso ? new Date(parsed.data.nowIso) : new Date();

  if (parsed.data.slotId && parsed.data.book) {
    try {
      const { pickup, slot } = await bookPickup({
        residentId: session.residentId!,
        societyId: session.societyId!,
        slotId: parsed.data.slotId,
        specialInstructions: parsed.data.specialInstructions,
      });
      return ok({ pickup, slot: toPickupSlot(slot) });
    } catch (error) {
      return badRequest(error instanceof Error ? error.message : "Booking failed");
    }
  }

  const slot = await selectPickupSlot(
    session.societyId!,
    parsed.data.preferredWindows as TimeWindow[],
    now,
  );

  if (!slot) return notFound("No slot available");

  return ok({ slot: toPickupSlot(slot) });
}
