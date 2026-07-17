import { query, queryOne } from "@/backend/db/pool";

export async function getReferralCode(residentId: string) {
  let ref = await queryOne<{ id: string; code: string; total_earned_inr: string }>(
    `SELECT id, code, total_earned_inr::text FROM referrals WHERE resident_id = $1`,
    [residentId],
  );
  if (!ref) {
    const code = `WN${residentId.slice(0, 6).toUpperCase()}`;
    ref = await queryOne(
      `INSERT INTO referrals (resident_id, code) VALUES ($1, $2) RETURNING id, code, total_earned_inr::text`,
      [residentId, code],
    );
  }
  return ref;
}

export async function applyReferral(code: string, referredResidentId: string) {
  const ref = await queryOne<{ id: string; resident_id: string }>(
    `SELECT id, resident_id FROM referrals WHERE code = $1`,
    [code],
  );
  if (!ref || ref.resident_id === referredResidentId) {
    throw new Error("Invalid referral code");
  }
  await query(
    `INSERT INTO referral_redemptions (referral_id, referred_resident_id) VALUES ($1, $2)`,
    [ref.id, referredResidentId],
  );
  await query(
    `UPDATE referrals SET total_earned_inr = total_earned_inr + 100 WHERE id = $1`,
    [ref.id],
  );
  return { applied: true, bonusInr: 100 };
}

export async function listReferralHistory(residentId: string) {
  const ref = await queryOne<{ id: string }>(`SELECT id FROM referrals WHERE resident_id = $1`, [
    residentId,
  ]);
  if (!ref) return [];
  const result = await query(
    `SELECT rr.*, r.unit_number FROM referral_redemptions rr
     JOIN residents r ON r.id = rr.referred_resident_id
     WHERE rr.referral_id = $1 ORDER BY rr.created_at DESC`,
    [ref.id],
  );
  return result.rows;
}

export async function listWalletTransactionsPaginated(
  residentId: string,
  page = 1,
  limit = 20,
) {
  const offset = (page - 1) * limit;
  const result = await query(
    `SELECT wt.* FROM wallet_transactions wt
     JOIN wallets w ON w.id = wt.wallet_id
     WHERE w.resident_id = $1
     ORDER BY wt.created_at DESC LIMIT $2 OFFSET $3`,
    [residentId, limit, offset],
  );
  return { transactions: result.rows, page, limit };
}
