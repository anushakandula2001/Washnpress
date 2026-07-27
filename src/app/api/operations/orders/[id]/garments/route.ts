import { z } from "zod";
import { requireRole } from "@/backend/api/guards";
import { setOrderGarments } from "@/backend/repositories/orders-ext";
import { ok, badRequest, notFound } from "@/backend/api/response";

const schema = z.object({ items: z.array(z.object({ category: z.string(), quantity: z.number().int().min(0) })) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid items");
  const order = await setOrderGarments(id, parsed.data.items, auth.session.userId);
  if (!order) return notFound("Order not found");
  return ok({ order });
}