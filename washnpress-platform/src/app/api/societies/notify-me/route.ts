import { z } from "zod";
import { createNotifyRequest } from "@/backend/repositories/societies-ext";
import { ok, badRequest, created } from "@/backend/api/response";

const schema = z.object({
  societyName: z.string().min(1),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  city: z.string().optional(),
  pincode: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());
  const result = await createNotifyRequest(parsed.data);
  return created({ id: result?.id, submitted: true });
}