import { requireResident } from "@/backend/api/guards";
import { listWalletTransactionsPaginated } from "@/backend/repositories/referrals";
import { formatWalletDate } from "@/backend/api/transformers";
import { ok } from "@/backend/api/response";

export async function GET(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const data = await listWalletTransactionsPaginated(auth.session.residentId!, page);
  return ok({
    transactions: (data.transactions as Array<{ id: string; type: string; description: string; amount_inr: string; created_at: string }>).map((t) => ({
      id: t.id, type: t.type, description: t.description,
      amountInr: parseFloat(t.amount_inr), date: formatWalletDate(t.created_at),
    })),
    page: data.page, limit: data.limit,
  });
}