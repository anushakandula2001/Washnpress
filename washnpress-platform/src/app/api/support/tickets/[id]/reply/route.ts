import { z } from "zod";
import { requireResident } from "@/backend/api/guards";
import { replyToTicket } from "@/backend/repositories/profile-ext";
import { ok, badRequest } from "@/backend/api/response";

const schema = z.object({ body: z.string().min(1) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Message required");
  await replyToTicket(id, auth.session.userId, parsed.data.body);
  return ok({ sent: true });
}