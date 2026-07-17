import { query } from "@/backend/db/pool";
import type { DbSociety } from "@/backend/types";

export async function listSocieties(city?: string) {
  const params: unknown[] = [];
  let sql = `SELECT id, name, address_line_1, city, state, pincode, status FROM societies WHERE status = 'active'`;

  if (city) {
    sql += ` AND city ILIKE $1`;
    params.push(`%${city}%`);
  }

  sql += ` ORDER BY name ASC`;

  const result = await query<DbSociety>(sql, params);
  return result.rows;
}

export async function findSocietyById(societyId: string) {
  const result = await query<DbSociety>(
    `SELECT id, name, address_line_1, city, state, pincode, status FROM societies WHERE id = $1`,
    [societyId],
  );
  return result.rows[0] ?? null;
}
