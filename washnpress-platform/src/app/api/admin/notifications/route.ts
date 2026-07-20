import { z } from "zod";
import { requireRole } from "@/backend/api/guards";
import { ok, badRequest, created } from "@/backend/api/response";
import { createBroadcast, listBroadcasts } from "@/backend/repositories/admin-commerce";

export async function GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  return ok({ broadcasts: await listBroadcasts() });
}

const schema = z.object({
  title: z.string().min(2),
  body: z.string().min(2),
  type: z.enum(["system", "maintenance", "offer", "subscription", "order", "emergency"]),
  audience: z.enum(["all_residents", "society", "operator", "resident"]),
  societyId: z.string().uuid().optional(),
  residentId: z.string().uuid().optional(),
  operatorUserId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());
  try {
    const result = await createBroadcast({
      ...parsed.data,
      createdBy: auth.session.userId,
    });
    return created(result);
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Failed to send");
  }
}
