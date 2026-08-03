import { withErrorHandling } from "@/backend/api/response";
import { requireResident } from "@/backend/api/guards";
import { getReferralCode } from "@/backend/repositories/referrals";
import { ok } from "@/backend/api/response";

async function _GET(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const ref = await getReferralCode(auth.session.residentId!);
  return ok({ code: ref?.code, totalEarned: parseFloat(ref?.total_earned_inr ?? "0") });
}

export const GET = withErrorHandling(_GET);
