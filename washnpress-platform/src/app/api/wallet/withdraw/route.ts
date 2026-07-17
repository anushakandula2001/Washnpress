import { z } from "zod";
import { requireResident } from "@/backend/api/guards";
import { debitWallet } from "@/backend/repositories/wallet";
import { ok, badRequest } from "@/backend/api/response";

const schema = z.object({ amount: z.number().positive() });

export async function POST(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid amount");
  try {
    const wallet = await debitWallet(auth.session.residentId!, parsed.data.amount, "Wallet withdrawal");
    return ok({ balance: parseFloat(wallet.balance_inr) });
  } catch (e) {
    return badRequest(e instanceof Error ? e.message : "Withdrawal failed");
  }
}