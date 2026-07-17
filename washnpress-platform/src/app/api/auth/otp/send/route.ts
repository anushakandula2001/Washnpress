import { cookies } from "next/headers";
import { otpSendSchema, sendOtp } from "@/backend/services/auth-service";
import { ok, badRequest, serverError } from "@/backend/api/response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = otpSendSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());

    const result = await sendOtp(parsed.data.phone);
    return ok(result);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Failed to send OTP");
  }
}
