import { z } from "zod";
import { requireRole } from "@/backend/api/guards";
import { ok, badRequest, created, notFound, forbidden } from "@/backend/api/response";
import {
  createManagedSlot,
  updateManagedSlot,
  deleteManagedSlot,
  listAllSlotsBySociety,
  findSlotById,
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

async function operatorSocietyIds(userId: string, isAdmin: boolean) {
  if (isAdmin) {
    const all = await query<{ id: string }>(`SELECT id FROM societies ORDER BY name`);
    return all.rows.map((r) => r.id);
  }

  const op = await getOperatorByUserId(userId);
  if (!op) return [];

  const assigned = await query<{ society_id: string }>(
    `SELECT society_id FROM operator_societies WHERE operator_id = $1`,
    [op.id],
  );
  if (assigned.rows.length > 0) return assigned.rows.map((r) => r.society_id);

  if (op.unit_id) {
    const unit = await query<{ society_id: string }>(
      `SELECT society_id FROM units WHERE id = $1`,
      [op.unit_id],
    );
    return unit.rows.map((r) => r.society_id);
  }
  return [];
}

export async function GET(request: Request) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;

  const isAdmin = auth.session.roles.includes("admin");
  const allowed = await operatorSocietyIds(auth.session.userId, isAdmin);
  const societyId = new URL(request.url).searchParams.get("societyId");

  if (societyId) {
    if (!allowed.includes(societyId) && !isAdmin) {
      return forbidden("Society not assigned to this operator");
    }
    const slots = await listAllSlotsBySociety(societyId);
    return ok({ slots, societyIds: allowed });
  }

  const slots = [];
  for (const id of allowed) {
    slots.push(...(await listAllSlotsBySociety(id)));
  }
  return ok({ slots, societyIds: allowed });
}

export async function POST(request: Request) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());

  const isAdmin = auth.session.roles.includes("admin");
  const allowed = await operatorSocietyIds(auth.session.userId, isAdmin);
  if (!allowed.includes(parsed.data.societyId) && !isAdmin) {
    return forbidden("Society not assigned to this operator");
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

  const isAdmin = auth.session.roles.includes("admin");
  const allowed = await operatorSocietyIds(auth.session.userId, isAdmin);
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

  const isAdmin = auth.session.roles.includes("admin");
  const allowed = await operatorSocietyIds(auth.session.userId, isAdmin);
  if (!allowed.includes(existing.society_id) && !isAdmin) {
    return forbidden("Society not assigned to this operator");
  }

  const result = await deleteManagedSlot(slotId);
  return ok({ result });
}
