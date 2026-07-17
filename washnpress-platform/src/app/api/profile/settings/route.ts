import { z } from "zod";
import { requireResident } from "@/backend/api/guards";
import { getProfileSettings, updateProfileSettings } from "@/backend/repositories/profile-ext";
import { ok } from "@/backend/api/response";

const schema = z.object({
  notificationsEnabled: z.boolean().optional(),
  language: z.enum(["en", "hi"]).optional(),
  marketingOptIn: z.boolean().optional(),
});

export async function GET(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  return ok({ settings: await getProfileSettings(auth.session.residentId!) });
}

export async function PATCH(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return ok({ settings: null });
  const settings = await updateProfileSettings(auth.session.residentId!, parsed.data);
  return ok({ settings });
}