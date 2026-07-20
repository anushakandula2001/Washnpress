import { z } from "zod";
import { requireResident } from "@/backend/api/guards";
import { getOrCreateWallet, listTransactions } from "@/backend/repositories/wallet";
import { formatWalletDate } from "@/backend/api/transformers";
import { ok, unauthorized } from "@/backend/api/response";

export async function GET(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const session = auth.session;

  const wallet = await getOrCreateWallet(session.residentId!);
  const transactions = await listTransactions(wallet.id);

  return ok({
    balance: parseFloat(wallet.balance_inr),
    transactions: transactions.map((t) => ({
      id: t.id,
      type: t.type as "credit" | "debit",
      description: t.description,
      date: formatWalletDate(t.created_at),
      amountInr: parseFloat(t.amount_inr),
    })),
  });
}

const topupSchema = z.object({
  amount: z.number().positive().max(50000),
});

export async function POST(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const session = auth.session;

  const body = await request.json();
  const parsed = topupSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "Invalid amount" }, { status: 400 });
  }

  const { addWalletCredit } = await import("@/backend/repositories/wallet");
  const wallet = await addWalletCredit(
    session.residentId!,
    parsed.data.amount,
    "Added to Wallet",
    "topup",
  );

  return ok({ balance: parseFloat(wallet.balance_inr) });
}
