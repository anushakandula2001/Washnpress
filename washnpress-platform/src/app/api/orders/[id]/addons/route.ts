import { z } from "zod";
import { requireResident } from "@/backend/api/guards";
import { addOrderAddons } from "@/backend/repositories/orders-ext";
import { ok, badRequest, notFound } from "@/backend/api/response";
const schema = z.object({ addonIds: z.array(z.string().uuid()) });
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());
  const result = await addOrderAddons(id, auth.session.residentId!, parsed.data.addonIds);
  if (!result) return notFound("Order not found");
  return ok(result);
}