import { withErrorHandling } from "@/backend/api/response";
import { requireResident } from "@/backend/api/guards";
import { listReferralHistory } from "@/backend/repositories/referrals";
import { ok } from "@/backend/api/response";

async function _GET(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  return ok({ history: await listReferralHistory(auth.session.residentId!) });
}

export const GET = withErrorHandling(_GET);
