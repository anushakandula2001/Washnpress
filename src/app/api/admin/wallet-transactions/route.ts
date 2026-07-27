import { requireRole } from "@/backend/api/guards";
import { ok } from "@/backend/api/response";
import { query } from "@/backend/db/pool";

export async function GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;

  const transactions = (
    await query(
      `SELECT wt.id, wt.type, wt.description, wt.amount_inr::float, wt.created_at,
              w.balance_inr::float AS wallet_balance,
              r.id AS resident_id, u.full_name, u.phone
       FROM wallet_transactions wt
       JOIN wallets w ON w.id = wt.wallet_id
       JOIN residents r ON r.id = w.resident_id
       JOIN users u ON u.id = r.user_id
       ORDER BY wt.created_at DESC
       LIMIT 200`,
    )
  ).rows;

  return ok({ transactions, total: transactions.length });
}
