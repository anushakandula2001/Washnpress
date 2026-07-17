import { query, queryOne } from "@/backend/db/pool";

export async function checkPhone(phone: string) {
  const user = await queryOne<{ id: string; full_name: string | null }>(
    `SELECT id, full_name FROM users WHERE phone = $1`,
    [phone],
  );
  if (!user) return { exists: false, isNew: true };

  const resident = await queryOne<{ id: string }>(
    `SELECT id FROM residents WHERE user_id = $1`,
    [user.id],
  );

  return {
    exists: true,
    isNew: !resident,
    hasProfile: Boolean(resident),
    fullName: user.full_name,
  };
}

export async function onboardResident(data: {
  userId: string;
  societyId: string;
  fullName: string;
  unitNumber: string;
  towerBlock?: string;
  alternateContact?: string;
  preferredWindows?: string[];
}) {
  await query(`UPDATE users SET full_name = $2, updated_at = now() WHERE id = $1`, [
    data.userId,
    data.fullName,
  ]);

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM residents WHERE user_id = $1`,
    [data.userId],
  );

  if (existing) {
    await query(
      `UPDATE residents SET society_id = $2, unit_number = $3, tower_block = $4,
       alternate_contact = $5, preferred_windows = $6, updated_at = now() WHERE id = $1`,
      [
        existing.id,
        data.societyId,
        data.unitNumber,
        data.towerBlock ?? null,
        data.alternateContact ?? null,
        data.preferredWindows ?? [],
      ],
    );
    return existing.id;
  }

  const resident = await queryOne<{ id: string }>(
    `INSERT INTO residents (user_id, society_id, unit_number, tower_block, alternate_contact, preferred_windows)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [
      data.userId,
      data.societyId,
      data.unitNumber,
      data.towerBlock ?? null,
      data.alternateContact ?? null,
      data.preferredWindows ?? [],
    ],
  );

  await query(
    `INSERT INTO user_roles (user_id, role_id) SELECT $1, 1 ON CONFLICT DO NOTHING`,
    [data.userId],
  );

  await query(
    `INSERT INTO profile_settings (resident_id) VALUES ($1) ON CONFLICT DO NOTHING`,
    [resident!.id],
  );

  return resident!.id;
}
