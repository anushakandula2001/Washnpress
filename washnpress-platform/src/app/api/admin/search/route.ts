import { requireRole } from "@/backend/api/guards";
import { ok } from "@/backend/api/response";
import { query } from "@/backend/db/pool";

export async function GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  if (!q || q.length < 2) {
    return ok({ results: [] });
  }

  const likeQuery = `%${q}%`;
  const results: any[] = [];

  try {
    // Search Societies
    const societies = await query(
      `SELECT id, name, city, state FROM societies WHERE name ILIKE $1 OR city ILIKE $1 LIMIT 4`,
      [likeQuery]
    );
    for (const row of societies.rows) {
      results.push({
        type: "society",
        id: row.id,
        title: row.name,
        subtitle: `Society • ${row.city}, ${row.state}`,
        href: `/admin/societies?q=${encodeURIComponent(row.name)}`,
      });
    }

    // Search Residents
    const residents = await query(
      `SELECT r.id, u.full_name, u.phone, r.tower_block, r.unit_number 
       FROM residents r 
       JOIN users u ON u.id = r.user_id 
       WHERE u.full_name ILIKE $1 OR u.phone ILIKE $1 OR u.email ILIKE $1 LIMIT 4`,
      [likeQuery]
    );
    for (const row of residents.rows) {
      results.push({
        type: "resident",
        id: row.id,
        title: row.full_name,
        subtitle: `Resident • Cell: ${row.phone} • Flat ${row.tower_block ?? ""}-${row.unit_number}`,
        href: `/admin/residents?q=${encodeURIComponent(row.phone)}`,
      });
    }

    // Search Operators
    const operators = await query(
      `SELECT op.id, u.full_name, u.phone, op.operator_code 
       FROM operators op 
       JOIN users u ON u.id = op.user_id 
       WHERE u.full_name ILIKE $1 OR u.phone ILIKE $1 OR u.email ILIKE $1 OR op.operator_code ILIKE $1 LIMIT 4`,
      [likeQuery]
    );
    for (const row of operators.rows) {
      results.push({
        type: "operator",
        id: row.id,
        title: row.full_name,
        subtitle: `Operator (${row.operator_code ?? "N/A"}) • Cell: ${row.phone}`,
        href: `/admin/operators?q=${encodeURIComponent(row.full_name)}`,
      });
    }

    // Search Orders
    const orders = await query(
      `SELECT o.id, o.order_code, o.status, u.full_name AS resident_name
       FROM orders o
       JOIN pickups p ON p.id = o.pickup_id
       JOIN residents r ON r.id = p.resident_id
       JOIN users u ON u.id = r.user_id
       WHERE o.order_code ILIKE $1 LIMIT 4`,
      [likeQuery]
    );
    for (const row of orders.rows) {
      results.push({
        type: "order",
        id: row.id,
        title: `Order ${row.order_code}`,
        subtitle: `Order • Status: ${row.status} • Res: ${row.resident_name}`,
        href: `/admin/orders?q=${encodeURIComponent(row.order_code)}`,
      });
    }
  } catch (error) {
    console.error("Global search error:", error);
  }

  return ok({ results });
}
