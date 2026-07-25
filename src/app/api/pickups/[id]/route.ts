import { z } from "zod";
import { requireResident } from "@/backend/api/guards";
import { cancelPickup, findPickupById } from "@/backend/repositories/pickups-ext";
import { rescheduleResidentPickup } from "@/backend/services/pickup-service";
import { toPickupSlot } from "@/backend/api/transformers";
import { ok, badRequest, notFound } from "@/backend/api/response";

const patchSchema = z.object({ slotId: z.string().uuid() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) return badRequest("slotId required");
  try {
    const slot = await rescheduleResidentPickup(auth.session.residentId!, parsed.data.slotId);
    return ok({ pickupId: id, slot: toPickupSlot(slot) });
  } catch (e) {
    return badRequest(e instanceof Error ? e.message : "Reschedule failed");
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  try {
    const pickup = await cancelPickup(id, auth.session.residentId!);
    if (!pickup) return notFound("Pickup not found");
    return ok({ cancelled: true });
  } catch (e) {
    return badRequest(e instanceof Error ? e.message : "Cancel failed");
  }
}