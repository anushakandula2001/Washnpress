import { z } from "zod";
import { requireResident } from "@/backend/api/guards";
import { findResidentProfile, updateResidentProfile } from "@/backend/repositories/residents";
import { ok, unauthorized, badRequest, notFound } from "@/backend/api/response";

export async function GET(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const session = auth.session;

  const profile = await findResidentProfile(session.residentId!);
  if (!profile) return notFound("Profile not found");

  return ok({
    name: profile.full_name,
    flatNumber: (profile as { flat_number?: string }).flat_number ?? profile.unit_number,
    tower: (profile as { tower_name?: string }).tower_name ?? profile.tower_block,
    floor: (profile as { floor_label?: string }).floor_label ?? null,
    mobile: profile.phone,
    society: profile.society_name,
    city: profile.city,
    alternateContact: profile.alternate_contact,
    preferredWindows: profile.preferred_windows,
    residentCode: (profile as { resident_code?: string }).resident_code ?? null,
    email: (profile as { email?: string }).email ?? null,
    gender: (profile as { gender?: string }).gender ?? null,
    flatId: (profile as { flat_id?: string }).flat_id ?? null,
  });
}

const updateSchema = z.object({
  fullName: z.string().min(1).optional(),
  unitNumber: z.string().min(1).optional(),
  towerBlock: z.string().optional(),
  alternateContact: z.string().regex(/^[6-9]\d{9}$/).optional(),
  preferredWindows: z.array(z.enum(["Morning", "Afternoon", "Evening"])).optional(),
});

export async function PUT(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const session = auth.session;

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());

  const profile = await updateResidentProfile(session.residentId!, {
    fullName: parsed.data.fullName,
    unitNumber: parsed.data.unitNumber,
    towerBlock: parsed.data.towerBlock,
    alternateContact: parsed.data.alternateContact,
    preferredWindows: parsed.data.preferredWindows,
  });

  return ok({ profile });
}
