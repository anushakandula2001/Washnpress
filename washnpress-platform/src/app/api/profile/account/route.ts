import { z } from "zod";
import { requireSession } from "@/backend/api/guards";
import { requestAccountDeletion } from "@/backend/repositories/profile-ext";
import { ok, created } from "@/backend/api/response";

const schema = z.object({ reason: z.string().optional() });

export async function DELETE(request: Request) {
  const auth = await requireSession(request);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  const req = await requestAccountDeletion(auth.session.userId, parsed.success ? parsed.data.reason : undefined);
  return created({ request: req, message: "Deletion request submitted" });
}