import { query, queryOne } from "@/backend/db/pool";

export async function listSocietiesNearby(lat: number, lng: number, radiusKm = 5) {
  const result = await query<{
    id: string;
    name: string;
    address_line_1: string | null;
    city: string;
    status: string;
    latitude: string | null;
    longitude: string | null;
    distance_km: string;
  }>(
    `SELECT id, name, address_line_1, city, status, latitude::text, longitude::text,
            ROUND(distance::numeric, 2)::text AS distance_km
     FROM (
       SELECT *,
         6371 * acos(LEAST(1.0, GREATEST(-1.0,
           cos(radians($1)) * cos(radians(latitude)) *
           cos(radians(longitude) - radians($2)) +
           sin(radians($1)) * sin(radians(latitude))
         ))) AS distance
       FROM societies
       WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND status = 'active'
     ) s
     WHERE distance <= $3
     ORDER BY distance ASC`,
    [lat, lng, radiusKm],
  );
  return result.rows;
}

export async function createNotifyRequest(data: {
  societyName: string;
  phone: string;
  city?: string;
  pincode?: string;
}) {
  return queryOne<{ id: string }>(
    `INSERT INTO society_notify_requests (society_name, phone, city, pincode)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [data.societyName, data.phone, data.city ?? null, data.pincode ?? null],
  );
}
