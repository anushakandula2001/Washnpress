import { z } from "zod";
import { requireRole } from "@/backend/api/guards";
import { isOtpUsable } from "@/lib/domain";
import { ok, badRequest } from "@/backend/api/response";

const schema = z.object({ otp: z.string(), issuedAtIso: z.string(), attempts: z.number().default(0) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(request, "operator");
  if ("error" in auth) return auth.error;
  await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid OTP data");
  const check = isOtpUsable(parsed.data.otp, parsed.data.issuedAtIso, parsed.data.attempts);
  if (!check.ok) return badRequest(check.reason ?? "OTP invalid");
  return ok({ verified: true });
}