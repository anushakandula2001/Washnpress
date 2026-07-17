import { z } from "zod";
import { checkPhone } from "@/backend/repositories/auth-ext";
import { ok, badRequest } from "@/backend/api/response";

const schema = z.object({ phone: z.string().regex(/^[6-9]\d{9}$/) });

export async function GET(request: Request) {
  const phone = new URL(request.url).searchParams.get("phone");
  const parsed = schema.safeParse({ phone });
  if (!parsed.success) return badRequest("Invalid phone");
  return ok(await checkPhone(parsed.data.phone));
}