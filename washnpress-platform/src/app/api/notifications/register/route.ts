import { z } from "zod";
import { requireSession } from "@/backend/api/guards";
import { registerPushToken } from "@/backend/repositories/profile-ext";
import { ok, badRequest, created } from "@/backend/api/response";

const schema = z.object({ token: z.string().min(1), platform: z.enum(["web", "ios", "android"]).optional() });

export async function POST(request: Request) {
  const auth = await requireSession(request);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("token required");
  const reg = await registerPushToken(auth.session.userId, parsed.data.token, parsed.data.platform);
  return created({ registration: reg });
}