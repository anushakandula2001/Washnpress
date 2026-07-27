import { query, queryOne } from "@/backend/db/pool";
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

export async function findSocietyByNameAndCity(name: string, city: string) {
  return queryOne<DbSociety>(
    `SELECT id, name, address_line_1, city, state, pincode, status
     FROM societies
     WHERE lower(trim(name)) = lower(trim($1))
       AND lower(trim(city)) = lower(trim($2))
     LIMIT 1`,
    [name, city],
  );
}

export async function findOrCreateSociety(data: {
  name: string;
  city: string;
  state: string;
  pincode?: string;
  addressLine1?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
}) {
  const existing = await findSocietyByNameAndCity(data.name, data.city);
  if (existing) {
    await query(
      `UPDATE societies SET
         state = COALESCE(NULLIF($2, ''), state),
         pincode = COALESCE(NULLIF($3, ''), pincode),
         address_line_1 = COALESCE(NULLIF($4, ''), address_line_1),
         latitude = COALESCE($5, latitude),
         longitude = COALESCE($6, longitude),
         updated_at = now()
       WHERE id = $1`,
      [
        existing.id,
        data.state,
        data.pincode ?? null,
        data.addressLine1 ?? data.landmark ?? null,
        data.latitude ?? null,
        data.longitude ?? null,
      ],
    );
    return existing;
  }

  const created = await queryOne<DbSociety>(
    `INSERT INTO societies (name, address_line_1, city, state, pincode, status, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5, 'active', $6, $7)
     RETURNING id, name, address_line_1, city, state, pincode, status`,
    [
      data.name.trim(),
      data.addressLine1 ?? data.landmark ?? null,
      data.city.trim(),
      data.state.trim(),
      data.pincode ?? null,
      data.latitude ?? null,
      data.longitude ?? null,
    ],
  );
  if (!created) throw new Error("Failed to create society");
  return created;
}
