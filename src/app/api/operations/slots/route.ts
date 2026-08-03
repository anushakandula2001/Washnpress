import { z } from "zod";
import { requireRole } from "@/backend/api/guards";
import { ok, badRequest, created, notFound, forbidden } from "@/backend/api/response";
import {
  createManagedSlot,
  updateManagedSlot,
  deleteManagedSlot,
  listAllSlotsBySociety,
  findSlotById,
  checkDuplicateSlot,
} from "@/backend/repositories/pickups";
import { getOperatorByUserId } from "@/backend/repositories/operations";
import { query } from "@/backend/db/pool";

const createSchema = z.object({
  societyId: z.string().uuid(),
  slotDate: z.string().min(8),
  slotWindow: z.enum(["Morning", "Afternoon", "Evening"]),
  startTime: z.string().min(4),
  endTime: z.string().min(4),
  capacityTotal: z.number().int().positive().max(500),
});

const updateSchema = z.object({
  slotId: z.string().uuid(),
  slotDate: z.string().optional(),
  slotWindow: z.enum(["Morning", "Afternoon", "Evening"]).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  capacityTotal: z.number().int().positive().max(500).optional(),
  isActive: z.boolean().optional(),
});

async function getOperatorSocieties(userId: string, isAdmin: boolean) {
  if (isAdmin) {
    const all = await query<{ id: string; name: string }>(`SELECT id, name FROM societies ORDER BY name`);
    return all.rows;
  }

  const op = await getOperatorByUserId(userId);
  if (!op) return [];

  const assigned = await query<{ id: string; name: string }>(
    `SELECT s.id, s.name FROM societies s JOIN operator_societies os ON os.society_id = s.id WHERE os.operator_id = $1 ORDER BY s.name`,
    [op.id],
  );
  if (assigned.rows.length > 0) return assigned.rows;

  if (op.unit_id) {
    const unit = await query<{ id: string; name: string }>(
      `SELECT s.id, s.name FROM societies s JOIN units u ON u.society_id = s.id WHERE u.id = $1`,
      [op.unit_id],
    );
    return unit.rows;
  }
  return [];
}

export async function GET(request: Request) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;

  const isAdmin = (auth.session.roles ?? []).includes("admin");
  const allowedSocieties = await getOperatorSocieties(auth.session.userId, isAdmin);
  const allowed = allowedSocieties.map((s) => s.id);
  const societyId = new URL(request.url).searchParams.get("societyId");

  if (societyId) {
    if (!allowed.includes(societyId) && !isAdmin) {
      return forbidden("Society not assigned to this operator");
    }
    const slots = await listAllSlotsBySociety(societyId);
    return ok({ slots, societies: allowedSocieties });
  }

  const slots = [];
  for (const id of allowed) {
    slots.push(...(await listAllSlotsBySociety(id)));
  }
  return ok({ slots, societies: allowedSocieties });
}

export async function POST(request: Request) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());

  const isAdmin = (auth.session.roles ?? []).includes("admin");
  const allowed = (await getOperatorSocieties(auth.session.userId, isAdmin)).map(s => s.id);
  if (!allowed.includes(parsed.data.societyId) && !isAdmin) {
    return forbidden("Society not assigned to this operator");
  }

  // Validate date is not in the past
  const slotDateObj = new Date(parsed.data.slotDate);
  const now = new Date();
  const slotDateOnly = new Date(slotDateObj.getFullYear(), slotDateObj.getMonth(), slotDateObj.getDate());
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (slotDateOnly.getTime() < todayOnly.getTime()) {
    return badRequest("Pickup slots cannot be created for past dates.");
  }

  if (slotDateOnly.getTime() === todayOnly.getTime()) {
    const endTimeParts = parsed.data.endTime.split(":");
    const endHour = parseInt(endTimeParts[0], 10);
    const endMinute = parseInt(endTimeParts[1], 10);
    
    if (now.getHours() > endHour || (now.getHours() === endHour && now.getMinutes() >= endMinute)) {
      return badRequest("Pickup slots cannot be created for expired time windows today.");
    }
  }

  // Duplicate check
  const isDuplicate = await checkDuplicateSlot(parsed.data.societyId, parsed.data.slotDate, parsed.data.slotWindow);
  if (isDuplicate) {
    return badRequest("A pickup slot already exists for this society, date and time window.");
  }

  const slot = await createManagedSlot(parsed.data);
  return created({ slot });
}

export async function PATCH(request: Request) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());

  const existing = await findSlotById(parsed.data.slotId);
  if (!existing) return notFound("Slot not found");

  const isAdmin = (auth.session.roles ?? []).includes("admin");
  const allowed = (await getOperatorSocieties(auth.session.userId, isAdmin)).map(s => s.id);
  if (!allowed.includes(existing.society_id) && !isAdmin) {
    return forbidden("Society not assigned to this operator");
  }

  const { slotId, ...rest } = parsed.data;
  const slot = await updateManagedSlot(slotId, rest);
  return ok({ slot });
}

export async function DELETE(request: Request) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;

  const slotId = new URL(request.url).searchParams.get("slotId");
  if (!slotId) return badRequest("slotId required");

  const existing = await findSlotById(slotId);
  if (!existing) return notFound("Slot not found");

  const isAdmin = (auth.session.roles ?? []).includes("admin");
  const allowed = (await getOperatorSocieties(auth.session.userId, isAdmin)).map(s => s.id);
  if (!allowed.includes(existing.society_id) && !isAdmin) {
    return forbidden("Society not assigned to this operator");
  }

  const result = await deleteManagedSlot(slotId);
  return ok({ result });
}
