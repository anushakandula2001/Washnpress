import { requireResident } from "@/backend/api/guards";
import { listReferralHistory } from "@/backend/repositories/referrals";
import { ok } from "@/backend/api/response";

export async function GET(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  return ok({ history: await listReferralHistory(auth.session.residentId!) });
}