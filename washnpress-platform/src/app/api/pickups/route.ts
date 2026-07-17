import { z } from "zod";
import { requireResident } from "@/backend/api/guards";
import { findNextPickup } from "@/backend/repositories/pickups";
import { bookPickup } from "@/backend/services/pickup-service";
import { toPickupSlot } from "@/backend/api/transformers";
import { ok, badRequest, created } from "@/backend/api/response";

const bookSchema = z.object({
  slotId: z.string().uuid(),
  specialInstructions: z.string().optional(),
  recurring: z.boolean().optional(),
});

export async function GET(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const pickup = await findNextPickup(auth.session.residentId!);
  if (!pickup) return ok({ pickup: null });
  return ok({
    pickup: {
      id: pickup.id, date: pickup.slot_date ?? pickup.scheduled_for.split("T")[0],
      startTime: pickup.start_time?.slice(0, 5) ?? "10:00",
      endTime: pickup.end_time?.slice(0, 5) ?? "12:00",
      window: pickup.window ?? "Morning", status: pickup.status,
      specialInstructions: pickup.special_instructions,
    },
  });
}

export async function POST(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const parsed = bookSchema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());
  try {
    const { pickup, slot } = await bookPickup({
      residentId: auth.session.residentId!,
      societyId: auth.session.societyId!,
      slotId: parsed.data.slotId,
      specialInstructions: parsed.data.specialInstructions,
      recurring: parsed.data.recurring,
    });
    return created({ pickup, slot: toPickupSlot(slot) });
  } catch (e) {
    return badRequest(e instanceof Error ? e.message : "Booking failed");
  }
}