import { query, queryOne } from "@/backend/db/pool";
import { getFlatHierarchy } from "@/backend/repositories/master-data";

export async function checkPhone(phone: string) {
  const user = await queryOne<{ id: string; full_name: string | null }>(
    `SELECT id, full_name FROM users WHERE phone = $1`,
    [phone],
  );
  if (!user) return { exists: false, isNew: true, roles: [] as string[] };

  const resident = await queryOne<{ id: string }>(
    `SELECT id FROM residents WHERE user_id = $1`,
    [user.id],
  );

  const rolesRow = await queryOne<{ roles: string[] }>(
    `SELECT COALESCE(array_agg(DISTINCT ro.name) FILTER (WHERE ro.name IS NOT NULL), '{}') AS roles
     FROM user_roles ur
     JOIN roles ro ON ro.id = ur.role_id
     WHERE ur.user_id = $1`,
    [user.id],
  );

  return {
    exists: true,
    isNew: !resident,
    hasProfile: Boolean(resident),
    fullName: user.full_name,
    roles: rolesRow?.roles ?? [],
  };
}

export async function nextResidentCode() {
  const row = await queryOne<{ n: string }>(
    `SELECT 'RES-' || LPAD(nextval('resident_code_seq')::text, 6, '0') AS n`,
  );
  return row?.n ?? `RES-${Date.now().toString().slice(-6)}`;
}

export async function onboardResident(data: {
  userId: string;
  societyId: string;
  fullName: string;
  flatId: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  preferredWindows?: string[];
  alternateContact?: string;
}) {
  const hierarchy = await getFlatHierarchy(data.flatId);
  if (!hierarchy) throw new Error("Selected flat was not found");
  if (hierarchy.society_id !== data.societyId) {
    throw new Error("Flat does not belong to the selected society");
  }

  await query(
    `UPDATE users SET full_name = $2, email = COALESCE($3, email),
       gender = COALESCE($4, gender), date_of_birth = COALESCE($5::date, date_of_birth),
       updated_at = now() WHERE id = $1`,
    [
      data.userId,
      data.fullName,
      data.email ?? null,
      data.gender ?? null,
      data.dateOfBirth ?? null,
    ],
  );

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM residents WHERE user_id = $1`,
    [data.userId],
  );

  let residentId: string;

  if (existing) {
    await query(
      `UPDATE residents SET society_id = $2, unit_number = $3, tower_block = $4,
         flat_id = $5, email = $6, gender = $7, date_of_birth = $8::date,
         alternate_contact = $9, preferred_windows = $10, updated_at = now()
       WHERE id = $1`,
      [
        existing.id,
        hierarchy.society_id,
        hierarchy.flat_number,
        hierarchy.tower_name,
        data.flatId,
        data.email ?? null,
        data.gender ?? null,
        data.dateOfBirth ?? null,
        data.alternateContact ?? null,
        data.preferredWindows ?? [],
      ],
    );
    residentId = existing.id;
  } else {
    const residentCode = await nextResidentCode();
    const resident = await queryOne<{ id: string }>(
      `INSERT INTO residents (
         user_id, society_id, unit_number, tower_block, flat_id,
         resident_code, email, gender, date_of_birth,
         alternate_contact, preferred_windows
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::date,$10,$11)
       RETURNING id`,
      [
        data.userId,
        hierarchy.society_id,
        hierarchy.flat_number,
        hierarchy.tower_name,
        data.flatId,
        residentCode,
        data.email ?? null,
        data.gender ?? null,
        data.dateOfBirth ?? null,
        data.alternateContact ?? null,
        data.preferredWindows ?? [],
      ],
    );
    if (!resident) throw new Error("Failed to create resident profile");
    residentId = resident.id;

    await query(
      `INSERT INTO user_roles (user_id, role_id) SELECT $1, id FROM roles WHERE name = 'resident' ON CONFLICT DO NOTHING`,
      [data.userId],
    );

    await query(
      `INSERT INTO profile_settings (resident_id) VALUES ($1) ON CONFLICT DO NOTHING`,
      [residentId],
    );

    await query(
      `INSERT INTO wallets (resident_id, balance_inr) VALUES ($1, 0)
       ON CONFLICT (resident_id) DO NOTHING`,
      [residentId],
    );

    const plan = await queryOne<{ id: string }>(
      `SELECT id FROM plans WHERE is_active = TRUE ORDER BY monthly_inr ASC LIMIT 1`,
    );
    if (plan) {
      await query(
        `INSERT INTO subscriptions (resident_id, plan_id, status, cycle_start, cycle_end, garments_used, auto_renew)
         SELECT $1, $2, 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 0, TRUE
         WHERE NOT EXISTS (
           SELECT 1 FROM subscriptions WHERE resident_id = $1 AND status = 'active'
         )`,
        [residentId, plan.id],
      );
    }

    await query(
      `UPDATE society_flats SET status = 'occupied' WHERE id = $1 AND status = 'active'`,
      [data.flatId],
    );
  }

  return residentId;
}
