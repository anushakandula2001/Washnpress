import { z } from "zod";
import { requireRole } from "@/backend/api/guards";
import { scanOrderQr } from "@/backend/repositories/orders-ext";
import { ok, badRequest, notFound } from "@/backend/api/response";

const schema = z.object({ qrCode: z.string().min(1) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("qrCode required");
  const order = await scanOrderQr(id, parsed.data.qrCode, auth.session.userId);
  if (!order) return notFound("Order not found");
  return ok({ order });
}