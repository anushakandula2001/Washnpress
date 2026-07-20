import { query, queryOne } from "@/backend/db/pool";
import type { DbResidentProfile } from "@/backend/types";

export async function findResidentProfile(residentId: string) {
  return queryOne<
    DbResidentProfile & {
      resident_code?: string | null;
      email?: string | null;
      gender?: string | null;
      flat_id?: string | null;
      floor_label?: string | null;
      tower_name?: string | null;
      flat_number?: string | null;
    }
  >(
    `SELECT u.id AS user_id, r.id AS resident_id, u.phone, u.full_name,
            r.unit_number, r.tower_block, r.alternate_contact, r.preferred_windows,
            r.society_id, s.name AS society_name, s.city,
            r.resident_code, COALESCE(r.email, u.email) AS email,
            COALESCE(r.gender, u.gender) AS gender, r.flat_id,
            COALESCE(t.name, r.tower_block) AS tower_name,
            fl.label AS floor_label,
            COALESCE(f.flat_number, r.unit_number) AS flat_number
     FROM residents r
     JOIN users u ON u.id = r.user_id
     JOIN societies s ON s.id = r.society_id
     LEFT JOIN society_flats f ON f.id = r.flat_id
     LEFT JOIN society_floors fl ON fl.id = f.floor_id
     LEFT JOIN society_towers t ON t.id = fl.tower_id
     WHERE r.id = $1`,
    [residentId],
  );
}

export async function updateResidentProfile(
  residentId: string,
  data: {
    fullName?: string;
    unitNumber?: string;
    towerBlock?: string;
    alternateContact?: string;
    preferredWindows?: string[];
  },
) {
  if (data.fullName !== undefined) {
    await query(
      `UPDATE users SET full_name = $1, updated_at = now()
       WHERE id = (SELECT user_id FROM residents WHERE id = $2)`,
      [data.fullName, residentId],
    );
  }

  await query(
    `UPDATE residents SET
       unit_number = COALESCE($2, unit_number),
       tower_block = COALESCE($3, tower_block),
       alternate_contact = COALESCE($4, alternate_contact),
       preferred_windows = COALESCE($5, preferred_windows),
       updated_at = now()
     WHERE id = $1`,
    [
      residentId,
      data.unitNumber ?? null,
      data.towerBlock ?? null,
      data.alternateContact ?? null,
      data.preferredWindows ?? null,
    ],
  );

  return findResidentProfile(residentId);
}

export async function findUserByPhone(phone: string) {
  return queryOne<{ id: string; phone: string; full_name: string | null }>(
    `SELECT id, phone, full_name FROM users WHERE phone = $1`,
    [phone],
  );
}

export async function findResidentByUserId(userId: string) {
  return queryOne<{ id: string; society_id: string }>(
    `SELECT id, society_id FROM residents WHERE user_id = $1`,
    [userId],
  );
}
