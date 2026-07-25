import { requireResident } from "@/backend/api/guards";
import { listInvoices } from "@/backend/repositories/billing-ext";
import { ok } from "@/backend/api/response";

export async function GET(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);
  return ok(await listInvoices(auth.session.residentId!, page, limit));
}