import { z } from "zod";
import { requireSession } from "@/backend/api/guards";
import { onboardResident } from "@/backend/repositories/auth-ext";
import { ok, badRequest } from "@/backend/api/response";
import { getTokenFromRequest, refreshSessionForToken } from "@/backend/api/session";

const schema = z.object({
  societyId: z.string().uuid(),
  fullName: z.string().min(1),
  unitNumber: z.string().min(1),
  towerBlock: z.string().optional(),
  alternateContact: z.string().optional(),
  preferredWindows: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  const auth = await requireSession(request);
  if ("error" in auth) return auth.error;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());
  const residentId = await onboardResident({ userId: auth.session.userId, ...parsed.data });

  const token = getTokenFromRequest(request);
  let user = auth.session;
  if (token) {
    const refreshed = await refreshSessionForToken(token, auth.session.userId);
    if (refreshed) user = refreshed;
  }

  return ok({ residentId, onboarded: true, user });
}