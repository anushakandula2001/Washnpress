import { cookies } from "next/headers";
import { otpVerifySchema, verifyOtp } from "@/backend/services/auth-service";
import { ok, badRequest } from "@/backend/api/response";
import { SESSION_COOKIE } from "@/backend/api/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = otpVerifySchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());

    const result = await verifyOtp(parsed.data.phone, parsed.data.otp);
    const { token, ...user } = result as typeof result & { token: string };

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return ok({ user });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "OTP verification failed");
  }
}
