import { z } from "zod";
import { requireResident } from "@/backend/api/guards";
import { setOrderInstructions } from "@/backend/repositories/orders-ext";
import { ok, badRequest, notFound } from "@/backend/api/response";
const schema = z.object({ instructions: z.string().min(1) });
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());
  const order = await setOrderInstructions(id, auth.session.residentId!, parsed.data.instructions);
  if (!order) return notFound("Order not found");
  return ok({ order });
}