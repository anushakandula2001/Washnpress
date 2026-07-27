import { query, queryOne } from "@/backend/db/pool";
import type { DbWallet, DbWalletTransaction } from "@/backend/types";

export async function getOrCreateWallet(residentId: string) {
  let wallet = await queryOne<DbWallet>(
    `SELECT id, balance_inr FROM wallets WHERE resident_id = $1`,
    [residentId],
  );

  if (!wallet) {
    wallet = await queryOne<DbWallet>(
      `INSERT INTO wallets (resident_id, balance_inr) VALUES ($1, 0) RETURNING id, balance_inr`,
      [residentId],
    );
  }

  return wallet!;
}

export async function listTransactions(walletId: string, limit = 50) {
  const result = await query<DbWalletTransaction>(
    `SELECT id, type, description, amount_inr, created_at
     FROM wallet_transactions WHERE wallet_id = $1
     ORDER BY created_at DESC LIMIT $2`,
    [walletId, limit],
  );
  return result.rows;
}

export async function addWalletCredit(
  residentId: string,
  amount: number,
  description: string,
  referenceType?: string,
  referenceId?: string,
) {
  const wallet = await getOrCreateWallet(residentId);

  await query(
    `UPDATE wallets SET balance_inr = balance_inr + $2, updated_at = now() WHERE id = $1`,
    [wallet.id, amount],
  );

  await query(
    `INSERT INTO wallet_transactions (wallet_id, type, description, amount_inr, reference_type, reference_id)
     VALUES ($1, 'credit', $2, $3, $4, $5)`,
    [wallet.id, description, amount, referenceType ?? null, referenceId ?? null],
  );

  return getOrCreateWallet(residentId);
}

export async function debitWallet(
  residentId: string,
  amount: number,
  description: string,
  referenceType?: string,
  referenceId?: string,
) {
  const wallet = await getOrCreateWallet(residentId);
  const balance = parseFloat(wallet.balance_inr);

  if (balance < amount) {
    throw new Error("Insufficient wallet balance");
  }

  await query(
    `UPDATE wallets SET balance_inr = balance_inr - $2, updated_at = now() WHERE id = $1`,
    [wallet.id, amount],
  );

  await query(
    `INSERT INTO wallet_transactions (wallet_id, type, description, amount_inr, reference_type, reference_id)
     VALUES ($1, 'debit', $2, $3, $4, $5)`,
    [wallet.id, description, amount, referenceType ?? null, referenceId ?? null],
  );

  return getOrCreateWallet(residentId);
}
