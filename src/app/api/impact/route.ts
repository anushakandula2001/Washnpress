import { requireResident } from "@/backend/api/guards";
import { getResidentImpact } from "@/backend/repositories/profile-ext";
import { ok } from "@/backend/api/response";

export async function GET(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  return ok(await getResidentImpact(auth.session.residentId!));
}