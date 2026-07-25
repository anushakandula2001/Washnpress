import { requireResident } from "@/backend/api/guards";
import { getReferralCode } from "@/backend/repositories/referrals";
import { ok } from "@/backend/api/response";

export async function GET(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const ref = await getReferralCode(auth.session.residentId!);
  return ok({ code: ref?.code, totalEarned: parseFloat(ref?.total_earned_inr ?? "0") });
}