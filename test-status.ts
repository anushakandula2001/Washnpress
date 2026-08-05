import { query } from "./src/backend/db/pool";

async function run() {
  const o = await query("SELECT id, order_code, status FROM orders LIMIT 1");
  if (!o.rows[0]) return;
  const order = o.rows[0];
  console.log("Order:", order);
  const ev = await query("SELECT * FROM order_events WHERE order_id = $1 ORDER BY created_at ASC", [order.id]);
  console.log("Events:", ev.rows);
  process.exit(0);
}
run();
