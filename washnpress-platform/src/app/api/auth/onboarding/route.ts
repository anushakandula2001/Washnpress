import { z } from "zod";
import { requireSession } from "@/backend/api/guards";
import { onboardResident } from "@/backend/repositories/auth-ext";
import { ok, badRequest } from "@/backend/api/response";
import { getTokenFromRequest, refreshSessionForToken } from "@/backend/api/session";

const schema = z.object({
  societyId: z.string().uuid(),
  flatId: z.string().uuid(),
  fullName: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  dateOfBirth: z.string().optional(),
  preferredWindows: z.array(z.enum(["Morning", "Afternoon", "Evening"])).optional(),
  alternateContact: z
    .string()
    .regex(/^[6-9]\d{9}$/)
    .optional()
    .or(z.literal("")),
});

export async function POST(request: Request) {
  const auth = await requireSession(request);
  if ("error" in auth) return auth.error;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());

  try {
    const residentId = await onboardResident({
      userId: auth.session.userId,
      societyId: parsed.data.societyId,
      flatId: parsed.data.flatId,
      fullName: parsed.data.fullName,
      email: parsed.data.email || undefined,
      gender: parsed.data.gender,
      dateOfBirth: parsed.data.dateOfBirth || undefined,
      preferredWindows: parsed.data.preferredWindows,
      alternateContact: parsed.data.alternateContact || undefined,
    });

    const token = getTokenFromRequest(request);
    let user = auth.session;
    if (token) {
      const refreshed = await refreshSessionForToken(token, auth.session.userId);
      if (refreshed) user = refreshed;
    }

    return ok({ residentId, onboarded: true, user });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Onboarding failed");
  }
}
