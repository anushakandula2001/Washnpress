import { z } from "zod";
import { requireRole } from "@/backend/api/guards";
import { logOrderWater } from "@/backend/repositories/orders-ext";
import { ok, badRequest, notFound, created } from "@/backend/api/response";

const schema = z.object({ garmentCount: z.number().int().min(0), actualLiters: z.number().min(0) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid data");
  const log = await logOrderWater(id, parsed.data.garmentCount, parsed.data.actualLiters);
  if (!log) return notFound("Order not found");
  return created({ waterLog: log });
}