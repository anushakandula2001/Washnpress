import { z } from "zod";
import { requireRole } from "@/backend/api/guards";
import { updateOrderStatus } from "@/backend/repositories/orders-ext";
import { ok, badRequest, notFound } from "@/backend/api/response";

const schema = z.object({ status: z.string().min(1) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("status required");
  const order = await updateOrderStatus(id, parsed.data.status, auth.session.userId);
  if (!order) return notFound("Order not found");
  return ok({ order });
}